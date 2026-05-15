import { action, admin, field, resource } from "./builder";
import type { AdminPage } from "./schema";

export const commerceOrdersPage = admin.page("commerce-orders", "Orders")
  .describe("Master/detail order operations with fulfillment, payment risk, refunds, and shipping exceptions.")
  .shell("resource", { active: "orders", eyebrow: "Commerce admin", owner: "Ops" })
  .toolbar(action.refresh("orders.list"), action.open("createManualOrder", "Manual order"))
  .content(
    admin.cardGrid(
      admin.metric("Open", 42, { caption: "Awaiting fulfillment", tone: "warn" }),
      admin.metric("Revenue", "$18.4k", { caption: "Last 7 days", tone: "success" }),
      admin.metric("Risk", 3, { caption: "Needs payment review", tone: "danger" }),
    ),
    admin.section("Order queue", { description: "A high-volume resource list with filters, search, row actions, and a detail drawer." },
      admin.tabs([
        { id: "open", label: "Open" },
        { id: "risk", label: "Risk" },
        { id: "fulfilled", label: "Fulfilled" },
      ], "open"),
      admin.searchBox("Search order, customer, or tracking number"),
      resource.list("orders", {},
        resource.row("ord-1042", { title: "#1042 · Mina Carter", subtitle: "$284.00 · 3 items · UPS Ground", badge: "Paid", tone: "success" }).actions(action.open("orderDetail", "Open", { id: "ord-1042" }), action.confirm("refundOrder", "Refund", { id: "ord-1042" })),
        resource.row("ord-1043", { title: "#1043 · Devon Gray", subtitle: "$1,120.00 · expedited · billing mismatch", badge: "Risk", tone: "danger" }).actions(action.open("orderDetail", "Open", { id: "ord-1043" }), action.confirm("holdOrder", "Hold", { id: "ord-1043" })),
        resource.row("ord-1044", { title: "#1044 · Priya Shah", subtitle: "$64.00 · label failed", badge: "Exception", tone: "warn" }).actions(action.open("orderDetail", "Open", { id: "ord-1044" })),
      ),
    ),
  )
  .drawers(
    admin.drawer("orderDetail", { title: "Order #1042", open: true },
      admin.kvList([
        { label: "Customer", value: "Mina Carter" },
        { label: "Payment", value: "Paid · Visa ending 8821" },
        { label: "Fulfillment", value: "Pick + pack pending" },
        { label: "Address", value: "12 Hudson St, Brooklyn" },
      ]),
      admin.activityFeed([
        { time: "09:14", title: "Payment captured", body: "$284.00 authorized and captured." },
        { time: "09:16", title: "Inventory reserved", body: "3 items reserved in warehouse A." },
      ]),
    ),
  )
  .modals(admin.confirm("refundOrder", { title: "Refund order?", body: "This will create a refund event and notify the customer.", confirmLabel: "Refund", tone: "danger" }))
  .meta({ storyTitle: "Admin DSL Layouts/Commerce Orders", tags: ["admin", "commerce", "layout"] })
  .toJSON();

export const courseAdminPage = admin.page("course-admin", "Course builder")
  .describe("Education/admin layout with curriculum outline, draft lessons, moderation, and publishing state.")
  .shell("settings", { active: "courses", eyebrow: "Learning admin", owner: "Academy" })
  .toolbar(action.open("newLesson", "New lesson"), action.mutation("course.publish", "Publish course"))
  .content(
    admin.splitPane({ left: "curriculum", right: "editor" },
      admin.panel("Curriculum", {},
        resource.list("lessons", {},
          resource.row("lesson-1", { title: "01 · Foundations", subtitle: "Published · 18 min", badge: "Live", tone: "success" }).actions(action.open("lessonEditor", "Edit", { id: "lesson-1" })),
          resource.row("lesson-2", { title: "02 · Data modeling", subtitle: "Draft · needs quiz", badge: "Draft", tone: "warn" }).actions(action.open("lessonEditor", "Edit", { id: "lesson-2" })),
          resource.row("lesson-3", { title: "03 · Deployment", subtitle: "Review requested", badge: "Review", tone: "plum" }).actions(action.open("lessonEditor", "Edit", { id: "lesson-3" })),
        ),
      ),
      admin.panel("Lesson editor", { body: "A settings/form panel next to the outline." },
        admin.form("lessonForm", {},
          field.text("title", { label: "Lesson title", value: "Data modeling" }),
          field.select("status", [{ value: "draft", label: "Draft" }, { value: "review", label: "Review" }, { value: "published", label: "Published" }], { label: "Status", value: "draft" }),
          field.textarea("summary", { label: "Summary", value: "Explain schema design and migrations." }),
          admin.saveBar({ status: "unsaved", primary: action.mutation("lesson.save", "Save lesson", { id: "lesson-2" }).toJSON() }),
        ),
      ),
    ),
  )
  .modals(admin.modal("newLesson", { title: "New lesson" }, admin.form("newLessonForm", {}, field.text("title", { label: "Title" }), field.select("type", [{ value: "video", label: "Video" }, { value: "article", label: "Article" }], { label: "Type" }))))
  .meta({ storyTitle: "Admin DSL Layouts/Course Builder", tags: ["admin", "education", "layout"] })
  .toJSON();

