import { useEffect, useState } from "react";
import {
  getApiErrorMessage,
  useStylistAppointmentDetailView,
  useStylistAppointmentsView,
  useStylistClientDetailView,
  useStylistClientsView,
  useStylistDashboardView,
  useStylistIntakeDetailView,
  useStylistIntakesView,
  useUpdateStylistAppointmentMutation,
  useUpdateStylistIntakeReviewMutation,
} from "./store/api";
import { buildStylistPath, resolveStylistRoute, type StylistRoute, type StylistSection } from "./utils/stylistRouting";

const navItems: Array<{ section: StylistSection; label: string }> = [
  { section: "dashboard", label: "Dashboard" },
  { section: "intakes", label: "Intakes" },
  { section: "appointments", label: "Appointments" },
  { section: "clients", label: "Clients" },
];

function pageTitle(route: StylistRoute): string {
  switch (route.section) {
    case "dashboard":
      return "Stylist Dashboard";
    case "intakes":
      return route.id ? "Intake Detail" : "Intake Queue";
    case "appointments":
      return route.id ? "Appointment Detail" : "Appointments";
    case "clients":
      return route.id ? "Client Detail" : "Clients";
    default:
      return "Stylist Workspace";
  }
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Not set";
  }
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function navigateTo(route: StylistRoute) {
  const nextPath = buildStylistPath(route);
  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

function WorkspaceSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-part="page-content">
      <div data-part="section-heading" style={{ marginBottom: 6 }}>{title}</div>
      {subtitle ? (
        <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
          {subtitle}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function LoadingSection({ title }: { title: string }) {
  return (
    <WorkspaceSection title={title}>
      <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>Loading live stylist data...</div>
    </WorkspaceSection>
  );
}

function ErrorSection({ title, message }: { title: string; message: string }) {
  return (
    <WorkspaceSection title={title}>
      <div style={{ fontSize: 14, color: "var(--color-danger)", lineHeight: 1.6 }}>{message}</div>
    </WorkspaceSection>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ fontSize: 14, color: "var(--color-text-muted)", padding: "24px 0", textAlign: "center" }}>
      {message}
    </div>
  );
}

function DashboardPage() {
  const { dashboard, isLoading, errorMessage } = useStylistDashboardView();

  if (isLoading) {
    return <LoadingSection title="Stylist Dashboard" />;
  }
  if (errorMessage || !dashboard) {
    return <ErrorSection title="Stylist Dashboard" message={errorMessage ?? "We could not load the dashboard yet."} />;
  }

  return (
    <WorkspaceSection
      title="Stylist Dashboard"
      subtitle="The live single-stylist home view now comes from the backend summary instead of seeded runtime widgets."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <SummaryCard label="New Intakes" value={dashboard.intakes.new_count} />
        <SummaryCard label="In Review" value={dashboard.intakes.in_review_count} />
        <SummaryCard label="Needs Reply" value={dashboard.intakes.needs_client_reply_count} />
        <SummaryCard label="Today" value={dashboard.today_appointments} />
      </div>

      <ListBlock title="Today Schedule">
        {dashboard.today_schedule.length === 0 ? (
          <EmptyState message="No appointments on today’s schedule." />
        ) : (
          dashboard.today_schedule.map((appointment) => (
            <ListRow
              key={appointment.appointment_id}
              title={appointment.client_name}
              meta={`${appointment.service_name} · ${appointment.start_time}`}
              badge={appointment.status}
              onClick={() => navigateTo({ section: "appointments", id: appointment.appointment_id })}
            />
          ))
        )}
      </ListBlock>

      <ListBlock title="Upcoming Appointments">
        {dashboard.upcoming_appointments.length === 0 ? (
          <EmptyState message="No upcoming appointments found." />
        ) : (
          dashboard.upcoming_appointments.map((appointment) => (
            <ListRow
              key={appointment.appointment_id}
              title={appointment.client_name}
              meta={`${appointment.service_name} · ${formatDate(appointment.date)} · ${appointment.start_time}`}
              badge={appointment.status}
              onClick={() => navigateTo({ section: "appointments", id: appointment.appointment_id })}
            />
          ))
        )}
      </ListBlock>
    </WorkspaceSection>
  );
}

function IntakesPage({ intakeId }: { intakeId?: string }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const listView = useStylistIntakesView(statusFilter ? { status: statusFilter } : undefined);
  const detailView = useStylistIntakeDetailView(intakeId ?? null);
  const [updateReview, updateReviewState] = useUpdateStylistIntakeReviewMutation();
  const [reviewStatus, setReviewStatus] = useState("new");
  const [reviewPriority, setReviewPriority] = useState("normal");
  const [reviewSummary, setReviewSummary] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewLow, setReviewLow] = useState("");
  const [reviewHigh, setReviewHigh] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!detailView.intake) {
      return;
    }
    setReviewStatus(detailView.intake.review.status || "new");
    setReviewPriority(detailView.intake.review.priority || "normal");
    setReviewSummary(detailView.intake.review.summary || "");
    setReviewNotes(detailView.intake.review.internal_notes || "");
    setReviewLow(
      typeof detailView.intake.review.quoted_price_low === "number"
        ? String(detailView.intake.review.quoted_price_low)
        : "",
    );
    setReviewHigh(
      typeof detailView.intake.review.quoted_price_high === "number"
        ? String(detailView.intake.review.quoted_price_high)
        : "",
    );
    setReviewFeedback(null);
  }, [detailView.intake]);

  if (intakeId) {
    if (detailView.isLoading) {
      return <LoadingSection title="Intake Detail" />;
    }
    if (detailView.errorMessage || !detailView.intake) {
      return <ErrorSection title="Intake Detail" message={detailView.errorMessage ?? "We could not load this intake yet."} />;
    }

    const intake = detailView.intake;
    return (
      <WorkspaceSection
        title="Intake Detail"
        subtitle="This route now reads and writes the real stylist review state."
      >
        <BackLink onClick={() => navigateTo({ section: "intakes" })} label="Back to intake queue" />
        <KeyValueList
          items={[
            ["Client", intake.client?.name ?? "Guest intake"],
            ["Service Type", intake.submission.service_type],
            ["Budget", intake.submission.budget ?? "Not provided"],
            ["Dream Result", intake.submission.dream_result ?? "Not provided"],
            ["Estimate", `$${intake.submission.estimate_low}-$${intake.submission.estimate_high}`],
            ["Review Status", intake.review.status],
            ["Priority", intake.review.priority],
          ]}
        />
        <ListBlock title="Review">
          <FormGrid>
            <FormSelect
              label="Status"
              value={reviewStatus}
              onChange={setReviewStatus}
              options={[
                ["new", "New"],
                ["in_review", "In Review"],
                ["needs_client_reply", "Needs Client Reply"],
                ["approved_to_book", "Approved To Book"],
                ["archived", "Archived"],
              ]}
            />
            <FormSelect
              label="Priority"
              value={reviewPriority}
              onChange={setReviewPriority}
              options={[
                ["normal", "Normal"],
                ["urgent", "Urgent"],
              ]}
            />
            <FormInput label="Quote Low" value={reviewLow} onChange={setReviewLow} inputMode="numeric" placeholder="950" />
            <FormInput label="Quote High" value={reviewHigh} onChange={setReviewHigh} inputMode="numeric" placeholder="1350" />
          </FormGrid>
          <FormTextArea label="Summary" value={reviewSummary} onChange={setReviewSummary} placeholder="Concise internal summary" />
          <FormTextArea label="Internal Notes" value={reviewNotes} onChange={setReviewNotes} placeholder="Follow-up or prep notes" rows={4} />
          <FormActions
            submitLabel={updateReviewState.isLoading ? "Saving..." : "Save Review"}
            onSubmit={async () => {
              setReviewFeedback(null);
              try {
                await updateReview({
                  intakeId,
                  body: {
                    status: reviewStatus,
                    priority: reviewPriority,
                    summary: reviewSummary,
                    internal_notes: reviewNotes,
                    ...(reviewLow.trim() !== "" ? { quoted_price_low: Number(reviewLow) } : {}),
                    ...(reviewHigh.trim() !== "" ? { quoted_price_high: Number(reviewHigh) } : {}),
                  },
                }).unwrap();
                setReviewFeedback("Review saved.");
              } catch (error) {
                setReviewFeedback(getApiErrorMessage(error, "We could not save the intake review yet."));
              }
            }}
            disabled={updateReviewState.isLoading}
            feedback={reviewFeedback}
            error={!!(reviewFeedback && reviewFeedback !== "Review saved.")}
          />
        </ListBlock>
        <ListBlock title="Uploaded Photos">
          {intake.photos.length === 0 ? (
            <EmptyState message="No intake photos uploaded yet." />
          ) : (
            intake.photos.map((photo) => (
              <ListRow key={photo.id} title={photo.slot} meta={photo.url} />
            ))
          )}
        </ListBlock>
      </WorkspaceSection>
    );
  }

  if (listView.isLoading) {
    return <LoadingSection title="Intake Queue" />;
  }
  if (listView.errorMessage) {
    return <ErrorSection title="Intake Queue" message={listView.errorMessage} />;
  }

  const filteredIntakes = listView.intakes.filter((intake) => {
    if (priorityFilter && intake.review.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  return (
    <WorkspaceSection
      title="Intake Queue"
      subtitle="The live queue is backend-backed and now supports status and priority filtering."
    >
      <FilterRow>
        <FormSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            ["", "All statuses"],
            ["new", "New"],
            ["in_review", "In Review"],
            ["needs_client_reply", "Needs Client Reply"],
            ["approved_to_book", "Approved To Book"],
            ["archived", "Archived"],
          ]}
        />
        <FormSelect
          label="Priority"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            ["", "All priorities"],
            ["normal", "Normal"],
            ["urgent", "Urgent"],
          ]}
        />
      </FilterRow>
      {filteredIntakes.length === 0 ? (
        <EmptyState message="No intake submissions found." />
      ) : (
        filteredIntakes.map((intake) => (
          <ListRow
            key={intake.id}
            title={intake.client?.name ?? "Guest intake"}
            meta={`${intake.service_type} · ${intake.review.status} · ${formatDate(intake.submitted_at)}`}
            badge={intake.review.priority}
            onClick={() => navigateTo({ section: "intakes", id: intake.id })}
          />
        ))
      )}
    </WorkspaceSection>
  );
}

