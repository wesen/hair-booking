import type { Meta, StoryObj } from "@storybook/react";
import { action, admin, field, resource, surface } from "./builder";
import { AdminPageRenderer } from "./render";
import type { AdminPage } from "./schema";

function surfacePage(kind: "drawer" | "modal" | "sheet" | "detail" | "inline" | "confirm"): AdminPage {
  const base = admin.page(`surface-${kind}`, `Surface catalog · ${kind}`)
    .shell("admin", { eyebrow: "Admin DSL / Surfaces" })
    .describe("Static, screenshot-friendly surface fixture for reviewing presentation, copy, form content, and action placement.")
    .content(
      admin.section("Main context", { description: "The surface is rendered open so visual tooling can capture it without first driving app state." },
        resource.list("services", {},
          resource.row("cut", { title: "Cut", subtitle: "60 min · $80+", badge: "Selected", tone: "plum" })
            .actions(action.open("surface.open", "Open surface").placement("row")),
          resource.row("color", { title: "Color", subtitle: "90 min · $140+", badge: "Published", tone: "success" }),
        ),
      ),
    );

  const editorForm = admin.form("surfaceForm", { dirty: true },
    admin.fieldGroup("Service", field.text("name", { label: "Name", value: "Cut" }), field.money("price", { label: "Price", value: "$80+" })),
    admin.saveBar({ status: "Unsaved changes", primary: action.primary("service.save", "Save").placement("footer").toJSON() }),
  ).actions(action.secondary("surface.close", "Cancel").placement("footer"));

  switch (kind) {
    case "drawer":
      return base.drawers(surface.drawer("editDrawer", { title: "Edit service", open: true, selectedId: "cut" }, editorForm)).toJSON();
    case "modal":
      return base.modals(surface.modal("editModal", { title: "Edit in modal", open: true }, editorForm)).toJSON();
    case "sheet":
      return base.drawers(surface.sheet("mobileSheet", { title: "Mobile edit sheet", open: true, mobileFallback: "bottom-sheet" }, editorForm)).toJSON();
    case "detail":
      return base.drawers(surface.detailPanel("serviceDetail", { title: "Service detail", open: true, selectedId: "cut" },
        admin.kvList([
          { label: "Duration", value: "60 min" },
          { label: "Price", value: "$80+" },
          { label: "Status", value: "Published" },
        ]),
      )).toJSON();
    case "inline":
      return base.add(surface.inlinePanel("inlineValidation", { title: "Inline validation panel", open: true, tone: "warn" },
        admin.markdown("The inline panel lives in the main content flow and can show form-local help, validation, or preview content."),
      )).toJSON();
    case "confirm":
      return base.modals(surface.confirm("archiveConfirm", {
        title: "Archive Cut?",
        body: "Clients cannot book archived services, but existing appointments remain visible.",
        tone: "danger",
        confirmLabel: "Archive service",
      })).toJSON();
  }
}

function matrixPage(): AdminPage {
  return admin.page("surface-matrix", "Surface matrix")
    .shell("admin", { eyebrow: "Admin DSL / Surfaces" })
    .describe("All surface variants in one static page for quick visual comparison.")
    .content(
      admin.cardGrid(
        surface.inlinePanel("inline", { title: "Inline panel", open: true }, admin.markdown("In-flow helper or preview.")),
        surface.detailPanel("detail", { title: "Detail panel", open: true }, admin.kvList([{ label: "Selected", value: "Cut" }])),
        surface.drawer("drawer", { title: "Drawer", open: true }, admin.markdown("Side-editing surface.")),
        surface.modal("modal", { title: "Modal", open: true }, admin.markdown("Focused task surface.")),
        surface.sheet("sheet", { title: "Sheet", open: true }, admin.markdown("Mobile-first bottom sheet semantics.")),
        surface.confirm("confirm", { title: "Confirm", body: "Confirm destructive work.", tone: "danger" }),
      ),
    )
    .toJSON();
}

function SurfaceStory({ page }: { page: AdminPage }) {
  return <AdminPageRenderer page={page} context={{ dispatch: (event) => console.log("surface story event", event) }} />;
}

const meta: Meta<typeof SurfaceStory> = {
  title: "Admin DSL/Surfaces/Catalog",
  component: SurfaceStory,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof SurfaceStory>;

export const Drawer: Story = { args: { page: surfacePage("drawer") } };
export const Modal: Story = { args: { page: surfacePage("modal") } };
export const Sheet: Story = { args: { page: surfacePage("sheet") } };
export const DetailPanel: Story = { args: { page: surfacePage("detail") } };
export const InlinePanel: Story = { args: { page: surfacePage("inline") } };
export const Confirm: Story = { args: { page: surfacePage("confirm") } };
export const Matrix: Story = { args: { page: matrixPage() } };
