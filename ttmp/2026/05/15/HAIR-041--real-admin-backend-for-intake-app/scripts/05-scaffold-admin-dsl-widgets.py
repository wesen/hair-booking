#!/usr/bin/env python3
"""Scaffold Admin DSL React widgets from schema-v2 Widget Definition IR YAML.

The widget IR files under ``sources/admin-dsl-widget-ir/`` are now structured
artifacts, not TypeScript snippets. This generator treats the YAML as the source
of truth and emits deterministic, reviewable React scaffolds:

- one directory per widget, using explicit ``outputs`` paths when present;
- ``<Widget>.types.ts`` generated from ``contract.props``;
- ``<Widget>.tsx`` generated from ``intent`` and action-slot metadata;
- ``<Widget>.stories.tsx`` generated from ``stories`` docs, viewports, and assertions;
- ``<Widget>.metadata.ts`` preserving source intent, examples, action slots, and provenance;
- ``index.ts`` barrel files.

Shared design-language files under ``web/src/admin-dsl/widgets/shared`` are now
owned by ``06-generate-admin-dsl-design-language.py``. This scaffold generator
skips shared files by default and only writes its legacy minimal shared fallback
when explicitly requested with ``--write-shared``.

Generated components are intentionally safe scaffolds, not final visual
implementations. They are richer than placeholders: every output carries the
widget purpose, adapter boundary, implementation notes, accessibility notes,
story docs, and provenance so humans/LLM passes can continue from concrete
requirements rather than from a blank file.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
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

VIEWPORT_PARAMETERS = {
    "mobile": '{ viewport: { defaultViewport: "iphone12" } }',
    "tablet": '{ viewport: { defaultViewport: "ipad" } }',
    "desktop": "{}",
}

SHARED_TYPES = '''import type { CSSProperties, ReactNode } from "react";

export interface ActionViewModel {
  id?: string;
  type: "open" | "close" | "navigate" | "mutation" | "confirm" | "refresh" | "upload" | string;
  target: string;
  label: string;
  intent?: "neutral" | "primary" | "danger" | string;
  priority?: "primary" | "secondary" | "tertiary" | string;
  presentation?: "button" | "icon" | "menuItem" | "overflow" | "link" | string;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  confirmation?: {
    title?: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
  [key: string]: unknown;
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
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "muted" | string;
  dataAttributes?: Record<string, string | number | boolean>;
}

export type ResourceTableColumnKind =
  | "text"
  | "badge"
  | "status"
  | "actions"
  | "image"
  | "date"
  | "number"
  | "boolean"
  | "dragHandle"
  | string;

export type OverlaySurfaceKind = "modal" | "drawer" | "popover" | "sheet" | string;

export interface PaginationModel {
  page: number;
  total: number;
  actions?: ActionViewModel[];
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

export interface GeneratedStoryFixture {
  scenario: string;
  [key: string]: unknown;
}

export interface WidgetScaffoldDiagnostics {
  widgetId: string;
  purpose: string;
  adapterBoundary?: string;
  implementationNotes: string[];
  accessibilityNotes: string[];
  actionSlots: Record<string, unknown>;
  examples: Record<string, unknown>;
}

export type WidgetChildren = ReactNode;
'''

@dataclass
class PropField:
    name: str
    ts_type: str
    required: bool
    doc: str

@dataclass
class InterfaceContract:
    name: str
    doc: str
    fields: list[PropField]
    extends: str | None = None

@dataclass
class StoryContract:
    name: str
    doc: str
    viewport: str = "desktop"
    fixtures: dict[str, Any] = field(default_factory=dict)
    asserts: list[str] = field(default_factory=list)

@dataclass
class ScaffoldPlan:
    widget_id: str
    name: str
    props_type: str
    output_dir: Path
    level: str
    category: str
    source_yaml: Path
    classification: dict[str, Any]
    source_mapping: dict[str, Any]
    intent: dict[str, Any]
    contracts: list[InterfaceContract]
    stories: list[StoryContract]
    action_slots: dict[str, Any]
    examples: dict[str, Any]
    implementation_todos: list[dict[str, Any]]
    outputs: dict[str, Any]
    repo_root: Path
    script_path: Path
    generated_at: str


def pascal_case(value: str) -> str:
    parts = re.split(r"[^A-Za-z0-9]+", value)
    return "".join(part[:1].upper() + part[1:] for part in parts if part)


def camel_case(value: str) -> str:
    pascal = pascal_case(value)
    return pascal[:1].lower() + pascal[1:] if pascal else "value"


def story_export_name(value: str) -> str:
    name = pascal_case(value) or "Default"
    if name[0].isdigit():
        name = f"Story{name}"
    return name


def widget_level(widget: dict[str, Any]) -> str:
    classification = widget.get("classification") or {}
    if isinstance(classification, dict):
        return str(classification.get("level") or "molecule")
    return "molecule"


def output_path(widget: dict[str, Any], key: str) -> str | None:
    outputs = widget.get("outputs") if isinstance(widget.get("outputs"), dict) else {}
    entry = outputs.get(key) if isinstance(outputs, dict) else None
    if isinstance(entry, dict):
        raw = entry.get("path")
        return str(raw) if raw else None
    return None


def infer_output_dir(widget: dict[str, Any], widget_root: Path) -> Path:
    component_path = output_path(widget, "component")
    if component_path:
        return Path(component_path).parent
    level_dir = LEVEL_DIRS.get(widget_level(widget), "molecules")
    return widget_root / level_dir / str(widget["name"])


def normalize_type(ts_type: Any) -> str:
    text = str(ts_type or "unknown").strip()
    text = re.sub(r";\s*//.*$", "", text).strip()
    text = re.sub(r"\s+//.*$", "", text).strip()
    if text in {"", "{"}:
        return "Record<string, unknown>"
    return text


def parse_extends(raw: Any, interface_name: str, fields: list[PropField]) -> tuple[str, str | None]:
    """Return ``(generic_suffix, extends_clause)`` for a YAML extends value.

    Older migrated entries encode generics and extends together, for example
    ``<Row = Record<string, unknown>>  CommonWidgetProps``. A regular expression
    that stops at the first ``>`` is wrong because the generic default itself can
    contain ``Record<...>``. Split on the known extends tail instead.
    """
    text = str(raw or "").strip()
    generic = ""
    extends_clause = text or None
    if text.startswith("<") and "CommonWidgetProps" in text:
        before, after = text.split("CommonWidgetProps", 1)
        generic = before.strip()
        extends_clause = ("CommonWidgetProps" + after).strip()
    elif text.startswith("<") and " " in text:
        before, after = text.rsplit(" ", 1)
        generic = before.strip()
        extends_clause = after.strip()
    elif any(re.search(r"\bRow\b", f.ts_type) for f in fields):
        generic = "<Row = Record<string, unknown>>"
    elif any(re.search(r"\bValues\b", f.ts_type) for f in fields):
        generic = "<Values = Record<string, unknown>>"
    elif any(re.search(r"\bC\b", f.ts_type) for f in fields):
        generic = "<C = unknown>"
    return generic, extends_clause


def normalize_contracts(widget: dict[str, Any]) -> list[InterfaceContract]:
    contract = widget.get("contract") if isinstance(widget.get("contract"), dict) else {}
    props = contract.get("props") if isinstance(contract.get("props"), dict) else {}
    contracts: list[InterfaceContract] = []
    for name, iface in props.items():
        if not isinstance(iface, dict):
            continue
        fields_raw = iface.get("fields") if isinstance(iface.get("fields"), dict) else {}
        fields: list[PropField] = []
        for field_name, field_def in fields_raw.items():
            if not isinstance(field_def, dict):
                continue
            fields.append(PropField(
                name=str(field_name),
                ts_type=normalize_type(field_def.get("type")),
                required=bool(field_def.get("required")),
                doc=str(field_def.get("doc") or f"{field_name} for {name}."),
            ))
        contracts.append(InterfaceContract(
            name=str(name),
            doc=str(iface.get("doc") or f"Props for {widget.get('name')}"),
            fields=fields,
            extends=str(iface.get("extends")).strip() if iface.get("extends") else None,
        ))
    return contracts


def normalize_stories(widget: dict[str, Any]) -> list[StoryContract]:
    raw = widget.get("stories")
    stories: list[StoryContract] = []
    if isinstance(raw, dict):
        for name, story in raw.items():
            story = story if isinstance(story, dict) else {}
            assertions = story.get("asserts") if isinstance(story.get("asserts"), list) else []
            fixtures = story.get("fixtures") if isinstance(story.get("fixtures"), dict) else {}
            stories.append(StoryContract(
                name=str(name),
                doc=str(story.get("doc") or f"{name} scenario."),
                viewport=str(story.get("viewport") or "desktop"),
                fixtures=fixtures,
                asserts=[str(item) for item in assertions],
            ))
    elif isinstance(raw, list):
        for item in raw:
            stories.append(StoryContract(name=str(item), doc=f"{item} scenario."))
    return stories or [StoryContract(name="Default", doc="Baseline generated scaffold story.")]


def props_type_name(widget_name: str, contracts: list[InterfaceContract]) -> str:
    preferred = f"{widget_name}Props"
    if any(contract.name == preferred for contract in contracts):
        return preferred
    return contracts[-1].name if contracts else preferred


def collect_plans(input_files: list[Path], widget_root: Path, repo_root: Path, names: set[str] | None, generated_at: str) -> list[ScaffoldPlan]:
    plans: list[ScaffoldPlan] = []
    script_path = Path(__file__).resolve()
    for input_file in input_files:
        data = yaml.safe_load(input_file.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        if data.get("artifact_type") != "admin_dsl_widget_definition_ir":
            print(f"SKIP {input_file}: artifact_type={data.get('artifact_type')!r}", file=sys.stderr)
            continue
        if data.get("schema_version") != 2:
            raise ValueError(f"{input_file} is not schema_version: 2")
        category = str(data.get("category") or input_file.stem)
        widgets = data.get("widgets") or []
        for widget in widgets:
            if not isinstance(widget, dict):
                continue
            name = str(widget.get("name") or "").strip()
            if not name or (names and name not in names):
                continue
            contracts = normalize_contracts(widget)
            if not contracts:
                print(f"SKIP {name}: no contract.props", file=sys.stderr)
                continue
            out_dir = infer_output_dir(widget, widget_root)
            if not out_dir.is_absolute():
                out_dir = repo_root / out_dir
            action_slots = widget.get("contract", {}).get("action_slots", {}) if isinstance(widget.get("contract"), dict) else {}
            plans.append(ScaffoldPlan(
                widget_id=str(widget.get("id") or name),
                name=name,
                props_type=props_type_name(name, contracts),
                output_dir=out_dir,
                level=widget_level(widget),
                category=category,
                source_yaml=input_file,
                classification=widget.get("classification") if isinstance(widget.get("classification"), dict) else {"level": widget_level(widget)},
                source_mapping=widget.get("source_mapping") if isinstance(widget.get("source_mapping"), dict) else {},
                intent=widget.get("intent") if isinstance(widget.get("intent"), dict) else {},
                contracts=contracts,
                stories=normalize_stories(widget),
                action_slots=action_slots if isinstance(action_slots, dict) else {},
                examples=widget.get("examples") if isinstance(widget.get("examples"), dict) else {},
                implementation_todos=widget.get("implementation_todos") if isinstance(widget.get("implementation_todos"), list) else [],
                outputs=widget.get("outputs") if isinstance(widget.get("outputs"), dict) else {},
                repo_root=repo_root,
                script_path=script_path,
                generated_at=generated_at,
            ))
    return plans


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


def import_path_between(source_dir: Path, target_file_no_ext: Path) -> str:
    relative = Path(os.path.relpath(target_file_no_ext, source_dir))
    if relative.suffix in {".ts", ".tsx", ".js", ".jsx"}:
        relative = relative.with_suffix("")
    text = relative.as_posix()
    return text if text.startswith(".") else f"./{text}"


def shared_import_path(output_dir: Path, widget_root: Path) -> str:
    return import_path_between(output_dir, widget_root / "shared" / "types")


def ts_header(plan: ScaffoldPlan, target_file: Path) -> str:
    source_commit = git_last_commit(plan.repo_root, plan.source_yaml)
    target_previous_commit = git_last_commit(plan.repo_root, target_file)
    return f'''/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Generated by: {relpath(plan.script_path, plan.repo_root)}
 * Generated at: {plan.generated_at}
 * Source YAML: {relpath(plan.source_yaml, plan.repo_root)}
 * Source YAML last commit: {source_commit}
 * Target file previous commit: {target_previous_commit}
 * Widget ID: {plan.widget_id}
 *
 * This file is generated from schema-v2 Widget Definition IR. Keep raw Admin DSL
 * JSON decoding in adapters; generated widgets should receive typed props only.
 */
'''


def generated_shared_header(repo_root: Path, script_path: Path, generated_at: str, target_file: Path) -> str:
    return f'''/**
 * GENERATED SHARED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Generated by: {relpath(script_path, repo_root)}
 * Generated at: {generated_at}
 * Source YAML: shared synthesis from schema-v2 widget IR
 * Target file previous commit: {git_last_commit(repo_root, target_file)}
 */
'''


def jsdoc(text: str, indent: str = "") -> str:
    lines = [line.rstrip() for line in str(text).strip().splitlines()] or [""]
    out = [f"{indent}/**"]
    for line in lines:
        out.append(f"{indent} * {line}" if line else f"{indent} *")
    out.append(f"{indent} */")
    return "\n".join(out)


def render_interface(contract: InterfaceContract) -> str:
    generic, extends_clause = parse_extends(contract.extends, contract.name, contract.fields)
    extends_text = f" extends {extends_clause}" if extends_clause else ""
    lines = [jsdoc(contract.doc), f"export interface {contract.name}{generic}{extends_text} {{"]
    for field in contract.fields:
        optional = "" if field.required else "?"
        lines.append(jsdoc(field.doc, "  "))
        lines.append(f"  {field.name}{optional}: {field.ts_type};")
    lines.append("}")
    return "\n".join(lines)


def extra_type_imports(plan: ScaffoldPlan, widget_root: Path) -> list[str]:
    imports: list[str] = []
    if plan.name == "ResourceTableCell":
        parent_types = plan.output_dir.parents[1] / "ResourceTable.types"
        imports.append(f'import type {{ ResourceTableColumn }} from "{import_path_between(plan.output_dir, parent_types)}";')
    if plan.name == "CalendarWeek":
        sibling = widget_root / "molecules" / "CalendarEventBlock" / "CalendarEventBlock.types"
        imports.append(f'import type {{ CalendarEventBlockProps }} from "{import_path_between(plan.output_dir, sibling)}";')
    return imports


def render_types(plan: ScaffoldPlan, widget_root: Path, target_file: Path) -> str:
    shared = shared_import_path(plan.output_dir, widget_root)
    imports = f'''import type * as React from "react";
import type {{
  ActionViewModel,
  CalendarCellActionHandler,
  CommonWidgetProps,
  FormActionHandler,
  OverlaySurfaceKind,
  PageActionHandler,
  PanelActionHandler,
  ResourceTableColumnKind,
  SidebarNavItem,
  SidebarNavProps,
  TableBulkActionHandler,
  TableRowActionHandler,
}} from "{shared}";
'''
    extra = "\n".join(extra_type_imports(plan, widget_root))
    if extra:
        imports += extra + "\n"
    body = "\n\n".join(render_interface(contract) for contract in plan.contracts)
    return f"{ts_header(plan, target_file)}{imports}\n{body}\n"


def ts_literal(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2)


def metadata_const_name(plan: ScaffoldPlan) -> str:
    return f"{camel_case(plan.name)}WidgetMetadata"


def widget_metadata(plan: ScaffoldPlan) -> dict[str, Any]:
    return {
        "widgetId": plan.widget_id,
        "name": plan.name,
        "category": plan.category,
        "classification": plan.classification,
        "purpose": str(plan.intent.get("purpose") or ""),
        "designRationale": str(plan.intent.get("design_rationale") or ""),
        "adapterBoundary": str(plan.intent.get("adapter_boundary") or ""),
        "implementationNotes": plan.intent.get("implementation_notes") if isinstance(plan.intent.get("implementation_notes"), list) else [],
        "accessibilityNotes": plan.intent.get("accessibility_notes") if isinstance(plan.intent.get("accessibility_notes"), list) else [],
        "actionSlots": plan.action_slots,
        "examples": plan.examples,
        "stories": {story.name: {
            "doc": story.doc,
            "viewport": story.viewport,
            "fixtures": story.fixtures,
            "asserts": story.asserts,
        } for story in plan.stories},
        "implementationTodos": plan.implementation_todos,
        "sourceMapping": plan.source_mapping,
    }


def render_metadata(plan: ScaffoldPlan, target_file: Path) -> str:
    const_name = metadata_const_name(plan)
    return f'''{ts_header(plan, target_file)}/**
 * Widget IR metadata for {plan.name}.
 *
 * Keep this file next to the implementation even after replacing generated
 * scaffolds with hand-written code. It preserves the source intent, adapter
 * boundary, action-slot contract, examples, stories, and implementation notes
 * that explain why the component exists and how render adapters should use it.
 */
export const {const_name} = {ts_literal(widget_metadata(plan))} as const;
'''


def render_data_attrs_expr() -> str:
    return '''Object.fromEntries(
    Object.entries(scaffoldProps.dataAttributes ?? {}).map(([key, value]) => [`data-${key}`, String(value)]),
  ) as Record<string, string>'''


def render_component(plan: ScaffoldPlan, target_file: Path) -> str:
    purpose = str(plan.intent.get("purpose") or "")
    adapter = str(plan.intent.get("adapter_boundary") or "")
    const_name = metadata_const_name(plan)
    return f'''{ts_header(plan, target_file)}import type * as React from "react";
import type {{ ReactNode }} from "react";
import {{ {const_name} }} from "./{plan.name}.metadata";
import type {{ {plan.props_type} }} from "./{plan.name}.types";

/**
 * Scaffold for `{plan.name}`.
 *
 * Purpose: {purpose or "See metadata."}
 *
 * Adapter boundary: {adapter or "Receive normalized widget props only."}
 */
export function {plan.name}(props: {plan.props_type}) {{
  const scaffoldProps = props as {plan.props_type} & {{
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    dataAttributes?: Record<string, string | number | boolean>;
    children?: ReactNode;
    main?: ReactNode;
    title?: string;
    label?: string;
    name?: string;
    value?: unknown;
  }};
  const heading = scaffoldProps.title || scaffoldProps.label || scaffoldProps.name || "{plan.name}";
  const dataAttributes = {render_data_attrs_expr()};

  return (
    <section
      id={{scaffoldProps.id}}
      className={{scaffoldProps.className}}
      data-admin-dsl-widget="{plan.name}"
      data-admin-dsl-widget-id={{{const_name}.widgetId}}
      data-admin-dsl-widget-level="{plan.level}"
      style={{scaffoldProps.style}}
      {{...dataAttributes}}
    >
      <div style={{{{ border: "1px solid #dfd2bd", borderRadius: 12, padding: 12, background: "#fffaf0" }}}}>
        <strong>{{heading}}</strong>
        <p style={{{{ margin: "6px 0 0", fontSize: 12, color: "#6f6254" }}}}>{{{const_name}.purpose}}</p>
        {{{const_name}.adapterBoundary ? (
          <p style={{{{ margin: "6px 0 0", fontSize: 12, color: "#6f6254" }}}}>Adapter: {{{const_name}.adapterBoundary}}</p>
        ) : null}}
        <details style={{{{ marginTop: 10, fontSize: 12, color: "#6f6254" }}}}>
          <summary>Widget IR metadata</summary>
          <pre style={{{{ whiteSpace: "pre-wrap", margin: "8px 0 0" }}}}>{{JSON.stringify({const_name}, null, 2)}}</pre>
        </details>
      </div>
      {{scaffoldProps.children ? <div style={{{{ marginTop: 12 }}}}>{{scaffoldProps.children}}</div> : null}}
      {{scaffoldProps.main ? <div style={{{{ marginTop: 12 }}}}>{{scaffoldProps.main}}</div> : null}}
    </section>
  );
}}
'''


def action_sample(label: str = "Run action") -> dict[str, Any]:
    return {"type": "mutation", "target": "scaffold.action", "label": label}


def sample_args(plan: ScaffoldPlan, story: StoryContract | None = None) -> str:
    name = plan.name
    scenario = story.name if story else "Default"
    if name == "WorkbenchShell":
        return '''{
  pageId: "scaffold-workbench",
  title: "Fringe Admin",
  sidebar: { activeItemId: "requests", items: [{ id: "requests", label: "Requests" }, { id: "config", label: "Config" }] },
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
  action: { type: "mutation", target: "scaffold.action", label: "Run action", intent: "primary" },
}'''
    if name == "ActionGroup":
        return '''{
  slot: "toolbar",
  actions: [{ type: "mutation", target: "scaffold.action", label: "Run action" }],
}'''
    if name == "OverflowActionButton":
        return '''{
  label: "More actions",
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
  page: 1,
  total: 2,
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
    if name == "Toolbar":
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
    if name == "ComparisonTable":
        return '''{
  tableId: "comparison",
  rows: [{ field: "Price", current: "$90", draft: "$95" }],
}'''
    if name == "KeyValueList":
        return '''{
  items: [{ label: "Status", value: "Published" }],
}'''
    if name == "ActivityFeed":
        return '''{
  items: [{ time: "09:30", title: "Draft published", body: "Version 12" }],
}'''
    if name == "ImageGrid":
        return '''{
  items: [{ id: "photo_1", title: "Front", url: "/placeholder.png" }],
}'''
    if name == "ImageGallery":
        return '''{
  galleryId: "photos",
  images: [{ id: "photo_1", title: "Front", url: "/placeholder.png" }],
}'''
    if name == "MonthCalendar":
        return '''{
  calendarId: "availability",
  month: "2026-06",
  markers: [{ date: "2026-06-12", kind: "available", tone: "success" }],
}'''
    if name == "CalendarWeek":
        return '''{
  calendarId: "schedule",
  days: ["Mon", "Tue", "Wed"],
  hours: ["09:00", "10:00"],
  blocks: [],
}'''
    if name == "CalendarEventBlock":
        return '''{
  id: "block_1",
  kind: "appointment",
  title: "Cut + color",
}'''
    if name == "AdminForm":
        return '''{
  formId: "service-form",
  title: "Edit service",
  children: <div>Fields</div>,
}'''
    if name == "FieldGroup":
        return '''{
  title: "Service details",
  children: <div>Fields</div>,
}'''
    if name == "SaveBar":
        return '''{
  status: "Unsaved changes",
  primaryAction: { type: "mutation", target: "save", label: "Save" },
}'''
    if name == "OverlaySurface":
        return '''{
  surfaceId: "drawer_1",
  kind: "drawer",
  title: "Review request",
  children: <div>Surface content</div>,
}'''
    if name == "ConfirmDialog":
        return '''{
  dialogId: "confirm_publish",
  title: "Publish draft?",
  confirmAction: { type: "mutation", target: "publish", label: "Publish", intent: "primary" },
}'''
    if name in {"MetricCard", "StatusText"}:
        return '''{
  label: "Published",
  value: "12",
}''' if name == "MetricCard" else '''{
  label: "Published",
  tone: "success",
}'''
    if name in {"MarkdownBlock"}:
        return '''{
  markdown: "**Preview** markdown content",
}'''
    if name in {"EmptyState", "LoadingState", "InlineError"}:
        return '''{
  title: "Nothing here yet",
  body: "This scaffold story exercises the state component.",
}'''
    if name == "PreviewFrame":
        return '''{
  previewId: "customer-preview",
  title: "Customer intake preview",
  url: "/dsl-goja-demo/service",
  height: 420,
}'''
    return '''{
  id: "scaffold-widget",
}'''


def story_parameters(story: StoryContract) -> str:
    viewport = VIEWPORT_PARAMETERS.get(story.viewport, "{}")
    docs = json.dumps(story.doc, ensure_ascii=False)
    if viewport == "{}":
        return f'{{ docs: {{ description: {{ story: {docs} }} }} }}'
    inner = viewport.strip()[1:-1].strip()
    return f'{{ {inner}, docs: {{ description: {{ story: {docs} }} }} }}'


def render_stories(plan: ScaffoldPlan, target_file: Path) -> str:
    title_level = LEVEL_DIRS.get(plan.level, "molecules").title()
    default_args = sample_args(plan)
    story_exports: list[str] = []
    seen: set[str] = set()
    for story in plan.stories:
        export_name = story_export_name(story.name)
        if export_name in seen:
            continue
        seen.add(export_name)
        fixtures = ts_literal(story.fixtures or {"scenario": camel_case(story.name)})
        assertions = ts_literal(story.asserts)
        story_exports.append(f'''export const {export_name}: Story = {{
  name: {json.dumps(story.name)},
  parameters: {story_parameters(story)},
  args: {{
    ...defaultArgs,
  }},
  render: (args) => (
    <div style={{{{ padding: 24, maxWidth: 1120 }}}}>
      <{plan.name} {{...args}} />
      <details style={{{{ marginTop: 12, fontSize: 12, color: "#6f6254" }}}}>
        <summary>Story fixture and assertions</summary>
        <pre style={{{{ whiteSpace: "pre-wrap" }}}}>{{JSON.stringify({{ fixtures: {fixtures}, asserts: {assertions} }}, null, 2)}}</pre>
      </details>
    </div>
  ),
}};''')
    return f'''{ts_header(plan, target_file)}import type {{ Meta, StoryObj }} from "@storybook/react";
import {{ {plan.name} }} from "./{plan.name}";
import type {{ {plan.props_type} }} from "./{plan.name}.types";

const defaultArgs = {default_args} as unknown as {plan.props_type};

const meta = {{
  title: "Admin DSL Widgets/{title_level}/{plan.name}",
  component: {plan.name},
  args: defaultArgs,
  parameters: {{
    docs: {{
      description: {{
        component: {json.dumps(str(plan.intent.get('purpose') or plan.name), ensure_ascii=False)},
      }},
    }},
  }},
}} satisfies Meta<typeof {plan.name}>;

export default meta;
type Story = StoryObj<typeof meta>;

{chr(10).join(story_exports)}
'''


def render_index(plan: ScaffoldPlan, target_file: Path) -> str:
    return f'''{ts_header(plan, target_file)}export {{ {plan.name} }} from "./{plan.name}";
export {{ {metadata_const_name(plan)} }} from "./{plan.name}.metadata";
export type * from "./{plan.name}.types";
'''


def write_file(path: Path, content: str, *, dry_run: bool, force: bool) -> str:
    if path.exists() and not force:
        return "skip"
    if not dry_run:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    return "write"


def ensure_shared(widget_root: Path, repo_root: Path, script_path: Path, generated_at: str, *, dry_run: bool, force: bool, write_shared: bool) -> list[tuple[str, Path]]:
    """Optionally write the legacy minimal shared fallback.

    The design-language generator owns ``widgets/shared/*`` in the current Admin
    DSL workflow. Keeping this fallback behind an explicit flag lets old ad-hoc
    scaffolding still bootstrap a minimal shared directory without allowing
    targeted widget regeneration to clobber richer generated design helpers.
    """
    shared_dir = widget_root / "shared"
    types_file = shared_dir / "types.ts"
    index_file = shared_dir / "index.ts"
    if not write_shared:
        return [("skip", types_file), ("skip", index_file)]
    return [
        (write_file(types_file, generated_shared_header(repo_root, script_path, generated_at, types_file) + SHARED_TYPES, dry_run=dry_run, force=force), types_file),
        (write_file(index_file, generated_shared_header(repo_root, script_path, generated_at, index_file) + 'export type * from "./types";\n', dry_run=dry_run, force=force), index_file),
    ]


def target_paths(plan: ScaffoldPlan) -> dict[str, Path]:
    default = {
        "types": plan.output_dir / f"{plan.name}.types.ts",
        "component": plan.output_dir / f"{plan.name}.tsx",
        "stories": plan.output_dir / f"{plan.name}.stories.tsx",
        "metadata": plan.output_dir / f"{plan.name}.metadata.ts",
        "barrel": plan.output_dir / "index.ts",
    }
    for key, path_text in ((key, output_path({"outputs": plan.outputs}, key)) for key in default):
        if path_text:
            path = Path(path_text)
            default[key] = path if path.is_absolute() else plan.repo_root / path
    return default


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="+", type=Path, help="schema-v2 widget IR YAML files to scaffold from")
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT_DEFAULT, help="Repository root")
    parser.add_argument("--output-root", type=Path, default=DEFAULT_WIDGET_ROOT, help="Widget root relative to repo root unless absolute")
    parser.add_argument("--name", action="append", dest="names", help="Only scaffold a specific widget name; may be repeated")
    parser.add_argument("--force", action="store_true", help="Overwrite existing scaffold files")
    parser.add_argument("--dry-run", action="store_true", help="Print planned writes without writing files")
    parser.add_argument("--write-shared", action="store_true", help="Also write the legacy minimal widgets/shared fallback. Default is false because the design-language generator owns shared helpers.")
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
    for status, path in ensure_shared(widget_root, repo_root, script_path, generated_at, dry_run=args.dry_run, force=args.force, write_shared=args.write_shared):
        suffix = " (use --write-shared to write legacy fallback)" if status == "skip" and not args.write_shared else ""
        print(f"{status.upper():5} {path.relative_to(repo_root)}{suffix}")

    for plan in plans:
        paths = target_paths(plan)
        outputs = {
            paths["types"]: render_types(plan, widget_root, paths["types"]),
            paths["metadata"]: render_metadata(plan, paths["metadata"]),
            paths["component"]: render_component(plan, paths["component"]),
            paths["stories"]: render_stories(plan, paths["stories"]),
            paths["barrel"]: render_index(plan, paths["barrel"]),
        }
        for path, content in outputs.items():
            status = write_file(path, content, dry_run=args.dry_run, force=args.force)
            print(f"{status.upper():5} {path.relative_to(repo_root)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
