// src/main.tsx — Fringe hair booking app entry point
import "./stylist/styles/stylist.css";
import "./stylist/styles/theme-default.css";

// Start MSW mock worker before React renders when enabled via Vite env.
// Storybook manages its own MSW startup in .storybook/preview.ts.
const enableMsw = import.meta.env.VITE_ENABLE_MSW === "true";

async function startMocking() {
  if (!enableMsw) {
    return;
  }
  const { worker } = await import("./mock/browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { runtimeStore } from "./stylist/store";
import { ClientBookingApp } from "./stylist/ClientBookingApp";
import { ClientPortalApp } from "./stylist/ClientPortalApp";
import { StylistRuntimeApp } from "./stylist/StylistRuntimeApp";

type RuntimeApp = "booking" | "portal" | "stylist";

interface ResolvedRuntime {
  app: RuntimeApp;
  canonicalPath?: string;
}

function trimTrailingSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function resolveApp(): ResolvedRuntime {
  const pathname = trimTrailingSlash(window.location.pathname);
  const app = new URLSearchParams(window.location.search).get("app") as RuntimeApp | null;

  if (app === "booking") return { app: "booking", canonicalPath: "/booking" };
  if (app === "portal")  return { app: "portal",  canonicalPath: "/portal" };
  if (pathname === "" || pathname === "/") return { app: "booking", canonicalPath: "/booking" };
  if (pathname === "/booking" || pathname.startsWith("/booking/")) return { app: "booking" };
  if (pathname === "/portal"  || pathname.startsWith("/portal/"))  return { app: "portal" };
  if (pathname === "/stylist" || pathname.startsWith("/stylist/")) return { app: "stylist" };
  return { app: "booking", canonicalPath: "/booking" };
}

const resolvedApp = resolveApp();
if (resolvedApp.canonicalPath) {
  window.history.replaceState({}, "", resolvedApp.canonicalPath);
}

async function bootstrap() {
  await startMocking();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Provider store={runtimeStore}>
        {resolvedApp.app === "portal"  ? <ClientPortalApp showNonMvpFeatures={false} /> : null}
        {resolvedApp.app === "booking" ? <ClientBookingApp showDepositOption={false} />  : null}
        {resolvedApp.app === "stylist" ? <StylistRuntimeApp /> : null}
      </Provider>
    </StrictMode>,
  );
}

void bootstrap();
