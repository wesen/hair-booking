export type StylistSection = "dashboard" | "intakes" | "appointments" | "clients";

export interface StylistRoute {
  section: StylistSection;
  id?: string;
}

const stylistBasePath = "/stylist";

export function resolveStylistRoute(pathname: string): StylistRoute {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);

  if (parts[0] !== "stylist") {
    return { section: "dashboard" };
  }

  if (parts.length === 1) {
    return { section: "dashboard" };
  }

  const section = parts[1];
  if (section === "intakes") {
    return { section, id: parts[2] };
  }
  if (section === "appointments") {
    return { section, id: parts[2] };
  }
  if (section === "clients") {
    return { section, id: parts[2] };
  }
  return { section: "dashboard" };
}

export function buildStylistPath(route: StylistRoute): string {
  switch (route.section) {
    case "dashboard":
      return stylistBasePath;
    case "intakes":
      return route.id ? `${stylistBasePath}/intakes/${route.id}` : `${stylistBasePath}/intakes`;
    case "appointments":
      return route.id ? `${stylistBasePath}/appointments/${route.id}` : `${stylistBasePath}/appointments`;
    case "clients":
      return route.id ? `${stylistBasePath}/clients/${route.id}` : `${stylistBasePath}/clients`;
    default:
      return stylistBasePath;
  }
}
