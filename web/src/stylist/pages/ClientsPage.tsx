import { useAppSelector, useAppDispatch } from "../store";
import { setSearch, selectClient, logVisit, addBookingPoints } from "../store/clientsSlice";
import { setTab, openReferralModal, showToast } from "../store/uiSlice";
import { setStep, setClientInfo } from "../store/bookingSlice";
import { TopBar } from "../components/TopBar";
import { Input } from "../components/Input";
import { Icon } from "../components/Icon";
import { ClientCard } from "../components/ClientCard";
import { ClientDetail } from "../components/ClientDetail";

export function ClientsPage() {
  const dispatch = useAppDispatch();
  const clients = useAppSelector((state) => state.clients.clients);
  const search = useAppSelector((state) => state.clients.search);
  const selectedClientId = useAppSelector((state) => state.clients.selectedClientId);

  const selectedClient = selectedClientId !== null
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  if (selectedClient) {
    return (
      <div data-part="page-content">
        <ClientDetail
          client={selectedClient}
          onBack={() => dispatch(selectClient(null))}
          onBookAppointment={() => {
            dispatch(setClientInfo({ clientName: selectedClient.name }));
            dispatch(setStep(1));
            dispatch(setTab("book"));
          }}
          onLogVisit={() => {
            dispatch(logVisit(selectedClient.id));
            dispatch(showToast(`Visit logged for ${selectedClient.name} ✓`));
          }}
          onAddReferral={() => dispatch(openReferralModal(selectedClient.name))}
          onMessage={() => dispatch(openReferralModal(selectedClient.name))}
        />
      </div>
    );
  }

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div data-part="page-content">
      <TopBar
        title="Clients"
        right={
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {clients.length} total
          </span>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Input
          icon={<Icon name="search" size={16} />}
          placeholder="Search clients..."
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onClick={() => dispatch(selectClient(client.id))}
          />
        ))}
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              fontSize: 14,
              color: "var(--color-text-muted)",
            }}
          >
            No clients found
          </div>
        )}
      </div>
    </div>
  );
}
