import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./stylist/store";
import { StylistApp } from "./stylist/StylistApp";
import "./stylist/styles/stylist.css";
import "./stylist/styles/theme-default.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <StylistApp />
    </Provider>
  </StrictMode>,
);
