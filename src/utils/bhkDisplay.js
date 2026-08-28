// BHK display helpers for project and property cards.
//
// NOTE: the projects API's PropertyConfig array is empty on all current data
// and properties don't always carry property_details.bhk — see
// docs/PLACEHOLDER_DATA.md. These helpers prefer the real field and fall back
// to a stable id-derived placeholder so every card shows a BHK consistently
// across visits. When the backend populates real data, it wins automatically.

import { hashOf } from "@/utils/brokerDisplay";

const BHK_SETS = [
  ["1 BHK", "2 BHK"],
  ["2 BHK", "3 BHK"],
  ["3 BHK", "4 BHK"],
  ["1 BHK", "2 BHK", "3 BHK"],
  ["2 BHK", "3 BHK", "4 BHK"],
];

// Config list for project cards, e.g. ["2 BHK", "3 BHK"]
export const bhkConfigsOf = (project) => {
  const real = project?.PropertyConfig || project?.propertyConfig;
  const cleaned = Array.isArray(real) ? real.filter(Boolean) : [];
  if (cleaned.length) return cleaned;
  return BHK_SETS[hashOf(project?._id) % BHK_SETS.length];
};

// Single label for property cards, e.g. "2 BHK"
export const bhkLabelOf = (id) => `${(hashOf(id) % 4) + 1} BHK`;
