import { defineStore } from "pinia";
import { ref, computed } from "vue";

const KEY = "roffr_compare";
const MAX = 3; // three columns is the most that stays readable on a phone

export const useCompareStore = defineStore("compare", () => {
  const read = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
    } catch {
      return [];
    }
  };

  // Only the fields the comparison table needs are stored, so the payload
  // stays small and survives a reload.
  const items = ref(read());
  const isOpen = ref(false);

  const persist = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items.value));
    } catch {
      /* storage blocked — comparison still works for this session */
    }
  };

  const slim = (p) => ({
    _id: p._id,
    projectName: p.projectName,
    builderName: p.builderName,
    city: p.city,
    region: p.region,
    venue: p.venue,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    avgPrice: p.avgPrice,
    projectStatus: p.projectStatus,
    projectReraNumber: p.projectReraNumber,
    amenities: (p.amenities || []).filter(Boolean),
    propertyPictures: (p.propertyPictures || []).slice(0, 1),
    PropertyConfig: p.PropertyConfig || [],
  });

  const has = (id) => items.value.some((p) => p._id === id);
  const isFull = computed(() => items.value.length >= MAX);
  const count = computed(() => items.value.length);

  /** Returns false when the list is already full. */
  const add = (project) => {
    if (!project?._id || has(project._id)) return true;
    if (items.value.length >= MAX) return false;
    items.value = [...items.value, slim(project)];
    persist();
    return true;
  };

  const remove = (id) => {
    items.value = items.value.filter((p) => p._id !== id);
    persist();
    if (!items.value.length) isOpen.value = false;
  };

  /** Add if absent, remove if present. Returns false if it couldn't be added. */
  const toggle = (project) => {
    if (has(project?._id)) {
      remove(project._id);
      return true;
    }
    return add(project);
  };

  const clear = () => {
    items.value = [];
    isOpen.value = false;
    persist();
  };

  const open = () => { if (items.value.length) isOpen.value = true; };
  const close = () => { isOpen.value = false; };

  return { items, isOpen, has, isFull, count, add, remove, toggle, clear, open, close, MAX };
});
