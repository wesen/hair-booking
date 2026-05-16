import type { Meta, StoryObj } from "@storybook/react";
import { action, admin, resource, surface } from "./builder";
import { AdminPageRenderer } from "./render";
import type { AdminJsonObject, AdminPage } from "./schema";

const requestColumns: AdminJsonObject[] = [
  { id: "status", label: "Status" },
  { id: "customer", label: "Customer" },
  { id: "service", label: "Service" },
  { id: "estimate", label: "Estimate" },
  { id: "booking", label: "Booking" },
  { id: "photos", label: "Photos" },
];

const requestRows: AdminJsonObject[] = [
  { id: "req_1001", status: "new", customer: "Maya Chen", service: "Highlights", estimate: "$220–$420", booking: "Jun 19 12:00", photos: "3" },
  { id: "req_1002", status: "needs_info", customer: "Lena Ortiz", service: "Gloss refresh", estimate: "$120–$190", booking: "TBD", photos: "1" },
  { id: "req_1003", status: "reviewing", customer: "Jules Park", service: "Cut", estimate: "$80–$160", booking: "Jun 20 14:00", photos: "0" },
  { id: "req_1004", status: "booked", customer: "Noor Haddad", service: "Balayage", estimate: "$360–$520", booking: "Jun 21 10:30", photos: "2" },
];

const configColumns: AdminJsonObject[] = [
  { id: "status", label: "Status" },
  { id: "label", label: "Label" },
  { id: "id", label: "ID" },
  { id: "activatedAt", label: "Activated" },
];

const configRows: AdminJsonObject[] = [
  { id: "cfg_default", status: "active", label: "Default Fringe intake config", activatedAt: "2026-05-15 09:14" },
  { id: "cfg_2026_summer", status: "draft", label: "Summer service menu", activatedAt: "—" },
  { id: "cfg_2026_spring", status: "archived", label: "Spring menu", activatedAt: "2026-03-21 08:00" },
];