function AppointmentsPage({ appointmentId }: { appointmentId?: string }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const listView = useStylistAppointmentsView(statusFilter ? { status: statusFilter } : undefined);
  const detailView = useStylistAppointmentDetailView(appointmentId ?? null);
  const [updateAppointment, updateAppointmentState] = useUpdateStylistAppointmentMutation();
  const [appointmentStatus, setAppointmentStatus] = useState("pending");
  const [prepNotes, setPrepNotes] = useState("");
  const [stylistNotes, setStylistNotes] = useState("");
  const [appointmentFeedback, setAppointmentFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!detailView.appointment) {
      return;
    }
    setAppointmentStatus(detailView.appointment.appointment.status || "pending");
    setPrepNotes(detailView.appointment.appointment.prep_notes || "");
    setStylistNotes(detailView.appointment.appointment.stylist_notes || "");
    setAppointmentFeedback(null);
  }, [detailView.appointment]);

  if (appointmentId) {
    if (detailView.isLoading) {
      return <LoadingSection title="Appointment Detail" />;
    }
    if (detailView.errorMessage || !detailView.appointment) {
      return <ErrorSection title="Appointment Detail" message={detailView.errorMessage ?? "We could not load this appointment yet."} />;
    }

    const detail = detailView.appointment;
    return (
      <WorkspaceSection
        title="Appointment Detail"
        subtitle="This route now reads and writes real operational appointment data."
      >
        <BackLink onClick={() => navigateTo({ section: "appointments" })} label="Back to appointments" />
        <KeyValueList
          items={[
            ["Client", detail.client?.name ?? detail.appointment.client_name],
            ["Service", detail.appointment.service_name],
            ["Date", formatDate(detail.appointment.date)],
            ["Time", detail.appointment.start_time],
            ["Status", detail.appointment.status],
            ["Prep Notes", detail.appointment.prep_notes || "None yet"],
            ["Stylist Notes", detail.appointment.stylist_notes || "None yet"],
          ]}
        />
        <ListBlock title="Update Appointment">
          <FormSelect
            label="Status"
            value={appointmentStatus}
            onChange={setAppointmentStatus}
            options={[
              ["pending", "Pending"],
              ["confirmed", "Confirmed"],
              ["completed", "Completed"],
              ["cancelled", "Cancelled"],
              ["no_show", "No Show"],
            ]}
          />
          <FormTextArea label="Prep Notes" value={prepNotes} onChange={setPrepNotes} placeholder="Prep notes for the visit" rows={3} />
          <FormTextArea label="Stylist Notes" value={stylistNotes} onChange={setStylistNotes} placeholder="Operational notes for this appointment" rows={4} />
          <FormActions
            submitLabel={updateAppointmentState.isLoading ? "Saving..." : "Save Appointment"}
            onSubmit={async () => {
              setAppointmentFeedback(null);
              try {
                await updateAppointment({
                  appointmentId,
                  body: {
                    status: appointmentStatus,
                    prep_notes: prepNotes,
                    stylist_notes: stylistNotes,
                  },
                }).unwrap();
                setAppointmentFeedback("Appointment saved.");
              } catch (error) {
                setAppointmentFeedback(getApiErrorMessage(error, "We could not save the appointment yet."));
              }
            }}
            disabled={updateAppointmentState.isLoading}
            feedback={appointmentFeedback}
            error={!!(appointmentFeedback && appointmentFeedback !== "Appointment saved.")}
          />
        </ListBlock>
        {detail.intake ? (
          <ListBlock title="Linked Intake">
            <ListRow
              title={detail.intake.service_type}
              meta={detail.intake.dream_result || "No dream-result note"}
              onClick={() => detail.intake?.id && navigateTo({ section: "intakes", id: detail.intake.id })}
            />
          </ListBlock>
        ) : null}
      </WorkspaceSection>
    );
  }

  if (listView.isLoading) {
    return <LoadingSection title="Appointments" />;
  }
  if (listView.errorMessage) {
    return <ErrorSection title="Appointments" message={listView.errorMessage} />;
  }

  const filteredAppointments = listView.appointments.filter((appointment) => {
    if (dateFilter && appointment.date !== dateFilter) {
      return false;
    }
    if (clientFilter && !appointment.client_name.toLowerCase().includes(clientFilter.trim().toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <WorkspaceSection
      title="Appointments"
      subtitle="The runtime schedule list is backend-backed and now filterable by status, date, and client."
    >
      <FilterRow>
        <FormSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            ["", "All statuses"],
            ["pending", "Pending"],
            ["confirmed", "Confirmed"],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
            ["no_show", "No Show"],
          ]}
        />
        <FormInput label="Date" value={dateFilter} onChange={setDateFilter} type="date" />
        <FormInput label="Client" value={clientFilter} onChange={setClientFilter} placeholder="Search by client name" />
      </FilterRow>
      {filteredAppointments.length === 0 ? (
        <EmptyState message="No appointments found." />
      ) : (
        filteredAppointments.map((appointment) => (
          <ListRow
            key={appointment.id}
            title={appointment.client_name}
            meta={`${appointment.service_name} · ${formatDate(appointment.date)} · ${appointment.start_time}`}
            badge={appointment.status}
            onClick={() => navigateTo({ section: "appointments", id: appointment.id })}
          />
        ))
      )}
    </WorkspaceSection>
  );
}

