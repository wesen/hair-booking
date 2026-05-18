/**
 * Widget IR metadata for WorkbenchShell.
 *
 * Keep this file next to the implementation even after replacing generated
 * scaffolds with hand-written code. It preserves the source intent, adapter
 * boundary, action-slot contract, examples, and implementation notes that
 * explain why the component exists and how render.tsx should integrate it.
 */
export const workbenchShellWidgetMetadata = {
  widgetId: "admin.shell.workbench",
  name: "WorkbenchShell",
  category: "shell_widgets",
  classification: {
    level: "organism",
    role: "shell",
    description: "Full page-frame organism for information-dense admin workbench screens.",
  },
  purpose:
    "Render the information-dense admin workbench frame: persistent desktop sidebar, sticky mobile topbar, global admin background, content max width, page body region, and optional user identity footer.",
  designRationale:
    "The workbench shell should make frame-level admin UI explicit instead of hiding it inside a renderer switch. It is the boundary between page chrome and page content: navigation, user identity, content width, and responsive shell behavior live here; node interpretation lives elsewhere.",
  adapterBoundary:
    "The Admin DSL adapter translates raw `page.shell.props.sidebar` into `SidebarNavProps`, binds each sidebar item action, and passes already-rendered page body children. WorkbenchShell must not parse raw `AdminPage` objects or inspect `AdminNode` values.",
  implementationNotes: [
    "Desktop layout should show a persistent left sidebar and content region with dense workbench spacing.",
    "Mobile layout should hide the desktop sidebar and expose a sticky topbar/menu affordance.",
    "The user footer is optional and must collapse cleanly when absent.",
    "Navigation actions may be frontend-local or backend-bound, but the widget only invokes `onSidebarAction`.",
    "The first real implementation was extracted from the previous inline `WorkbenchShell` function in `web/src/admin-dsl/render.tsx`.",
  ],
  accessibilityNotes: [
    "Sidebar nav must use a named `nav` region.",
    "Active item should expose `aria-current=\"page\"`.",
    "Mobile menu affordance needs keyboard and screen-reader behavior before production use.",
  ],
  actionSlots: {
    sidebarNav: {
      doc:
        "Navigation action slot for sidebar items. Actions are rendered in the frontend but may dispatch to the backend flow. The context must include both the clicked item and the active item id so handlers can update shell/page state deterministically.",
      callback: "onSidebarAction",
      action_type: "ActionViewModel",
      cardinality: "many",
      context_type: "WorkbenchSidebarNavContext",
      context: {
        item: {
          type: "SidebarNavItem",
          required: true,
          doc: "The clicked navigation item, including its id, label, icon, and normalized action metadata.",
        },
        activeItemId: {
          type: "string",
          required: false,
          doc: "The sidebar item id that was active before the click.",
        },
      },
      lowering: {
        adapter: "dispatchAdminAction",
        note:
          "The adapter converts this typed callback into the current Admin DSL event dispatch shape. The widget should not call `dispatchAdminAction` directly.",
      },
    },
  },
  examples: {
    BasicWorkbench: {
      doc:
        "Demonstrates the intended adapter boundary. The caller passes normalized sidebar items, optional user identity, a sidebar action callback, and already-rendered child widgets. The example should not be copied into production with raw Admin DSL JSON parsing inside WorkbenchShell.",
      demonstrates: [
        "Normalized sidebar props.",
        "Optional user footer.",
        "Child content slot populated by rendered widgets.",
        "Sidebar action callback boundary.",
      ],
      code: `<WorkbenchShell
  pageId="admin-intake"
  title="Fringe Admin"
  sidebar={{ activeItemId: "requests", items }}
  user={{ name: "Admin User", role: "Administrator", initials: "AD" }}
  onSidebarAction={handleSidebarAction}
>
  <PageHeader title="Request Triage" />
  <DashboardGrid>{/* panels */}</DashboardGrid>
</WorkbenchShell>`,
    },
  },
  implementationTodos: [
    {
      id: "mobile-navigation-a11y",
      severity: "required",
      doc: "Add keyboard and screen-reader behavior for mobile navigation before production use.",
    },
    {
      id: "css-ownership",
      severity: "recommended",
      doc: "Move workbench-specific responsive CSS from render.tsx into a widget-local style module when the remaining renderer CSS has been split by widget family.",
    },
    {
      id: "storybook-real-implementation",
      severity: "recommended",
      doc: "Update WorkbenchShell Storybook stories so they exercise the real shell implementation rather than generated scaffold diagnostics.",
    },
  ],
  sourceMapping: {
    current_constructs: ["shell.kind=admin", "shell.props.variant=workbench"],
    current_files: [
      {
        path: "web/src/admin-dsl/render.tsx",
        symbol: "renderWorkbenchShell",
        notes:
          "Renderer adapter that normalizes raw Admin DSL shell props into typed WorkbenchShell props and lowers sidebar actions back to dispatchAdminAction.",
      },
      {
        path: "web/src/admin-dsl/schema.ts",
        symbol: "AdminPage.shell",
        notes: "Current transport shape whose shell props must be adapted before reaching this widget.",
      },
      {
        path: "ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/03-shell-widgets.yaml",
        symbol: "admin.shell.workbench",
        notes: "Schema-v2 Widget Definition IR source for this component's contract and intent.",
      },
    ],
  },
} as const;
