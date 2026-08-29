// Price-per-sqft insight, derived entirely from data the API already returns.
//
// `avgPrice` is USUALLY the per-sqft rate (median ~₹23,000 across the
// catalogue) but a minority of records store the project's total price in the
// same field — e.g. "HIRANANDANI ESTATE" has avgPrice === minPrice ===
// 18,300,000. Showing that as "₹1,83,00,000/sqft" would be nonsense, so every
// value is validated before it is displayed. Nothing here is fabricated: when
// the data doesn't support a claim, we show nothing.

// Plausible ₹/sqft band for Indian residential real estate.
const MIN_RATE = 1_000;
const MAX_RATE = 200_000;

// A locality needs this many projects before its median is worth quoting.
const MIN_SAMPLE = 5;

// Below this the difference is noise, not a signal worth showing.
const MIN_DELTA_PCT = 3;

/** Per-sqft rate for a project, or 0 when the value can't be trusted. */
export const pricePerSqft = (project) => {
  const rate = Number(project?.avgPrice || 0);
  if (!rate || rate < MIN_RATE || rate > MAX_RATE) return 0;
  // If it equals a total price field, it's a mis-filled record, not a rate.
  if (rate === Number(project?.minPrice) || rate === Number(project?.maxPrice)) return 0;
  return Math.round(rate);
};

export const formatRate = (rate) =>
  rate ? `₹${Math.round(rate).toLocaleString("en-IN")}/sqft` : "";

/**
 * Median ₹/sqft per locality, built from a list of projects.
 * Returns Map<lowercased area, { median, count, label }>.
 */
export const buildRateIndex = (projects = []) => {
  const buckets = new Map();
  projects.forEach((p) => {
    const rate = pricePerSqft(p);
    if (!rate) return;
    const area = String(p.region || p.city || "").trim();
    if (!area) return;
    const key = area.toLowerCase();
    const bucket = buckets.get(key) || { rates: [], label: area };
    bucket.rates.push(rate);
    buckets.set(key, bucket);
  });

  const index = new Map();
  buckets.forEach((bucket, key) => {
    const sorted = [...bucket.rates].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    index.set(key, { median, count: sorted.length, label: bucket.label });
  });
  return index;
};

/**
 * How this project's rate compares to its locality.
 * Returns null unless there is a trustworthy rate AND a large enough local
 * sample AND a difference big enough to be meaningful.
 *
 * -> { rate, rateLabel, deltaPct, direction, areaLabel, sampleSize, text }
 */
export const rateComparison = (project, rateIndex) => {
  const rate = pricePerSqft(project);
  if (!rate) return null;

  const base = { rate, rateLabel: formatRate(rate) };
  if (!rateIndex) return base;

  const key = String(project?.region || project?.city || "").trim().toLowerCase();
  const area = rateIndex.get(key);
  if (!area || area.count < MIN_SAMPLE || !area.median) return base;

  const deltaPct = Math.round(((rate - area.median) / area.median) * 100);
  if (Math.abs(deltaPct) < MIN_DELTA_PCT) {
    return {
      ...base,
      deltaPct: 0,
      direction: "at",
      areaLabel: area.label,
      sampleSize: area.count,
      text: `in line with ${area.label} average`,
    };
  }

  const below = deltaPct < 0;
  return {
    ...base,
    deltaPct: Math.abs(deltaPct),
    direction: below ? "below" : "above",
    areaLabel: area.label,
    sampleSize: area.count,
    text: `${Math.abs(deltaPct)}% ${below ? "below" : "above"} ${area.label} average`,
  };
};