function ClientsPage() {
  const [search, setSearch] = useState("");
  const listView = useStylistClientsView(search ? { search } : undefined);
  const route = resolveStylistRoute(window.location.pathname);
  const detailView = useStylistClientDetailView(route.section === "clients" ? route.id ?? null : null);

  if (route.section === "clients" && route.id) {
    if (detailView.isLoading) {
      return <LoadingSection title="Client Detail" />;
    }
    if (detailView.errorMessage || !detailView.client) {
      return <ErrorSection title="Client Detail" message={detailView.errorMessage ?? "We could not load this client yet."} />;
    }

    const client = detailView.client;
    return (
      <WorkspaceSection
        title="Client Detail"
        subtitle="This is the real stylist-side client context: profile, appointments, recent intakes, and maintenance in one payload."
      >
        <BackLink onClick={() => navigateTo({ section: "clients" })} label="Back to client list" />
        <KeyValueList
          items={[
            ["Name", client.client.name],
            ["Email", client.client.email || "Not set"],
            ["Phone", client.client.phone || "Not set"],
            ["Appointments", String(client.appointment_count)],
            ["Intakes", String(client.intake_count)],
            ["Service Summary", client.client.service_summary || client.client.scalp_notes || "No notes yet"],
          ]}
        />
        <ListBlock title="Recent Appointments">
          {client.recent_appointments.length === 0 ? (
            <EmptyState message="No appointment history yet." />
          ) : (
            client.recent_appointments.map((appointment) => (
              <ListRow
                key={appointment.id}
                title={appointment.service_name}
                meta={`${formatDate(appointment.date)} · ${appointment.start_time} · ${appointment.status}`}
                onClick={() => navigateTo({ section: "appointments", id: appointment.id })}
              />
            ))
          )}
        </ListBlock>
        <ListBlock title="Recent Intakes">
          {client.recent_intakes.length === 0 ? (
            <EmptyState message="No intake submissions yet." />
          ) : (
            client.recent_intakes.map((intake) => (
              <ListRow
                key={intake.id}
                title={intake.service_type}
                meta={`${intake.review.status} · ${formatDate(intake.submitted_at)} · ${intake.photo_count} photos`}
                onClick={() => navigateTo({ section: "intakes", id: intake.id })}
              />
            ))
          )}
        </ListBlock>
        <ListBlock title="Maintenance Plan">
          {client.maintenance_items.length === 0 ? (
            <EmptyState message="No maintenance plan items yet." />
          ) : (
            client.maintenance_items.map((item) => (
              <ListRow
                key={item.id}
                title={item.service_name}
                meta={`${formatDate(item.due_date)} · ${item.status}`}
                onClick={() => item.appointment_id ? navigateTo({ section: "appointments", id: item.appointment_id }) : undefined}
              />
            ))
          )}
        </ListBlock>
      </WorkspaceSection>
    );
  }

  if (listView.isLoading) {
    return <LoadingSection title="Clients" />;
  }
  if (listView.errorMessage) {
    return <ErrorSection title="Clients" message={listView.errorMessage} />;
  }

  return (
    <WorkspaceSection
      title="Clients"
      subtitle="The real client list is now searchable from the backend. The old seeded loyalty client slice is no longer needed for the live stylist route."
    >
      <input
        data-part="text-input"
        placeholder="Search clients by name, email, or phone"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        style={{ width: "100%", marginBottom: 14 }}
      />
      {listView.clients.length === 0 ? (
        <EmptyState message="No clients matched your search." />
      ) : (
        listView.clients.map((client) => (
          <ListRow
            key={client.id}
            title={client.name}
            meta={`${client.appointment_count} appointments · ${client.intake_count} intakes`}
            badge={client.last_review_status || undefined}
            onClick={() => navigateTo({ section: "clients", id: client.id })}
          />
        ))
      )}
    </WorkspaceSection>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        background: "var(--color-surface)",
        padding: 14,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: "var(--color-text)" }}>{value}</div>
    </div>
  );
}

function FilterRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function ListBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div data-part="section-label" style={{ marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 14,
    background: "var(--color-surface)",
    color: "var(--color-text)",
    fontFamily: "var(--font-sans)",
  };
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <FormField label={label}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        style={inputStyle()}
      />
    </FormField>
  );
}

function FormTextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <FormField label={label}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...inputStyle(), resize: "vertical" }}
      />
    </FormField>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <FormField label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle()}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue || "__empty"} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </FormField>
  );
}

function FormActions({
  submitLabel,
  onSubmit,
  disabled,
  feedback,
  error,
}: {
  submitLabel: string;
  onSubmit: () => void;
  disabled?: boolean;
  feedback: string | null;
  error?: boolean;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={onSubmit}
        disabled={disabled}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "10px 16px",
          background: "var(--color-accent-dark)",
          color: "#fff",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {submitLabel}
      </button>
      {feedback ? (
        <div style={{ fontSize: 13, color: error ? "var(--color-danger)" : "var(--color-text-muted)", marginTop: 10 }}>
          {feedback}
        </div>
      ) : null}
    </div>
  );
}

function ListRow({
  title,
  meta,
  badge,
  onClick,
}: {
  title: string;
  meta: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        background: "var(--color-surface)",
        padding: 14,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>{title}</div>
        {badge ? (
          <span
            style={{
              fontSize: 11,
              color: "var(--color-accent-dark)",
              background: "var(--color-accent-light)",
              padding: "4px 8px",
              borderRadius: 999,
              textTransform: "capitalize",
            }}
          >
            {badge.split("_").join(" ")}
          </span>
        ) : null}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 6, lineHeight: 1.5 }}>{meta}</div>
    </button>
  );
}

