#!/usr/bin/env python3
"""Scaffold Admin DSL React widgets from widget-IR YAML files.

The widget IR YAML files under `sources/admin-dsl-widget-ir/` are intentionally
semi-formal: many prop contracts are TypeScript snippets preserved from the
Markdown design document. This tool consumes those artifacts and creates a first
pass of final-code scaffolding:

- one directory per widget;
- `<Widget>.types.ts` containing the prop contract snippet;
- `<Widget>.tsx` containing a compile-safe placeholder component;
- `<Widget>.stories.tsx` containing one Storybook export per planned story;
- `index.ts` barrel file;
- shared widget/action/context types under `widgets/shared/`.

It does not implement the final visual components. It creates deterministic,
reviewable file scaffolds so follow-up passes or humans can fill in the bodies.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

REPO_ROOT_DEFAULT = Path(__file__).resolve().parents[6]
DEFAULT_WIDGET_ROOT = Path("web/src/admin-dsl/widgets")

LEVEL_DIRS = {
    "atom": "atoms",
    "molecule": "molecules",
    "organism": "organisms",
}

SHARED_TYPES = '''import type { CSSProperties } from "react";

export interface ActionViewModel {
  id?: string;
  type: "open" | "close" | "navigate" | "mutation" | "confirm" | "refresh" | "upload";
  target: string;
  label: string;
  intent?: "neutral" | "primary" | "danger";
  priority?: "primary" | "secondary" | "tertiary";
  presentation?: "button" | "icon" | "menuItem" | "overflow" | "link";
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: string;
  action?: ActionViewModel;
  [key: string]: unknown;
}

export interface SidebarNavProps {
  activeItemId?: string;
  items: SidebarNavItem[];
}

export interface CommonWidgetProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
  density?: "compact" | "normal" | "spacious";
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  dataAttributes?: Record<string, string | number | boolean>;
}

export type PageActionHandler = (action: ActionViewModel, context: {
  pageId?: string;
}) => void;

export type PanelActionHandler = (action: ActionViewModel, context: {
  panelId?: string;
}) => void;

export type TableRowActionHandler<Row> = (action: ActionViewModel, context: {
  tableId: string;
  row: Row;
  rowId?: string;
}) => void;

export type TableBulkActionHandler<Row> = (action: ActionViewModel, context: {
  tableId: string;
  scope: "visible" | "selected" | "allMatching";
  rows: Row[];
  selectedRowIds: string[];
}) => void;

export type FormActionHandler<Values> = (action: ActionViewModel, context: {
  formId: string;
  values: Values;
}) => void;

export type CalendarCellActionHandler = (action: ActionViewModel, context: {
  calendarId: string;
  date: string;
}) => void;
'''


@dataclass
class ScaffoldPlan:
    name: str
    props_type: str
    output_dir: Path
    level: str
    category: str
    source_yaml: Path
    current_source: str
    classification: dict[str, Any]
    purpose: str | None
    human_notes: dict[str, Any]
    props_snippet: str
    stories: list[str]
    action_slots: list[Any]
    xxx: list[str]
    repo_root: Path
    script_path: Path
    generated_at: str


def pascal_case(value: str) -> str:
    parts = re.split(r"[^A-Za-z0-9]+", value)
    return "".join(part[:1].upper() + part[1:] for part in parts if part)


def story_export_name(value: str) -> str:
    name = pascal_case(value)
    if not name:
        name = "Default"
    if name[0].isdigit():
        name = f"Story{name}"
    return name


def widget_level(widget: dict[str, Any]) -> str:
    classification = widget.get("classification") or {}
    level = classification.get("level") if isinstance(classification, dict) else None
    return str(level or "molecule")


def infer_output_dir(widget: dict[str, Any], widget_root: Path, repo_root: Path) -> Path:
    """Infer a one-directory-per-widget output location.

    The YAML currently contains Markdown-derived `file_layout` blocks. When a
    layout block already names `web/src/admin-dsl/widgets/.../<Widget>/`, use it.
    For internal ResourceTable parts, normalize to one directory per part under
    `ResourceTable/parts/<Widget>/`. Otherwise fall back to classification.
    """
    name = str(widget["name"])
    layout = str(widget.get("file_layout") or "")

    for raw_line in layout.splitlines():
        line = raw_line.strip()
        if line.startswith("web/src/admin-dsl/widgets/") and line.endswith("/"):
            return repo_root / line.rstrip("/")

    if "ResourceTable/parts" in layout:
        return widget_root / "organisms" / "ResourceTable" / "parts" / name

    match = re.search(r"(atoms|molecules|organisms)/(.+?)(?:/|$)", layout)
    if match:
        base = widget_root / match.group(1)
        remainder = match.group(2).strip("/")
        if remainder.endswith(".tsx"):
            return base / Path(remainder).stem
        if remainder:
            return base / remainder

    level_dir = LEVEL_DIRS.get(widget_level(widget), "molecules")
    return widget_root / level_dir / name


def props_type_name(widget_name: str, props_snippet: str) -> str:
    preferred = f"{widget_name}Props"
    if re.search(rf"\binterface\s+{re.escape(preferred)}\b", props_snippet):
        return preferred
    interfaces = re.findall(r"\binterface\s+([A-Za-z0-9_]+)", props_snippet)
    if interfaces:
        return interfaces[-1]
    return preferred


def normalize_stories(widget: dict[str, Any]) -> list[str]:
    stories = widget.get("storybook_stories") or []
    if not isinstance(stories, list):
        return ["Default"]
    clean = [str(story).split("/")[-1] for story in stories if str(story).strip()]
    return clean or ["Default"]


def collect_plans(input_files: list[Path], widget_root: Path, repo_root: Path, names: set[str] | None, generated_at: str) -> list[ScaffoldPlan]:
    plans: list[ScaffoldPlan] = []
    script_path = Path(__file__).resolve()
    for input_file in input_files:
        with input_file.open("r", encoding="utf-8") as handle:
            data = yaml.safe_load(handle)
        category = str(data.get("category") or input_file.stem)
        widgets = data.get("widgets") or []
        if not isinstance(widgets, list):
            continue
        for widget in widgets:
            if not isinstance(widget, dict):
                continue
            name = str(widget.get("name") or "").strip()
            if not name or (names and name not in names):
                continue
            props_snippet = str(widget.get("props") or widget.get("shared_props") or "").strip()
            # Some aggregate entries, such as "Field widgets", contain nested
            # widget tables rather than one component contract. Skip those in
            # this scaffold pass.
            if not props_snippet or " " in name:
                print(f"SKIP {name or '<unnamed>'}: no direct props snippet", file=sys.stderr)
                continue
            output_dir = infer_output_dir(widget, widget_root, repo_root)
            plans.append(ScaffoldPlan(
                name=name,
                props_type=props_type_name(name, props_snippet),
                output_dir=output_dir,
                level=widget_level(widget),
                category=category,
                source_yaml=input_file,
                current_source=str(widget.get("current_source") or ""),
                classification=widget.get("classification") if isinstance(widget.get("classification"), dict) else {"level": widget_level(widget)},
                purpose=str(widget.get("purpose") or "") or None,
                human_notes=widget.get("human_notes") if isinstance(widget.get("human_notes"), dict) else {},
                props_snippet=props_snippet,
                stories=normalize_stories(widget),
                action_slots=list(widget.get("action_slots") or []),
                xxx=[str(item) for item in (widget.get("xxx") or [])],
                repo_root=repo_root,
                script_path=script_path,
                generated_at=generated_at,
            ))
    return plans


def shared_import_path(output_dir: Path, widget_root: Path) -> str:
    rel = Path("shared") / "types"
    # Use os.path.relpath semantics via pathlib by comparing absolute paths.
    target = widget_root / rel
    relative = Path(__import__("os").path.relpath(target, output_dir)).with_suffix("")
    text = relative.as_posix()
    if not text.startswith("."):
        text = "./" + text
    return text


def strip_code_extension(path: Path) -> Path:
    if path.suffix in {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}:
        return path.with_suffix("")
    return path


def import_path_between(source_dir: Path, target_file_no_ext: Path) -> str:
    relative = strip_code_extension(Path(__import__("os").path.relpath(target_file_no_ext, source_dir)))
    text = relative.as_posix()
    if not text.startswith("."):
        text = "./" + text
    return text


def git_last_commit(repo_root: Path, path: Path) -> str:
    try:
        rel = path.resolve().relative_to(repo_root.resolve())
    except ValueError:
        rel = path
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%h %cI %s", "--", rel.as_posix()],
            cwd=repo_root,
            check=False,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
    except OSError:
        return "unknown (git unavailable)"
    value = result.stdout.strip()
    return value or "none (untracked or no history)"


def relpath(path: Path, repo_root: Path) -> str:
    try:
        return path.resolve().relative_to(repo_root.resolve()).as_posix()
    except ValueError:
        return path.as_posix()


def ts_header(plan: ScaffoldPlan, target_file: Path) -> str:
    source_commit = git_last_commit(plan.repo_root, plan.source_yaml)
    target_previous_commit = git_last_commit(plan.repo_root, target_file)
    return f'''/**
 * GENERATED SCAFFOLD — DO NOT TREAT AS FINISHED IMPLEMENTATION.
 *
 * Generated by: {relpath(plan.script_path, plan.repo_root)}
 * Generated at: {plan.generated_at}
 * Source YAML: {relpath(plan.source_yaml, plan.repo_root)}
 * Source YAML last commit: {source_commit}
 * Target file previous commit: {target_previous_commit}
 *
 * This header is the first changelog entry for this generated scaffold. When a
 * human replaces generated placeholders, keep the generated provenance above and
 * add implementation notes below it rather than deleting the history.
 */
'''


def comment_lines(value: Any, indent: str = " * ") -> list[str]:
    if value is None or value == "":
        return []
    if isinstance(value, (dict, list)):
        text = json.dumps(value, indent=2, ensure_ascii=False)
    else:
        text = str(value)
    return [f"{indent}{line}" if line else indent.rstrip() for line in text.splitlines()]


def widget_ir_comment(plan: ScaffoldPlan) -> str:
    lines = ["/**", f" * Widget IR: {plan.name}", f" * Category: {plan.category}", f" * Classification: {json.dumps(plan.classification, ensure_ascii=False)}"]
    if plan.current_source:
        lines.append(f" * Current source inventory: {plan.current_source}")
    if plan.purpose:
        lines.append(" *")
        lines.append(" * Purpose:")
        lines.extend(comment_lines(plan.purpose))
    if plan.human_notes:
        lines.append(" *")
        lines.append(" * Human notes from YAML:")
        lines.extend(comment_lines(plan.human_notes))
    if plan.action_slots:
        lines.append(" *")
        lines.append(" * Action slots / callback intent:")
        lines.extend(comment_lines(plan.action_slots))
    if plan.xxx:
        lines.append(" *")
        lines.append(" * XXX items from YAML:")
        for item in plan.xxx:
            lines.append(f" * - XXX: {item}")
    lines.append(" */")
    return "\n".join(lines) + "\n"


def extra_type_imports(plan: ScaffoldPlan) -> list[str]:
    imports: list[str] = []
    if plan.name == "ResourceTableCell":
        parent_types = plan.output_dir.parents[1] / "ResourceTable.types"
        imports.append(f'import type {{ ResourceTableColumn }} from "{import_path_between(plan.output_dir, parent_types)}";')
    return imports


def render_types(plan: ScaffoldPlan, widget_root: Path, target_file: Path) -> str:
    shared = shared_import_path(plan.output_dir, widget_root)
    extra = "\n".join(extra_type_imports(plan))
    if extra:
        extra += "\n"
    return f'''{ts_header(plan, target_file)}{widget_ir_comment(plan)}// XXX: Review this generated prop contract against the final widget implementation before relying on it as stable API.
import type * as React from "react";
import type {{
  ActionViewModel,
  CalendarCellActionHandler,
  CommonWidgetProps,
  FormActionHandler,
  PageActionHandler,
  PanelActionHandler,
  SidebarNavItem,
  SidebarNavProps,
  TableBulkActionHandler,
  TableRowActionHandler,
}} from "{shared}";
{extra}
{plan.props_snippet}
'''


def ts_string_literal(value: Any) -> str:
    return json.dumps(str(value), ensure_ascii=False)


def render_component(plan: ScaffoldPlan, target_file: Path) -> str:
    classification_text = json.dumps(plan.classification, ensure_ascii=False)
    purpose_text = plan.purpose or "No purpose provided in YAML."
    notes_text = json.dumps(plan.human_notes, indent=2, ensure_ascii=False) if plan.human_notes else "No human notes provided in YAML."
    slots_text = json.dumps(plan.action_slots, indent=2, ensure_ascii=False) if plan.action_slots else "No action slots declared in YAML."
    xxx_text = "\n".join(f"XXX: {item}" for item in plan.xxx) if plan.xxx else "XXX: Replace scaffold placeholder with final implementation."
    return f'''{ts_header(plan, target_file)}{widget_ir_comment(plan)}import type * as React from "react";
import type {{ ReactNode }} from "react";
import type {{ {plan.props_type} }} from "./{plan.name}.types";

const widgetClassification = {ts_string_literal(classification_text)};
const widgetPurpose = {ts_string_literal(purpose_text)};
const widgetHumanNotes = {ts_string_literal(notes_text)};
const widgetActionSlots = {ts_string_literal(slots_text)};
const widgetXxx = {ts_string_literal(xxx_text)};

/**
 * Scaffold for `{plan.name}`.
 *
 * Generated from `{plan.source_yaml.as_posix()}`.
 * Current source inventory: {plan.current_source or "N/A"}.
 *
 * XXX: Replace this placeholder body with the real visual implementation. Keep
 * raw Admin DSL node decoding in renderer adapters; this component should
 * receive typed widget props only.
 */
export function {plan.name}(props: {plan.props_type}) {{
  const scaffoldProps = props as {plan.props_type} & {{
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
    title?: string;
    label?: string;
    name?: string;
    value?: unknown;
  }};
  const heading = scaffoldProps.title || scaffoldProps.label || scaffoldProps.name || "{plan.name}";

  return (
    <section
      id={{scaffoldProps.id}}
      className={{scaffoldProps.className}}
      data-admin-dsl-widget="{plan.name}"
      data-admin-dsl-widget-level="{plan.level}"
      style={{scaffoldProps.style}}
    >
      <div style={{{{ border: "1px dashed #c8b89b", borderRadius: 12, padding: 12, background: "#fffaf0" }}}}>
        <strong>{{heading}}</strong>
        <div style={{{{ marginTop: 4, fontSize: 12, color: "#6f6254" }}}}>
          {plan.name} scaffold — XXX replace with final implementation.
        </div>
        <dl style={{{{ margin: "10px 0 0", display: "grid", gap: 6, fontSize: 12, color: "#6f6254" }}}}>
          <div><dt style={{{{ fontWeight: 700 }}}}>Classification</dt><dd style={{{{ margin: 0, whiteSpace: "pre-wrap" }}}}>{{widgetClassification}}</dd></div>
          <div><dt style={{{{ fontWeight: 700 }}}}>Purpose</dt><dd style={{{{ margin: 0, whiteSpace: "pre-wrap" }}}}>{{widgetPurpose}}</dd></div>
          <div><dt style={{{{ fontWeight: 700 }}}}>Human notes</dt><dd style={{{{ margin: 0, whiteSpace: "pre-wrap" }}}}>{{widgetHumanNotes}}</dd></div>
          <div><dt style={{{{ fontWeight: 700 }}}}>Action slots</dt><dd style={{{{ margin: 0, whiteSpace: "pre-wrap" }}}}>{{widgetActionSlots}}</dd></div>
          <div><dt style={{{{ fontWeight: 700 }}}}>Implementation warnings</dt><dd style={{{{ margin: 0, whiteSpace: "pre-wrap" }}}}>{{widgetXxx}}</dd></div>
        </dl>
      </div>
      {{scaffoldProps.children ? <div style={{{{ marginTop: 12 }}}}>{{scaffoldProps.children}}</div> : null}}
    </section>
  );
}}
'''


def action_sample(label: str = "Open") -> dict[str, Any]:
    return {"type": "mutation", "target": "scaffold.action", "label": label}


def sample_args(plan: ScaffoldPlan) -> str:
    name = plan.name
    if name == "WorkbenchShell":
        return '''{
  pageId: "scaffold-workbench",
  title: "Workbench Shell",
  sidebar: { activeItemId: "overview", items: [{ id: "overview", label: "Overview" }] },
  user: { name: "Admin User", role: "Administrator", initials: "AD" },
  children: <div>Workbench content</div>,
}'''
    if name == "DefaultAdminShell":
        return '''{
  pageId: "scaffold-default",
  shellKind: "admin",
  title: "Default Admin Shell",
  main: <div>Main content</div>,
}'''
    if name == "ActionButton":
        return '''{
  action: { type: "mutation", target: "scaffold.action", label: "Run action" },
}'''
    if name == "ActionGroup":
        return '''{
  slot: "toolbar",
  actions: [{ type: "mutation", target: "scaffold.action", label: "Run action" }],
}'''
    if name == "OverflowActionButton":
        return '''{
  actions: [{ type: "open", target: "scaffold.menu", label: "Open" }],
  context: { rowId: "row_1" },
}'''
    if name == "ResourceTable":
        return '''{
  tableId: "requests",
  columns: [
    { id: "customer", label: "Customer", kind: "text", primary: true },
    { id: "status", label: "Status", kind: "badge" },
  ],
  rows: [
    { id: "req_1", customer: "Maya Chen", status: "new" },
    { id: "req_2", customer: "Jules Park", status: "needsInfo" },
  ],
  selectable: true,
  bulkActions: [{ type: "mutation", target: "requests.assign", label: "Assign" }],
}'''
    if name == "ResourceTableCell":
        return '''{
  tableId: "requests",
  column: { id: "customer", label: "Customer", kind: "text", primary: true },
  row: { id: "req_1", customer: "Maya Chen" },
}'''
    if name == "BulkActionBar":
        return '''{
  tableId: "requests",
  label: "3 visible requests",
  rows: [{ id: "req_1" }, { id: "req_2" }],
  selectedRowIds: ["req_1"],
  actions: [{ type: "mutation", target: "requests.assign", label: "Assign" }],
}'''
    if name == "PaginationBar":
        return '''{
  page: 1,
  total: 42,
  actions: [{ type: "navigate", target: "page.next", label: "Next" }],
}'''
    if name == "PageHeader":
        return '''{
  title: "Request Triage",
  description: "Review customer intake requests.",
  breadcrumbs: ["Admin", "Requests"],
}'''
    if name == "DashboardGrid":
        return '''{
  columns: { desktop: 12, tablet: 8, mobile: 1 },
  gap: "compact",
  children: <div>Grid item</div>,
}'''
    if name == "Panel":
        return '''{
  title: "Today’s queue",
  density: "compact",
  children: <div>Panel content</div>,
}'''
    if name in {"Toolbar"}:
        return '''{
  actions: [{ type: "mutation", target: "scaffold.action", label: "Run action" }],
}'''
    if name == "SplitPane":
        return '''{
  children: <><div>Left</div><div>Right</div></>,
}'''
    if name == "Tabs":
        return '''{
  tabs: [{ id: "all", label: "All" }, { id: "open", label: "Open" }],
  value: "all",
}'''
    if name == "FilterBar":
        return '''{
  filters: [{ id: "all", label: "All" }, { id: "draft", label: "Draft" }],
  value: "all",
}'''
    if name == "SearchBox":
        return '''{
  placeholder: "Search requests",
  value: "",
}'''
    return '''{
  id: "scaffold-widget",
}'''


def render_stories(plan: ScaffoldPlan, target_file: Path) -> str:
    title_level = LEVEL_DIRS.get(plan.level, "molecules").title()
    args = sample_args(plan)
    story_exports = []
    seen: set[str] = set()
    for story in plan.stories:
        export_name = story_export_name(story)
        if export_name in seen:
            continue
        seen.add(export_name)
        story_exports.append(f"export const {export_name}: Story = {{}};")
    if not story_exports:
        story_exports.append("export const Default: Story = {};")
    return f'''{ts_header(plan, target_file)}{widget_ir_comment(plan)}// XXX: Replace generated defaultArgs with purposeful fixtures for every planned story before treating this as visual coverage.
import type {{ Meta, StoryObj }} from "@storybook/react";
import {{ {plan.name} }} from "./{plan.name}";
import type {{ {plan.props_type} }} from "./{plan.name}.types";

const defaultArgs = {args} as unknown as {plan.props_type};

const meta = {{
  title: "Admin DSL Widgets/{title_level}/{plan.name}",
  component: {plan.name},
  args: defaultArgs,
}} satisfies Meta<typeof {plan.name}>;

export default meta;
type Story = StoryObj<typeof meta>;

{chr(10).join(story_exports)}
'''


def render_index(plan: ScaffoldPlan, target_file: Path) -> str:
    return f'''{ts_header(plan, target_file)}export {{ {plan.name} }} from "./{plan.name}";
export type * from "./{plan.name}.types";
'''


def write_file(path: Path, content: str, *, dry_run: bool, force: bool) -> str:
    if path.exists() and not force:
        return "skip"
    if not dry_run:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    return "write"


def generated_shared_header(repo_root: Path, script_path: Path, generated_at: str, target_file: Path) -> str:
    return f'''/**
 * GENERATED SHARED SCAFFOLD — DO NOT TREAT AS FINISHED IMPLEMENTATION.
 *
 * Generated by: {relpath(script_path, repo_root)}
 * Generated at: {generated_at}
 * Source YAML: shared synthesis from scaffold generator
 * Source YAML last commit: N/A
 * Target file previous commit: {git_last_commit(repo_root, target_file)}
 *
 * XXX: Replace or harden this shared scaffold once widget contracts stabilize.
 */
'''


def ensure_shared(widget_root: Path, repo_root: Path, script_path: Path, generated_at: str, *, dry_run: bool, force: bool) -> list[tuple[str, Path]]:
    results = []
    shared_dir = widget_root / "shared"
    types_file = shared_dir / "types.ts"
    index_file = shared_dir / "index.ts"
    results.append((write_file(types_file, generated_shared_header(repo_root, script_path, generated_at, types_file) + SHARED_TYPES, dry_run=dry_run, force=force), types_file))
    results.append((write_file(index_file, generated_shared_header(repo_root, script_path, generated_at, index_file) + 'export type * from "./types";\n', dry_run=dry_run, force=force), index_file))
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="+", type=Path, help="Widget IR YAML files to scaffold from")
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT_DEFAULT, help="Repository root")
    parser.add_argument("--output-root", type=Path, default=DEFAULT_WIDGET_ROOT, help="Widget root relative to repo root unless absolute")
    parser.add_argument("--name", action="append", dest="names", help="Only scaffold a specific widget name; may be repeated")
    parser.add_argument("--force", action="store_true", help="Overwrite existing scaffold files")
    parser.add_argument("--dry-run", action="store_true", help="Print planned writes without writing files")
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    widget_root = args.output_root if args.output_root.is_absolute() else repo_root / args.output_root
    input_files = [path if path.is_absolute() else repo_root / path for path in args.inputs]
    names = set(args.names or []) or None

    missing = [path for path in input_files if not path.exists()]
    if missing:
        for path in missing:
            print(f"missing input: {path}", file=sys.stderr)
        return 2

    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    plans = collect_plans(input_files, widget_root, repo_root, names, generated_at)
    if not plans:
        print("no widgets to scaffold", file=sys.stderr)
        return 1

    print(f"widget root: {widget_root}")
    script_path = Path(__file__).resolve()
    for status, path in ensure_shared(widget_root, repo_root, script_path, generated_at, dry_run=args.dry_run, force=args.force):
        print(f"{status.upper():5} {path.relative_to(repo_root)}")

    for plan in plans:
        types_file = plan.output_dir / f"{plan.name}.types.ts"
        component_file = plan.output_dir / f"{plan.name}.tsx"
        stories_file = plan.output_dir / f"{plan.name}.stories.tsx"
        index_file = plan.output_dir / "index.ts"
        outputs = {
            types_file: render_types(plan, widget_root, types_file),
            component_file: render_component(plan, component_file),
            stories_file: render_stories(plan, stories_file),
            index_file: render_index(plan, index_file),
        }
        for path, content in outputs.items():
            status = write_file(path, content, dry_run=args.dry_run, force=args.force)
            print(f"{status.upper():5} {path.relative_to(repo_root)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
