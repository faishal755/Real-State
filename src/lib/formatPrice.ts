/**
 * Formats Indian Rupee values into human-readable labels (e.g. ₹75 Lac, ₹1.25 Cr, or ₹45,000/mo)
 */
export function formatINR(price: number, listingType: "sale" | "rent" = "sale"): string {
  if (price === undefined || price === null || isNaN(price)) return "₹0";

  if (listingType === "rent") {
    return `₹${price.toLocaleString("en-IN")}/mo`;
  }

  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(2);
    return `₹${cr.replace(/\.00$/, "")} Cr`;
  }

  if (price >= 100000) {
    const lac = (price / 100000).toFixed(2);
    return `₹${lac.replace(/\.00$/, "")} Lac`;
  }

  return `₹${price.toLocaleString("en-IN")}`;
}
