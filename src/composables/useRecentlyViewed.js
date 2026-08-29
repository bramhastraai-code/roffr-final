import { ref } from 'vue'

// Recently viewed projects, stored per-browser. No backend involved — this is
// deliberately local so it works for logged-out visitors too.
const KEY = 'roffr_recently_viewed'
const MAX = 8

const read = () => {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Private mode / disabled storage — degrade to "no history"
    return []
  }
}

// Module-level so every component shares one reactive list.
const items = ref(read())

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.value))
  } catch {
    /* storage full or blocked — the in-memory list still works this session */
  }
}

/** Record a visit. Only the few fields a card needs are stored. */
export const rememberProject = (project) => {
  if (!project?._id) return
  const entry = {
    _id: project._id,
    projectName: project.projectName,
    city: project.city,
    region: project.region,
    venue: project.venue,
    builderName: project.builderName,
    minPrice: project.minPrice,
    maxPrice: project.maxPrice,
    avgPrice: project.avgPrice,
    projectStatus: project.projectStatus,
    propertyPictures: (project.propertyPictures || []).slice(0, 1),
    viewedAt: Date.now(),
  }
  items.value = [entry, ...items.value.filter((p) => p._id !== entry._id)].slice(0, MAX)
  persist()
}

export const clearRecentlyViewed = () => {
  items.value = []
  persist()
}

export const useRecentlyViewed = () => ({
  recentlyViewed: items,
  rememberProject,
  clearRecentlyViewed,
})
