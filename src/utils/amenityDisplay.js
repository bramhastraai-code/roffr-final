// Maps free-text amenity names ("swimming pool", "Kids Play Area", …) to an
// emoji + pastel tile color, so amenity grids read visually instead of as a
// wall of identical checkmarks. Fallback: sparkle on orange.

const RULES = [
  { k: ["swim", "pool"], e: "🏊", bg: "bg-sky-50", bd: "hover:border-sky-200" },
  { k: ["gym", "fitness"], e: "🏋️", bg: "bg-orange-50", bd: "hover:border-orange-200" },
  { k: ["yoga", "meditat"], e: "🧘", bg: "bg-purple-50", bd: "hover:border-purple-200" },
  { k: ["kids", "play"], e: "🛝", bg: "bg-amber-50", bd: "hover:border-amber-200" },
  { k: ["wifi", "internet"], e: "📶", bg: "bg-blue-50", bd: "hover:border-blue-200" },
  { k: ["garden", "flower", "green", "lawn"], e: "🌸", bg: "bg-pink-50", bd: "hover:border-pink-200" },
  { k: ["park "], e: "🌳", bg: "bg-green-50", bd: "hover:border-green-200" },
  { k: ["jog", "track", "running"], e: "🏃", bg: "bg-lime-50", bd: "hover:border-lime-200" },
  { k: ["club"], e: "🏛️", bg: "bg-indigo-50", bd: "hover:border-indigo-200" },
  { k: ["amphi", "theatre", "theater", "cinema", "movie"], e: "🎭", bg: "bg-fuchsia-50", bd: "hover:border-fuchsia-200" },
  { k: ["parking", "car "], e: "🅿️", bg: "bg-slate-50", bd: "hover:border-slate-200" },
  { k: ["security", "cctv", "guard", "gated"], e: "🔒", bg: "bg-red-50", bd: "hover:border-red-200" },
  { k: ["power", "backup", "generator"], e: "⚡", bg: "bg-yellow-50", bd: "hover:border-yellow-200" },
  { k: ["lift", "elevator"], e: "🛗", bg: "bg-gray-50", bd: "hover:border-gray-300" },
  { k: ["temple", "worship", "prayer"], e: "🛕", bg: "bg-orange-50", bd: "hover:border-orange-200" },
  { k: ["tennis", "badminton", "basket", "cricket", "sport", "court", "golf"], e: "🎾", bg: "bg-emerald-50", bd: "hover:border-emerald-200" },
  { k: ["spa", "sauna", "jacuzzi", "steam"], e: "💆", bg: "bg-rose-50", bd: "hover:border-rose-200" },
  { k: ["water", "rain"], e: "💧", bg: "bg-cyan-50", bd: "hover:border-cyan-200" },
  { k: ["fire"], e: "🧯", bg: "bg-red-50", bd: "hover:border-red-200" },
  { k: ["banquet", "party", "hall", "event"], e: "🎉", bg: "bg-violet-50", bd: "hover:border-violet-200" },
  { k: ["library", "reading"], e: "📚", bg: "bg-amber-50", bd: "hover:border-amber-200" },
  { k: ["senior", "elder"], e: "🧓", bg: "bg-teal-50", bd: "hover:border-teal-200" },
  { k: ["pet"], e: "🐾", bg: "bg-stone-50", bd: "hover:border-stone-300" },
  { k: ["cycle", "cycling", "bike"], e: "🚴", bg: "bg-lime-50", bd: "hover:border-lime-200" },
  { k: ["walk", "pathway"], e: "🚶", bg: "bg-green-50", bd: "hover:border-green-200" },
  { k: ["cafe", "restaurant", "food"], e: "☕", bg: "bg-amber-50", bd: "hover:border-amber-200" },
  { k: ["shop", "market", "retail", "mall"], e: "🛍️", bg: "bg-pink-50", bd: "hover:border-pink-200" },
  { k: ["school", "educat"], e: "🎓", bg: "bg-blue-50", bd: "hover:border-blue-200" },
  { k: ["hospital", "clinic", "medical"], e: "🏥", bg: "bg-red-50", bd: "hover:border-red-200" },
  { k: ["terrace", "roof", "sky"], e: "🌇", bg: "bg-orange-50", bd: "hover:border-orange-200" },
];

export const amenityMeta = (name) => {
  const n = ` ${String(name || "").toLowerCase()} `;
  for (const r of RULES) {
    if (r.k.some((kw) => n.includes(kw))) return { emoji: r.e, bg: r.bg, bd: r.bd };
  }
  return { emoji: "✨", bg: "bg-orange-50", bd: "hover:border-orange-200" };
};