const galleryImages: AdminJsonObject[] = [
  { id: "upl_front", slot: "front", title: "Front", subtitle: "front.jpg · 1.8 MB", url: "", status: "Missing blob", tone: "danger" },
  { id: "upl_side", slot: "side", title: "Side", subtitle: "side.jpg · Stored", url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=640&q=60", status: "Stored", tone: "success" },
  { id: "upl_back", slot: "back", title: "Back", subtitle: "back.jpg · Stored", url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=640&q=60", status: "Stored", tone: "success" },
];

function shell(title: string, description: string, ...nodes: Parameters<ReturnType<typeof admin.page>["content"]>): AdminPage {
  return admin.page(`data-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, title)
    .shell("admin", { eyebrow: "Admin DSL / Data Components" })
    .describe(description)
    .content(...nodes)
    .toJSON();
}

function tablePage(kind: "requests" | "configs" | "empty" | "dense"): AdminPage {
  if (kind === "configs") {
    return shell(
      "Config versions table",
      "Versioned intake config rows rendered with the reusable resourceTable primitive.",
      admin.section("Config versions", { description: "Active/draft/archived rows with a compact admin-table layout." },
        resource.table("configVersions", configColumns, configRows),
      ),
    );
  }
  if (kind === "empty") {
    return shell(
      "Empty request table",
      "Empty state rendering for queues whose filters currently match no rows.",
      admin.section("No new requests", {},
        resource.table("emptyRequests", requestColumns, [], { emptyTitle: "No requests match these filters", emptyBody: "Try switching to All or clearing search." }),
      ),
    );
  }
  const rows = kind === "dense" ? Array.from({ length: 16 }, (_, index) => ({
    ...requestRows[index % requestRows.length],
    id: `req_dense_${index + 1}`,
    customer: `${requestRows[index % requestRows.length].customer} ${index + 1}`,
  })) : requestRows;
  return shell(
    kind === "dense" ? "Dense request table" : "Request table with row actions",
    "Request queue table with row action dispatch. Visual review should check desktop density and mobile horizontal scroll.",
    admin.section("Request queue", { description: "The Open action dispatches the selected row object to the backend flow." },
      resource.table("requests", requestColumns, rows)
        .actions(action.open("request.open", "Open").placement("row")),
    ),
  );
}

function galleryPage(kind: "stored" | "mixed" | "empty" | "modal"): AdminPage {
  if (kind === "empty") {
    return shell(
      "Empty image gallery",
      "No-photo state for an intake request whose customer skipped uploads.",
      admin.section("Photos", {}, admin.imageGallery("photos", [], { emptyText: "No photos were uploaded for this request." })),
    );
  }
  if (kind === "modal") {
    return admin.page("data-gallery-modal", "Image gallery modal state")
      .shell("admin", { eyebrow: "Admin DSL / Data Components" })
      .describe("Static modal fixture for reviewing photo metadata and missing-photo copy.")
      .content(
        admin.section("Photos", {},
          admin.imageGallery("photos", galleryImages, {}).actions(action.open("photo.open", "Open photo").placement("detail")),
        ),
      )
      .modals(surface.modal("photoViewer", { title: "Photo unavailable", open: true },
        admin.summary("Missing photo", { body: "Could not load the stored blob for upl_front. The request is still available, but this photo may have been removed." })
          .actions(action.secondary("photo.close", "Close").placement("footer")),
      ))
      .toJSON();
  }
  const images = kind === "stored" ? galleryImages.filter((image) => !!image.url) : galleryImages;
  return shell(
    kind === "stored" ? "Stored image gallery" : "Mixed image gallery",
    "Gallery tiles for intake front/side/back photos. Mixed state includes an explicit missing-blob tile.",
    admin.section("Photos", { description: "Gallery tiles can be passive or dispatch selected image objects when actions are attached." },
      admin.imageGallery("photos", images, {}).actions(action.open("photo.open", "Open photo").placement("detail")),
    ),
  );
}

function composedRequestReviewPage(): AdminPage {
  return admin.page("data-request-review-composed", "Request review composed state")
    .shell("resource", { eyebrow: "Admin DSL / Data Components", active: "requests" })
    .describe("Composed fixture combining resourceTable, summary cards, imageGallery, and modal surfaces.")
    .content(
      admin.section("Request queue", {},
        resource.table("requests", requestColumns, requestRows).actions(action.open("request.open", "Open").placement("row")),
      ),
      admin.cardGrid(
        admin.summary("Summary", { body: "Service: Highlights\nEstimate: $220–$420\nBooking: Jun 19 12:00\nBudget: Flexible" }),
        admin.summary("Internal notes", { body: "Marked reviewing from Admin DSL." }),
      ),
      admin.section("Photos", {},
        admin.imageGallery("photos", galleryImages).actions(action.open("photo.open", "Open photo").placement("detail")),
      ),
    )
    .toJSON();
}

function DataStory({ page }: { page: AdminPage }) {
  return <AdminPageRenderer page={page} context={{ dispatch: (event) => console.log("data component story event", event) }} />;
}

const meta: Meta<typeof DataStory> = {
  title: "Admin DSL/Data Components",
  component: DataStory,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof DataStory>;

export const RequestTableWithRowActions: Story = { args: { page: tablePage("requests") } };
export const RequestTableDenseDesktop: Story = { args: { page: tablePage("dense") } };
export const RequestTableMobileScroll: Story = {
  args: { page: tablePage("requests") },
  parameters: { viewport: { defaultViewport: "iphone14" } },
};
export const RequestTableEmptyState: Story = { args: { page: tablePage("empty") } };
export const ConfigVersionsTable: Story = { args: { page: tablePage("configs") } };
export const ImageGalleryStored: Story = { args: { page: galleryPage("stored") } };
export const ImageGalleryMixedMissingBlob: Story = { args: { page: galleryPage("mixed") } };
export const ImageGalleryEmptyState: Story = { args: { page: galleryPage("empty") } };
export const ImageGalleryModalMissingPhoto: Story = { args: { page: galleryPage("modal") } };
export const ComposedRequestReview: Story = { args: { page: composedRequestReviewPage() } };
export const ComposedRequestReviewMobile: Story = {
  args: { page: composedRequestReviewPage() },
  parameters: { viewport: { defaultViewport: "iphone14" } },
};
