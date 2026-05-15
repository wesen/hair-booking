import type { Meta, StoryObj } from "@storybook/react";
import { action, admin, resource, surface } from "./builder";
import { AdminPageRenderer } from "./render";
import type { AdminPage } from "./schema";

function adaptivePolicyPage(): AdminPage {
  return admin.page("adaptive-policies", "Adaptive layout policies")
    .shell("admin", { eyebrow: "Admin DSL / Adaptive Policies" })
    .describe("Explicit layout-policy fixtures for reviewing desktop/mobile behavior beyond CSS-only shrinking.")
    .content(
      admin.section("Split pane collapse", { description: "Desktop keeps list/detail side by side; mobile stacks detail first." },
        admin.splitPane({ layoutPolicy: { desktop: { columns: ["320px", "1fr"] }, mobile: { mode: "stack", order: ["detail", "list"] } } },
          resource.list("orders", { layoutPolicy: { desktop: "table", mobile: "cards" } },
            resource.row("order-1", { title: "Order #1042", subtitle: "Pickup today", badge: "Risk", tone: "warn" }).actions(action.open("order.open", "Open").placement("row")),
            resource.row("order-2", { title: "Order #1043", subtitle: "Shipped", badge: "OK", tone: "success" }),
          ),
          surface.detailPanel("orderDetail", { title: "Order detail", open: true, layoutPolicy: { desktop: "side-panel", mobile: "sheet" } },
            admin.kvList([{ label: "Customer", value: "Mia Chen" }, { label: "Total", value: "$168" }]),
          ),
        ),
      ),
      admin.section("Toolbar and sticky regions", {},
        admin.toolbar(
          action.primary("order.save", "Save").placement("toolbar"),
          action.secondary("order.refresh", "Refresh").placement("toolbar"),
          action.danger("order.cancel", "Cancel order").placement("overflow"),
        ).layoutPolicy({ desktop: { placement: "top" }, mobile: { placement: "sticky-bottom", overflow: true } }),
      ),
      admin.section("Adaptive view declaration", {},
        admin.calendarWeek("calendar", {
          days: ["Mon", "Tue", "Wed"],
          hours: ["9a", "10a", "11a"],
          adaptive: { desktop: "weekGrid", mobile: "agenda" },
          layoutPolicy: { desktop: { minWidth: 620 }, mobile: { mode: "agenda" } },
        },
          admin.appointmentBlock("apt-1", { clientName: "Lena Ortiz", service: "Cut", startsAt: "9a", endsAt: "10a", column: 1, row: 1 }),
          admin.timeOffBlock("off-1", { title: "Break", status: "Unavailable", startsAt: "10a", endsAt: "11a", column: 2, row: 2 }),
        ),
      ),
    )
    .drawers(surface.sheet("mobileSaveSheet", { title: "Mobile save sheet", open: true, layoutPolicy: { desktop: "hidden", mobile: "bottom-sheet" } }, admin.markdown("Sticky action region for compact screens.")))
    .toJSON();
}

function AdaptivePolicyStory({ page }: { page: AdminPage }) {
  return <AdminPageRenderer page={page} context={{ dispatch: (event) => console.log("adaptive policy event", event) }} />;
}

const desktopParameters = {
  viewport: { defaultViewport: "desktop1440" },
  globals: { viewport: { value: "desktop1440", isRotated: false } },
};

const mobileParameters = {
  viewport: { defaultViewport: "iPhone14" },
  globals: { viewport: { value: "iPhone14", isRotated: false } },
};

const meta: Meta<typeof AdaptivePolicyStory> = {
  title: "Admin DSL/Adaptive Policies",
  component: AdaptivePolicyStory,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof AdaptivePolicyStory>;

export const Desktop: Story = { args: { page: adaptivePolicyPage() }, parameters: desktopParameters };
export const Mobile: Story = { args: { page: adaptivePolicyPage() }, parameters: mobileParameters };
