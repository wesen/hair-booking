export function buildRuntimeURL(pathname: string): string {
  return new URL(pathname, window.location.origin).toString();
}

export function buildAuthPath(basePath: string, returnTo: string): string {
  const url = new URL(basePath, window.location.origin);
  url.searchParams.set("return_to", returnTo);
  return url.toString();
}

export function resolveLoginReturnTo(context: "booking" | "portal" | "stylist"): string {
  if (context === "portal") {
    return buildRuntimeURL("/portal");
  }

  if (context === "stylist") {
    return buildRuntimeURL("/stylist");
  }

  return buildRuntimeURL("/booking");
}
