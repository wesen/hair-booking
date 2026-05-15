import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { action, admin, field, resource, surface } from "./builder";
import { calendarAdminPage, servicesAdminPage } from "./examples";
import { AdminPageRenderer } from "./render";

describe("admin DSL", () => {
  it("builders emit plain JSON pages", () => {
    const page = admin.page("test-admin", "Test admin")
      .shell("admin", { active: "test" })
      .content(
        admin.section("Rows", {},
          resource.list("items", {},
            resource.row("row-1", { title: "First row" })
              .actions(action.open("edit", "Edit", { id: "row-1" })),
          ),
        ),
      )
      .toJSON();

    expect(page).toEqual(expect.objectContaining({
      schemaVersion: 1,
      id: "test-admin",
      title: "Test admin",
      shell: { kind: "admin", props: { active: "test" } },
    }));
    expect(JSON.parse(JSON.stringify(page))).toEqual(page);
    expect(page.nodes[0].kind).toBe("section");
  });

  it("serializes semantic action metadata from fluent helpers", () => {
    const page = admin.page("actions", "Actions")
      .content(
        resource.row("row-1", { title: "Row" })
          .actions(
            action.primary("save", "Save").placement("footer"),
            action.danger("archive", "Archive").placement("row").accessibilityLabel("Archive service"),
            action.ghost("cancel", "Cancel").disabled(),
          ),
      )
      .toJSON();

    const actions = page.nodes[0].props?.actions;
    expect(actions).toEqual(expect.arrayContaining([
      expect.objectContaining({ target: "save", intent: "primary", priority: "primary", placement: "footer" }),
      expect.objectContaining({ target: "archive", intent: "danger", requiresConfirmation: true, accessibilityLabel: "Archive service" }),
      expect.objectContaining({ target: "cancel", priority: "tertiary", presentation: "link", disabled: true }),
    ]));
    expect(JSON.parse(JSON.stringify(page))).toEqual(page);
  });

  it("serializes layout policy and adaptive view helpers", () => {
    const page = admin.page("policy", "Policy")
      .content(
        admin.splitPane({})
          .layoutPolicy({ desktop: { columns: ["320px", "1fr"] }, mobile: { mode: "stack" } })
          .adaptive({ desktop: "split", mobile: "stack" }),
      )
      .toJSON();
    expect(page.nodes[0].props).toEqual(expect.objectContaining({
      layoutPolicy: { desktop: { columns: ["320px", "1fr"] }, mobile: { mode: "stack" } },
      adaptive: { desktop: "split", mobile: "stack" },
    }));
    expect(JSON.parse(JSON.stringify(page))).toEqual(page);
  });

  it("serializes resource and form lifecycle helpers", () => {
    const page = resource.page("lifecycle", "Lifecycle")
      .content(
        resource.list("items", { state: "empty" }).empty(admin.emptyState("No items")),
        admin.form("itemForm", { title: "Item" })
          .state("dirty")
          .dirty()
          .values({ name: "Cut" })
          .errors({ price: "Required" })
          .children(field.text("name", { label: "Name", value: "Cut" }))
          .submit(action.primary("item.save", "Save"))
          .cancel(action.secondary("item.cancel", "Cancel")),
      )
      .toJSON();

    expect(page.nodes[0].props).toEqual(expect.objectContaining({ state: "empty", empty: expect.objectContaining({ kind: "emptyState" }) }));
    expect(page.nodes[1].props).toEqual(expect.objectContaining({
      state: "dirty",
      dirty: true,
      values: { name: "Cut" },
      errors: { price: "Required" },
      actions: expect.objectContaining({ submit: expect.objectContaining({ target: "item.save" }), cancel: expect.objectContaining({ target: "item.cancel" }) }),
    }));
    expect(JSON.parse(JSON.stringify(page))).toEqual(page);
  });

  it("renders resource lifecycle empty and form validation states", () => {
    const page = resource.page("render-lifecycle", "Render lifecycle")
      .content(
        resource.list("items", { state: "empty", emptyTitle: "No items" }),
        admin.form("itemForm", { title: "Item", dirty: true, errors: { name: "Required" } }, field.text("name", { label: "Name", value: "" }))
          .submit(action.primary("item.save", "Save")),
      )
      .toJSON();

    render(<AdminPageRenderer page={page} />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(screen.getByText(/name/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("does not render an empty validation box for empty form errors", () => {
    const page = resource.page("empty-errors", "Empty errors")
      .content(admin.form("itemForm", { title: "Item", dirty: true, errors: {} }, field.text("name", { label: "Name", value: "Cut" })))
      .toJSON();

    const { container } = render(<AdminPageRenderer page={page} />);
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(container.querySelector(".adminDslFormErrors")).toBeNull();
  });

  it("serializes surface builders as plain JSON nodes", () => {
    const page = admin.page("surfaces", "Surfaces")
      .content(surface.inlinePanel("inline-help", { title: "Inline help" }, admin.markdown("Help text")))
      .drawers(surface.sheet("mobile-editor", { title: "Mobile editor", open: true }))
      .modals(surface.confirm("delete-service", { title: "Delete service?", tone: "danger" }))
      .toJSON();

    expect(page.nodes[0]).toEqual(expect.objectContaining({ kind: "inlinePanel" }));
    expect(page.drawers?.[0]).toEqual(expect.objectContaining({ kind: "sheet", props: expect.objectContaining({ presentation: "sheet" }) }));
    expect(page.modals?.[0]).toEqual(expect.objectContaining({ kind: "confirmDialog", props: expect.objectContaining({ presentation: "confirm" }) }));
    expect(JSON.parse(JSON.stringify(page))).toEqual(page);
  });

  it("renders services demo rows and dispatches row actions", () => {
    const dispatch = vi.fn();
    render(<AdminPageRenderer page={servicesAdminPage} context={{ dispatch }} />);

    expect(screen.getByText("Services & pricing")).toBeInTheDocument();
    expect(screen.getByText("Cut")).toBeInTheDocument();
    expect(screen.getByText("Extensions")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "resourceRow",
      action: expect.objectContaining({ type: "open", target: "editService" }),
    }));

    fireEvent.click(screen.getAllByRole("button", { name: "Archive" })[0]);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "resourceRow",
      action: expect.objectContaining({ type: "confirm", target: "archiveService" }),
    }));
  });

  it("renders the calendar mobile agenda grouped by day", () => {
    const { container } = render(<AdminPageRenderer page={calendarAdminPage} />);
    const agenda = container.querySelector(".adminDslCalendarAgenda");

    expect(agenda).toBeTruthy();
    expect(agenda).toHaveTextContent("Mon");
    expect(agenda).toHaveTextContent("Tue");
    expect(agenda).toHaveTextContent("Lena Ortiz");
    expect(agenda).toHaveTextContent("Maya Chen");
    expect(agenda).toHaveTextContent("Jules Park");
    expect(agenda).toHaveTextContent("Personal errand");
  });

  it("dispatches calendar appointment actions after component extraction", () => {
    const dispatch = vi.fn();
    const { container } = render(<AdminPageRenderer page={calendarAdminPage} context={{ dispatch }} />);
    const appointment = container.querySelector('[data-admin-dsl-id="apt-1001"]');

    expect(appointment).toBeTruthy();
    fireEvent.click(appointment!);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "appointmentBlock",
      action: expect.objectContaining({ type: "open", target: "appointmentDetail" }),
    }));
  });
});
