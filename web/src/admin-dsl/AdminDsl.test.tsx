import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { action, admin, resource } from "./builder";
import { servicesAdminPage } from "./examples";
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
  });
});