export const cmsPublishingPage = admin.settings("cms-publishing", "Publishing")
  .describe("CMS/content operations with draft copy, preview panels, SEO, and publishing workflow.")
  .shell("settings", { active: "content", eyebrow: "CMS admin", owner: "Editorial" })
  .toolbar(action.mutation("content.saveDraft", "Save draft"), action.mutation("content.publish", "Publish"))
  .content(
    admin.splitPane({},
      admin.panel("Homepage content", {},
        admin.form("homepageContent", {},
          field.text("heroTitle", { label: "Hero title", value: "Build better workflows" }),
          field.textarea("heroSubtitle", { label: "Hero subtitle", value: "A practical system for operations teams." }),
          field.text("seoTitle", { label: "SEO title", value: "Workflow platform for ops" }),
          field.switch("published", { label: "Ready to publish", value: false }),
        ),
      ),
      admin.panel("Live preview", { body: "Preview region for rendered website content." },
        admin.markdown("# Build better workflows\n\nA practical system for operations teams.\n\n**CTA:** Start free trial"),
        admin.inlineError("Missing social preview image", { body: "Upload an OG image before publishing." }),
      ),
    ),
  )
  .meta({ storyTitle: "Admin DSL Layouts/CMS Publishing", tags: ["admin", "cms", "layout"] })
  .toJSON();

export const supportInboxPage = admin.page("support-inbox", "Support inbox")
  .describe("Inbox workflow with assignment, SLA status, conversation context, and macro actions.")
  .shell("resource", { active: "support", eyebrow: "Support admin", owner: "CX" })
  .toolbar(action.refresh("tickets.list"), action.open("newMacro", "New macro"))
  .content(
    admin.section("Tickets", {},
      admin.filterBar([{ id: "mine", label: "Mine" }, { id: "unassigned", label: "Unassigned" }, { id: "sla", label: "SLA risk" }], "sla"),
      resource.list("tickets", {},
        resource.row("ticket-1", { title: "Refund not received", subtitle: "Ana Gomez · waiting 4 days", badge: "SLA risk", tone: "danger" }).actions(action.open("ticketDetail", "Open", { id: "ticket-1" })),
        resource.row("ticket-2", { title: "Cannot reset password", subtitle: "Ibrahim Noor · unassigned", badge: "New", tone: "warn" }).actions(action.open("ticketDetail", "Open", { id: "ticket-2" })),
        resource.row("ticket-3", { title: "Feature request: invoices", subtitle: "Acme Co · enterprise", badge: "VIP", tone: "plum" }).actions(action.open("ticketDetail", "Open", { id: "ticket-3" })),
      ),
    ),
  )
  .drawers(admin.drawer("ticketDetail", { title: "Refund not received", open: true }, admin.activityFeed([{ time: "Mon", title: "Customer wrote in", body: "Refund still missing after four business days." }, { time: "Tue", title: "Agent replied", body: "Shared bank processing timeline." }]), admin.form("reply", {}, field.textarea("body", { label: "Reply" }), admin.saveBar({ status: "assigned to Mia", primary: action.mutation("ticket.reply", "Send reply").toJSON() }))))
  .meta({ storyTitle: "Admin DSL Layouts/Support Inbox", tags: ["admin", "support", "layout"] })
  .toJSON();