function KeyValueList({ items }: { items: Array<[string, string]> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
      {items.map(([label, value]) => (
        <div key={label} style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: 10 }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
            {label}
          </div>
          <div style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.5 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        marginBottom: 14,
        cursor: "pointer",
        color: "var(--color-accent-dark)",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {label}
    </button>
  );
}

export function StylistWorkspace() {
  const [route, setRoute] = useState<StylistRoute>(() => resolveStylistRoute(window.location.pathname));

  useEffect(() => {
    const handleRouteChange = () => setRoute(resolveStylistRoute(window.location.pathname));
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  return (
    <div data-part="page-content">
      <div data-part="welcome-header" style={{ paddingBottom: 18 }}>
        <div data-part="welcome-logo">&#x2726;&ensp;Luxe Hair Studio&ensp;&#x2726;</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--color-text)" }}>
          {pageTitle(route)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {navItems.map((item) => {
          const active = route.section === item.section;
          return (
            <button
              key={item.section}
              data-part={active ? "btn-primary" : "btn-secondary"}
              onClick={() => navigateTo({ section: item.section })}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "10px 14px",
                cursor: "pointer",
                background: active ? "var(--color-accent-dark)" : "var(--color-surface)",
                color: active ? "#fff" : "var(--color-text)",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {route.section === "dashboard" ? <DashboardPage /> : null}
      {route.section === "intakes" ? <IntakesPage intakeId={route.id} /> : null}
      {route.section === "appointments" ? <AppointmentsPage appointmentId={route.id} /> : null}
      {route.section === "clients" ? <ClientsPage /> : null}
    </div>
  );
}
