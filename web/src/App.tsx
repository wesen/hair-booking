import { BackendAdminDslPage } from "./admin-dsl/BackendAdminDslPage";
import { LiveDslDemoApp } from "./LiveDslDemoApp";

export function App() {
  if (window.location.pathname === "/admin/intake") {
    return <BackendAdminDslPage flowId="fringe.admin.intake.v1" />;
  }
  if (window.location.pathname === "/admin/services") {
    return <BackendAdminDslPage />;
  }
  return <LiveDslDemoApp />;
}
