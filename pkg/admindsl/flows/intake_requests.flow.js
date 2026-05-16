const admin = require("fringe/admin-dsl");
const intakeAdmin = require("host/intake-admin");

function requestTitle(request) {
  return (request.customerName || "Anonymous") + " · " + request.serviceValue;
}

function bookingLabel(request) {
  if (!request.dayValue && !request.timeValue) return "TBD";
  return (request.dayValue || "TBD") + (request.timeValue ? " " + request.timeValue : "");
}

function requestRows(requests) {
  return (requests || []).map(function(request) {
    return {
      id: request.id,
      status: request.status,
      customer: request.customerName || "Anonymous",
      service: request.serviceValue,
      estimate: request.estimateLabel || "Pending",
      booking: bookingLabel(request),
      photos: String(Object.keys(request.photos || {}).filter(function(key) { return !!request.photos[key]; }).length),
    };
  });
}

function requestTable(ctx, requests, emptyTitle, deps) {
  const openRequest = ctx.bind(admin.open("request.open", "Open").Placement("row"), function(event) {
    ctx.state.selectedRequestId = event.value && event.value.id;
    ctx.state.screen = "requestDetail";
    return deps.render(ctx);
  });
  return admin.resourceTable("requests", {
    columns: [
      { id: "status", label: "Status" },
      { id: "customer", label: "Customer" },
      { id: "service", label: "Service" },
      { id: "estimate", label: "Estimate" },
      { id: "booking", label: "Booking" },
      { id: "photos", label: "Photos" }
    ],
    rows: requestRows(requests),
    emptyTitle: emptyTitle || "No intake requests"
  }).Actions(openRequest);
}

function requestsScreen(ctx, deps) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return deps.go(ctx, "dashboard"); });
  const setFilter = ctx.bind(admin.secondary("filter.status", "Filter").Placement("toolbar"), function(event) { ctx.state.statusFilter = event.value && event.value.id || ""; return deps.render(ctx); });
  const search = ctx.bind(admin.secondary("filter.search", "Search").Placement("toolbar"), function(event) { ctx.state.searchQuery = event.value && event.value.query || ""; return deps.render(ctx); });
  const requests = intakeAdmin.listRequests({ status: ctx.state.statusFilter || "", limit: 50 });
  return admin.pageResource("admin-intake-requests", "Intake Requests")
    .Shell("resource", { active: "requests", eyebrow: "Real Admin · Intake" })
    .Description("Review persisted customer intake submissions.")
    .Content(
      admin.toolbar().Actions(back),
      admin.filterBar("requestStatusFilters", { filters: [
        { id: "new", label: "New" },
        { id: "reviewing", label: "Reviewing" },
        { id: "needs_info", label: "Needs info" },
        { id: "booked", label: "Booked" },
        { id: "", label: "All" }
      ], value: ctx.state.statusFilter || "" }).Actions(setFilter),
      admin.searchBox("requestSearch", { placeholder: "Search customer or service", value: ctx.state.searchQuery || "" }).Actions(search),
      admin.section("Request queue", { description: "Dense queue rendered with the HAIR-041 resourceTable primitive." }, requestTable(ctx, requests, "No requests match this filter", deps))
    )
    .MustBuild();
}

function photosForGallery(request) {
  const photos = request.photos || {};
  return Object.keys(photos).map(function(slot) {
    const photo = photos[slot] || {};
    return {
      id: photo.uploadId || slot,
      slot: slot,
      title: slot,
      subtitle: photo.originalFilename || photo.publicUrl || "Uploaded reference",
      url: photo.publicUrl || photo.url || "",
      status: photo.publicUrl || photo.url ? "Stored" : "Missing blob",
      tone: photo.publicUrl || photo.url ? "success" : "danger"
    };
  });
}

function requestDetailScreen(ctx, deps) {
  const request = intakeAdmin.getRequest(ctx.state.selectedRequestId);
  const back = ctx.bind(admin.secondary("nav.requests", "Back to requests").Placement("toolbar"), function() { ctx.state.photoModal = null; return deps.go(ctx, "requests"); });
  const markReviewing = ctx.bind(admin.primary("request.reviewing", "Mark reviewing").Placement("toolbar"), function() {
    intakeAdmin.updateRequestStatus(request.id, "reviewing", "Marked reviewing from Admin DSL");
    return deps.render(ctx);
  });
  const needsInfo = ctx.bind(admin.secondary("request.needsInfo", "Needs info").Placement("toolbar"), function() {
    intakeAdmin.updateRequestStatus(request.id, "needs_info", "More information requested");
    return deps.render(ctx);
  });
  const archive = ctx.bind(admin.danger("request.archive", "Archive").Placement("toolbar"), function() {
    intakeAdmin.updateRequestStatus(request.id, "archived", "Archived from Admin DSL");
    ctx.state.photoModal = null;
    return deps.go(ctx, "requests");
  });
  const openPhoto = ctx.bind(admin.open("photo.open", "Open photo").Placement("detail"), function(event) {
    ctx.state.photoModal = event.value;
    return deps.render(ctx);
  });
  const closePhoto = ctx.bind(admin.secondary("photo.close", "Close").Placement("footer"), function() {
    ctx.state.photoModal = null;
    return deps.render(ctx);
  });

  const page = admin.pageResource("admin-intake-request-detail", "Request " + request.id)
    .Shell("resource", { active: "requests", eyebrow: "Real Admin · Intake" })
    .Description(requestTitle(request) + " · " + request.status)
    .Content(
      admin.toolbar().Actions(back, markReviewing, needsInfo, archive),
      admin.cardGrid({ columns: 2 },
        admin.summaryCard("Summary", { body: "Service: " + request.serviceValue + "\nEstimate: " + (request.estimateLabel || "Pending") + "\nBooking: " + bookingLabel(request) + "\nBudget: " + (request.budgetValue || "Not set") }),
        admin.summaryCard("Internal notes", { body: request.internalNotes || "No internal notes yet." })
      ),
      admin.section("Photos", { description: "Uploaded front/side/back customer references. Missing blobs render as explicit error tiles." },
        admin.imageGallery("requestPhotos", { images: photosForGallery(request), emptyText: "No photos were uploaded for this request." }).Actions(openPhoto)
      ),
      admin.section("Raw request snapshot", {},
        admin.markdown(JSON.stringify(request.request || {}, null, 2), {})
      )
    );

  if (ctx.state.photoModal) {
    const photo = ctx.state.photoModal;
    const body = photo.url ? "File: " + (photo.subtitle || photo.id || "photo") + "\nStatus: " + (photo.status || "Stored") : "Could not load the stored blob for " + (photo.id || photo.slot || "this photo") + ". The request is still available, but this photo may have been removed.";
    page.Modals(admin.surface.modal("photoViewer", { title: photo.url ? "Photo · " + (photo.title || photo.slot || "Uploaded") : "Photo unavailable", open: true },
      admin.summaryCard(photo.url ? "Photo metadata" : "Missing photo", { body: body }).Actions(closePhoto)
    ));
  }

  return page.MustBuild();
}

module.exports = { requestTable, requestsScreen, requestDetailScreen };
