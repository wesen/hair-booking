const statusPill = document.getElementById("status-pill");
const statusCopy = document.getElementById("status-copy");
const userPayload = document.getElementById("user-payload");
const metaAuthMode = document.getElementById("meta-auth-mode");
const metaIssuer = document.getElementById("meta-issuer");
const metaClientID = document.getElementById("meta-client-id");
const loginLink = document.getElementById("login-link");
const logoutLink = document.getElementById("logout-link");

function setStatus(label, badgeClass, copy) {
  statusPill.className = `badge rounded-pill ${badgeClass}`;
  statusPill.textContent = label;
  statusCopy.textContent = copy;
}

async function fetchJSON(url) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  return { response, payload };
}

async function loadPage() {
  const infoResult = await fetchJSON("/api/info");
  const info = infoResult.payload?.data ?? {};
  metaAuthMode.textContent = info.authMode || "unknown";
  metaIssuer.textContent = info.issuerUrl || "n/a";
  metaClientID.textContent = info.clientId || "n/a";

  const meResult = await fetchJSON("/api/me");
  if (meResult.response.ok) {
    const me = meResult.payload?.data ?? {};
    setStatus(
      "Authenticated",
      "text-bg-success",
      "The browser has an active signed session cookie. This is the contract the future React frontend will use.",
    );
    userPayload.textContent = JSON.stringify(me, null, 2);
    loginLink.classList.add("d-none");
    logoutLink.classList.remove("d-none");
    return;
  }

  setStatus(
    "Logged out",
    "text-bg-warning",
    "No active session was found. Use the login button to initiate the Keycloak authorization-code flow.",
  );
  userPayload.textContent = JSON.stringify(meResult.payload ?? { error: "not authenticated" }, null, 2);
  loginLink.classList.remove("d-none");
  logoutLink.classList.add("d-none");
}

void loadPage();
