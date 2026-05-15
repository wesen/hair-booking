import { BackendAdminDslPage } from "./admin-dsl/BackendAdminDslPage";
import { LiveDslDemoApp } from "./LiveDslDemoApp";

export function App() {
  if (window.location.pathname === "/admin/services") {
    return <BackendAdminDslPage />;
  }
  return <LiveDslDemoApp />;
}
