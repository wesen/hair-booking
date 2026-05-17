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

  it("allows form fields to be edited and dispatches submitted values", () => {
    const dispatch = vi.fn();
    const page = resource.page("editable-form", "Editable form")
      .content(
        admin.form("itemForm", { title: "Item", dirty: true }, field.text("name", { label: "Name", value: "Cut" }))
          .submit(action.primary("item.save", "Save")),
      )
      .toJSON();

    render(<AdminPageRenderer page={page} context={{ dispatch }} />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "Curly Cut" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "form",
      value: { name: "Curly Cut" },
    }));
  });

  it("renders resource tables and dispatches row values", () => {
    const dispatch = vi.fn();
    const page = admin.page("table", "Table")
      .content({
        kind: "resourceTable",
        props: {
          id: "requests",
          columns: [{ id: "customer", label: "Customer" }, { id: "service", label: "Service" }],
          rows: [{ id: "req_1", customer: "Maya", service: "Highlights" }],
          actions: [action.open("request.open", "Open").placement("row").toJSON()],
        },
        meta: { id: "requests" },
      })
      .toJSON();

    render(<AdminPageRenderer page={page} context={{ dispatch }} />);
    expect(screen.getByText("Maya")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "resourceTable",
      value: expect.objectContaining({ id: "req_1" }),
    }));
  });

  it("renders image galleries and dispatches selected image values", () => {
    const dispatch = vi.fn();
    const page = admin.page("gallery", "Gallery")
      .content({
        kind: "imageGallery",
        props: {
          id: "photos",
          images: [{ id: "front", title: "Front", status: "Stored" }],
          actions: [action.open("photo.open", "Open photo").placement("detail").toJSON()],
        },
        meta: { id: "photos" },
      })
      .toJSON();

    render(<AdminPageRenderer page={page} context={{ dispatch }} />);
    fireEvent.click(screen.getByRole("button", { name: "Open Front" }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "imageGallery",
      value: expect.objectContaining({ id: "front" }),
    }));
  });

  it("dispatches actionable filter and search controls", () => {
    const dispatch = vi.fn();
    const page = admin.page("controls", "Controls")
      .content(
        admin.filterBar([{ id: "new", label: "New" }, { id: "", label: "All" }], "new")
          .actions(action.secondary("filter.change", "Filter")),
        admin.searchBox("Search requests")
          .actions(action.secondary("search.submit", "Search")),
      )
      .toJSON();

    render(<AdminPageRenderer page={page} context={{ dispatch }} />);
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Search" }), { target: { value: "Maya" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "filterBar",
      value: expect.objectContaining({ id: "" }),
    }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "searchBox",
      value: { query: "Maya" },
    }));
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

  it("renders v2 workbench shell and dispatches sidebar and page header actions", () => {
    const dispatch = vi.fn();
    const page = admin.page("workbench-test", "Workbench")
      .schemaVersion(2)
      .shell("admin", {
        variant: "workbench",
        sidebar: {
          active: "overview",
          items: [
            { id: "overview", label: "Overview", icon: "O", action: action.mutation("nav.overview", "Overview").placement("sidebarNav").toJSON() },
            { id: "services", label: "Services", icon: "S", action: action.mutation("nav.services", "Services").placement("sidebarNav").toJSON() },
          ],
          user: { name: "Admin User", role: "Administrator", initials: "AD" },
        },
      })
      .content(admin.pageHeader({ title: "Workbench", description: "Dense admin page", actions: [action.primary("service.new", "New Service").placement("pageHeader").toJSON()] }))
      .toJSON();

    render(<AdminPageRenderer page={page} context={{ dispatch }} />);
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Services" }));
    fireEvent.click(screen.getByRole("button", { name: "New Service" }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: "workbench-sidebar",
      action: expect.objectContaining({ target: "nav.services", placement: "sidebarNav" }),
    }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "pageHeader",
      action: expect.objectContaining({ target: "service.new", placement: "pageHeader" }),
    }));
  });

  it("renders v2 resource table typed cells and dispatches overflow row actions", () => {
    const dispatch = vi.fn();
    const page = admin.page("typed-table", "Typed table")
      .schemaVersion(2)
      .content(resource.table("services", [
        { id: "handle", kind: "dragHandle", label: "" },
        { id: "name", kind: "text", label: "Service", primary: true },
        { id: "status", kind: "badge", label: "Status", map: { published: { label: "Published", tone: "success" } } },
        { id: "actions", kind: "overflowActions", label: "Actions" },
      ], [
        { id: "svc_1", name: "Highlights", status: "published", actions: [action.open("service.menu", "Open", { id: "svc_1" }).placement("rowOverflow").toJSON()] },
      ]))
      .toJSON();

    render(<AdminPageRenderer page={page} context={{ dispatch }} />);
    expect(screen.getByText("Highlights")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open row actions" }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "resourceTable",
      action: expect.objectContaining({ target: "service.menu", placement: "rowOverflow" }),
      value: expect.objectContaining({ id: "svc_1" }),
    }));
  });

  it("renders v2 comparison tables and dispatches review actions", () => {
    const dispatch = vi.fn();
    const page = admin.page("comparison", "Comparison")
      .schemaVersion(2)
      .content(admin.comparisonTable("drafts", [
        { id: "price", field: "Highlights – Price", current: "$200", draft: "$220", scheduled: "Jun 23", actions: [action.open("draft.review", "Review", { id: "price" }).placement("row").toJSON()] },
      ]))
      .toJSON();

    render(<AdminPageRenderer page={page} context={{ dispatch }} />);
    expect(screen.getByText("Highlights – Price")).toBeInTheDocument();
    expect(screen.getByText("$220")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "comparisonTable",
      action: expect.objectContaining({ target: "draft.review" }),
    }));
  });

  it("renders v2 month calendars and dispatches selected dates", () => {
    const dispatch = vi.fn();
    const page = admin.page("month", "Month")
      .schemaVersion(2)
      .content(admin.monthCalendar("calendar", {
        month: "2024-06",
        selectedDate: "2024-06-19",
        markers: [{ date: "2024-06-23", kind: "scheduled" }],
        legend: [{ kind: "scheduled", label: "Scheduled", tone: "warning" }],
        actions: { selectDate: action.mutation("calendar.selectDate", "Select date").placement("calendarCell").toJSON() },
      }))
      .toJSON();

    render(<AdminPageRenderer page={page} context={{ dispatch }} />);
    expect(screen.getByText("June 2024")).toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "23" }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeKind: "monthCalendar",
      action: expect.objectContaining({ target: "calendar.selectDate", placement: "calendarCell" }),
      value: { date: "2024-06-23" },
    }));
  });
});
