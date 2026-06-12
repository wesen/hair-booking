import { createRoot } from "react-dom/client";
import "./fringe-ui/tokens/index.css";
import { App } from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element for Fringe app");
}

// Do not wrap this live backend demo in React StrictMode yet: development
// StrictMode intentionally re-runs effects, which would start duplicate Goja
// flow sessions while we are testing the action-dispatch loop.
createRoot(root).render(<App />);
