/**
 * Widget IR metadata for DefaultAdminShell.
 *
 * Keep this file next to the implementation after replacing generated scaffold
 * diagnostics with real code. It preserves the fallback shell's source intent,
 * adapter boundary, examples, stories, implementation notes, and remaining
 * compatibility decisions.
 */
export const defaultAdminShellWidgetMetadata = {
  widgetId: "admin.shell.default",
  name: "DefaultAdminShell",
  category: "shell_widgets",
  classification: {
    level: "organism",
    role: "shell",
    description: "Compatibility/default page-frame organism for non-workbench Admin DSL pages.",
  },
  purpose:
    "Render non-workbench Admin DSL pages with optional side surfaces. This keeps the legacy/default page shell separate from workbench chrome.",
  designRationale:
    "The default shell provides a compatibility path while the new WorkbenchShell becomes the primary dense admin frame. It prevents fallback page chrome, side-surface layout, and calendar/resource variants from remaining hidden inside AdminPageRenderer.",
  adapterBoundary:
    "The adapter receives `AdminPage`, separates main region from side surfaces, renders those regions, and passes React nodes to DefaultAdminShell. The widget receives already-rendered `main` and `side` content and should not traverse Admin DSL nodes.",
  implementationNotes: [
    "Main-only pages should remain simple and readable.",
    "Optional side content should align with the main region on desktop and stack predictably on mobile.",
    "Shell kind should influence coarse page chrome only, not detailed child behavior.",
    "The first real implementation was extracted from the AdminPageRenderer fallback branch in `web/src/admin-dsl/render.tsx`.",
  ],
  accessibilityNotes: [
    "Main content should be exposed as the primary page region.",
    "Side content should be labeled when it represents drawers, details, or modal previews.",
  ],
  actionSlots: {},
  examples: {
    WithSidePreview: {
      doc:
        "Demonstrates how the fallback shell receives rendered main and side regions after adapter/layout separation. Use this for legacy or non-workbench pages while WorkbenchShell becomes the primary dense admin shell.",
      demonstrates: [
        "Rendered main region input.",
        "Rendered side region input.",
        "Shell kind as coarse visual mode.",
      ],
      code: `<DefaultAdminShell
  pageId="admin-services"
  shellKind="admin"
  eyebrow="Admin DSL"
  title="Services"
  description="Manage services, pricing, and availability."
  main={<ServiceOperationsContent />}
  side={<DraftDrawerPreview />}
/>`,
    },
  },
  stories: {
    MainOnly: {
      doc:
        "Tests the simplest fallback page shape with header chrome and one primary content column. It should remain useful for legacy admin pages and smoke fixtures.",
      viewport: "desktop",
      fixtures: { side: "absent" },
      asserts: ["Header title is visible.", "Main region renders without side-column spacing artifacts."],
    },
    WithSideSurfaces: {
      doc:
        "Tests the optional side region used for drawers, modals, or detail panels. It should prove that side content aligns with the main region without requiring WorkbenchShell.",
      viewport: "desktop",
      fixtures: { side: "present" },
      asserts: ["Main and side regions form a two-column layout.", "Side region remains aligned with top of main content."],
    },
    CalendarShell: {
      doc:
        "Tests shell-level visual treatment for calendar pages, especially background and spacing differences inherited from the current default renderer.",
      viewport: "desktop",
      fixtures: { shellKind: "calendar" },
      asserts: ["Calendar shell background treatment is applied.", "Main content remains readable on calendar background."],
    },
    MobileSideColumn: {
      doc:
        "Tests responsive behavior when a side region exists. The side region should stack predictably and remain readable on narrow screens.",
      viewport: "mobile",
      fixtures: { side: "present" },
      asserts: ["Side region stacks after main content.", "No horizontal overflow is introduced."],
    },
  },
  implementationTodos: [
    {
      id: "compatibility-decision",
      severity: "recommended",
      doc: "Decide whether this shell remains long-term or becomes a compatibility wrapper after WorkbenchShell migration.",
    },
    {
      id: "css-ownership",
      severity: "recommended",
      doc: "Move fallback-shell-specific responsive rules out of render.tsx once the remaining renderer classes have been split by widget family.",
    },
  ],
  sourceMapping: {
    current_constructs: ["AdminPageRenderer fallback shell", "shell.kind=admin|dashboard|resource|calendar|settings|bare"],
    current_files: [
      {
        path: "web/src/admin-dsl/render.tsx",
        symbol: "AdminPageRenderer fallback branch",
        notes: "Renderer adapter that now passes rendered main/side regions into DefaultAdminShell.",
      },
      {
        path: "web/src/admin-dsl/schema.ts",
        symbol: "AdminShellKind",
        notes: "Current shell kind vocabulary consumed by this fallback shell.",
      },
      {
        path: "ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/03-shell-widgets.yaml",
        symbol: "admin.shell.default",
        notes: "Schema-v2 Widget Definition IR source for this component's contract and intent.",
      },
    ],
  },
} as const;
