// Display helpers for channel partner (broker) cards and detail pages.
//
// NOTE: rating and broker type are NOT provided by the API today — see
// docs/PLACEHOLDER_DATA.md. The helpers prefer real API fields and fall back
// to stable id-derived placeholders so each broker looks consistent across
// visits. When the backend adds real fields, no frontend change is needed.

export const hashOf = (str) => {
  let h = 0;
  for (const ch of String(str || "")) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
};

export const ratingOf = (broker) => {
  const real = Number(broker?.rating ?? broker?.avgRating);
  if (real) return Math.min(5, Math.max(1, real));
  return 3.5 + (hashOf(broker?._id) % 4) * 0.5; // 3.5 | 4.0 | 4.5 | 5.0
};

export const starIcon = (rating, i) => {
  if (rating >= i) return "pi pi-star-fill";
  if (rating >= i - 0.5) return "pi pi-star-half-fill";
  return "pi pi-star";
};

export const brokerTypeOf = (broker) => {
  const t = broker?.brokerType || broker?.marketType;
  if (t) return t;
  return hashOf(broker?._id + "t") % 2 === 0
    ? "Primary Market"
    : "Secondary Market (Rent/Resale/Sale)";
};

export const initialsOf = (name) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