export const mediaLibraryPage = admin.page("media-library", "Media library")
  .describe("Asset-heavy admin surface with image grid, upload actions, metadata editing, and destructive confirmation.")
  .shell("resource", { active: "media", eyebrow: "Media admin", owner: "Brand" })
  .toolbar(action.upload("media.upload", "Upload images", { accept: ["image/jpeg", "image/png"] }), action.open("editAsset", "Edit selected"))
  .content(
    admin.section("Gallery", { description: "Images, captions, visibility, and placement." },
      admin.imageGrid([
        { id: "asset-1", title: "Hero", subtitle: "Homepage", status: "Live", tone: "success" },
        { id: "asset-2", title: "Before/after", subtitle: "Case study", status: "Draft", tone: "warn" },
        { id: "asset-3", title: "Team", subtitle: "About page", status: "Hidden", tone: "muted" },
        { id: "asset-4", title: "Open graph", subtitle: "Social preview", status: "Missing alt", tone: "danger" },
      ]),
    ),
  )
  .modals(admin.modal("editAsset", { title: "Edit asset", open: true }, admin.form("assetForm", {}, field.text("alt", { label: "Alt text", value: "Stylist finishing color service" }), field.text("caption", { label: "Caption", value: "Fresh color result" }), field.switch("visible", { label: "Visible", value: true }), admin.saveBar({ status: "selected", primary: action.mutation("asset.save", "Save asset").toJSON() }))))
  .meta({ storyTitle: "Admin DSL Layouts/Media Library", tags: ["admin", "media", "layout"] })
  .toJSON();

export const analyticsOpsPage = admin.page("analytics-ops", "Operations")
  .describe("Operational dashboard with metrics, activity, degraded data states, and retry paths.")
  .shell("dashboard", { active: "ops", eyebrow: "Ops admin", owner: "Platform" })
  .toolbar(action.refresh("ops.summary"), action.navigate("incidents", "Incidents"))
  .content(
    admin.cardGrid(
      admin.metric("Jobs", "98.7%", { caption: "Successful last 24h", tone: "success" }),
      admin.metric("Queue", 128, { caption: "Pending background jobs", tone: "warn" }),
      admin.metric("Errors", 7, { caption: "New exceptions", tone: "danger" }),
    ),
    admin.section("Pipeline health", {},
      admin.loadingState("Syncing warehouse", { body: "Latest analytics import is still running." }),
      admin.inlineError("Stripe webhook delay", { body: "Last successful event was 18 minutes ago." }),
      admin.activityFeed([{ time: "10:01", title: "Import started", body: "Warehouse sync job queued." }, { time: "10:04", title: "Retry scheduled", body: "Webhook delivery will retry automatically." }]),
    ),
  )
  .meta({ storyTitle: "Admin DSL Layouts/Analytics Ops", tags: ["admin", "analytics", "layout"] })
  .toJSON();

export const teamSettingsPage = admin.settings("team-settings", "Team settings")
  .describe("Account/team administration with roles, invitations, audit events, and dangerous settings.")
  .shell("settings", { active: "team", eyebrow: "Workspace admin", owner: "Owner" })
  .toolbar(action.open("inviteMember", "Invite member"))
  .content(
    admin.section("Members", {},
      resource.list("members", {},
        resource.row("user-1", { title: "Mia Rivera", subtitle: "Owner · mia@example.com", badge: "Owner", tone: "success" }).actions(action.open("memberDetail", "Manage", { id: "user-1" })),
        resource.row("user-2", { title: "Sam Lee", subtitle: "Editor · sam@example.com", badge: "Editor", tone: "plum" }).actions(action.open("memberDetail", "Manage", { id: "user-2" }), action.confirm("removeMember", "Remove", { id: "user-2" })),
      ),
    ),
    admin.section("Audit log", {}, admin.activityFeed([{ time: "Yesterday", title: "Role changed", body: "Sam Lee became Editor." }, { time: "Last week", title: "Invite accepted", body: "Mia invited Sam Lee." }])),
  )
  .modals(admin.modal("inviteMember", { title: "Invite member" }, admin.form("invite", {}, field.text("email", { label: "Email" }), field.select("role", [{ value: "viewer", label: "Viewer" }, { value: "editor", label: "Editor" }, { value: "admin", label: "Admin" }], { label: "Role" }))))
  .meta({ storyTitle: "Admin DSL Layouts/Team Settings", tags: ["admin", "team", "layout"] })
  .toJSON();

export const adminLayoutExamples: Record<string, AdminPage> = {
  commerceOrders: commerceOrdersPage,
  courseAdmin: courseAdminPage,
  cmsPublishing: cmsPublishingPage,
  supportInbox: supportInboxPage,
  mediaLibrary: mediaLibraryPage,
  analyticsOps: analyticsOpsPage,
  teamSettings: teamSettingsPage,
};
