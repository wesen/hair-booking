import type { ConsultationData, PriceEstimate } from "../types";

export function estimatePrice(data: Pick<ConsultationData, "serviceType" | "extType" | "desiredLength" | "colorService">): PriceEstimate {
  let low = 0, high = 0, moveUpLow = 0, moveUpHigh = 0;

  if (data.serviceType === "extensions" || data.serviceType === "both") {
    const lengthMult = data.desiredLength >= 3 ? 1.3 : data.desiredLength >= 2 ? 1.1 : 1;
    if (data.extType === "tape") { low = 600; high = 900; moveUpLow = 200; moveUpHigh = 300; }
    else if (data.extType === "ktip") { low = 900; high = 1300; moveUpLow = 250; moveUpHigh = 400; }
    else if (data.extType === "weft") { low = 800; high = 1200; moveUpLow = 225; moveUpHigh = 350; }
    else { low = 700; high = 1200; moveUpLow = 200; moveUpHigh = 350; }
    low = Math.round(low * lengthMult / 50) * 50;
    high = Math.round(high * lengthMult / 50) * 50;
  }

  if (data.serviceType === "color" || data.serviceType === "both") {
    if (data.colorService === "full") { low += 150; high += 250; }
    else if (data.colorService === "highlight") { low += 200; high += 350; }
    else if (data.colorService === "correction") { low += 300; high += 600; }
    else if (data.colorService === "gloss") { low += 75; high += 120; }
  }

  return { low, high, moveUpLow, moveUpHigh };
}
