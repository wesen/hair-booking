import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./stylist/store";
import { StylistApp } from "./stylist/StylistApp";
import { ClientBookingApp } from "./stylist/ClientBookingApp";
import { ClientPortalApp } from "./stylist/ClientPortalApp";
import "./stylist/styles/stylist.css";
import "./stylist/styles/theme-default.css";

function resolveApp() {
  const params = new URLSearchParams(window.location.search);
  const app = params.get("app");

  if (app === "booking") {
    return <ClientBookingApp />;
  }

  if (app === "portal") {
    return <ClientPortalApp />;
  }

  return <StylistApp />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      {resolveApp()}
    </Provider>
  </StrictMode>,
);
