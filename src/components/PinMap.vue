<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Pure Leaflet (no vue-leaflet): its reactive center/zoom props kept
// re-applying the default view after fitBounds. Here the only thing that
// ever moves the map is our own fit logic.
const props = defineProps({
  // [{ id, lat, lng, title, subtitle, image, priceLabel, initials, chips: [] }]
  pins: { type: Array, default: () => [] },
  center: { type: Array, default: () => [19.076, 72.8777] }, // Mumbai
  zoom: { type: Number, default: 11 },
  // Small overlay chip, e.g. "Showing 12 of 775 — use pagination"
  note: { type: String, default: "" },
  // Panning/zooming is clamped to this box so the map can't be zoomed out to
  // the whole world or dragged off to another continent — every project is in
  // India. Roughly the Indian mainland plus a margin.
  bounds: {
    type: Array,
    default: () => [
      [5.5, 66.0],   // south-west
      [38.5, 99.5],  // north-east
    ],
  },
  // Zoom 4 fits India in a typical viewport; below that is just empty ocean.
  minZoom: { type: Number, default: 4 },
});

const emit = defineEmits(["pin-click"]);

const mapEl = ref(null);
const wrapper = ref(null);
let map = null;
let markerLayer = null;
let resizeObserver = null;

const validPins = computed(() =>
  (props.pins || []).filter(
    (p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)),
  ),
);

// Once the user pans/zooms by hand, resize refits stop yanking the view —
// but a genuine pin change (new page, new filter) still refits.
const userMoved = ref(false);
const markUserMoved = () => { userMoved.value = true; };

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const iconFor = (pin) =>
  L.divIcon({
    className: "pinmap-marker",
    html: pin.priceLabel
      ? `<div class="pinmap-stack"><div class="pinmap-pill">${esc(pin.priceLabel)}</div><div class="pinmap-tip"></div></div>`
      : `<div class="pinmap-stack"><div class="pinmap-dot">${esc(pin.initials || "•")}</div><div class="pinmap-tip"></div></div>`,
    iconSize: [90, 46],
    iconAnchor: [45, 46],
  });

const tooltipFor = (pin) => {
  const chips = (pin.chips || [])
    .map((c) => `<span class="pinmap-chip">${esc(c)}</span>`)
    .join("");
  return `
    <div class="pinmap-tt">
      ${pin.image ? `<img src="${esc(pin.image)}" class="pinmap-tt-img" alt="" />` : ""}
      <div class="pinmap-tt-head">
        ${!pin.image && pin.initials ? `<span class="pinmap-tt-avatar">${esc(pin.initials)}</span>` : ""}
        <div class="pinmap-tt-titles">
          <p class="pinmap-tt-title">${esc(pin.title)}</p>
          ${pin.subtitle ? `<p class="pinmap-tt-sub">${esc(pin.subtitle)}</p>` : ""}
        </div>
      </div>
      ${chips ? `<div class="pinmap-tt-chips">${chips}</div>` : ""}
      ${pin.priceLabel ? `<p class="pinmap-tt-price">${esc(pin.priceLabel)}</p>` : ""}
      <p class="pinmap-tt-hint">Click pin to view details</p>
    </div>`;
};

const renderMarkers = () => {
  if (!map) return;
  markerLayer.clearLayers();
  validPins.value.forEach((pin) => {
    const m = L.marker([Number(pin.lat), Number(pin.lng)], { icon: iconFor(pin) });
    m.bindTooltip(tooltipFor(pin), {
      direction: "top",
      offset: [0, -48],
      opacity: 1,
      className: "pinmap-tooltip",
    });
    m.on("click", () => emit("pin-click", pin));
    markerLayer.addLayer(m);
  });
};

const fitToPins = (force = false) => {
  if (!map || !validPins.value.length) return;
  if (userMoved.value && !force) return;
  map.invalidateSize();
  const size = map.getSize();
  if (!size.x || !size.y) return;
  const bounds = L.latLngBounds(validPins.value.map((p) => [Number(p.lat), Number(p.lng)]));
  map.fitBounds(bounds.pad(0.2), { maxZoom: 14 });
};

watch(validPins, () => {
  userMoved.value = false;
  nextTick(() => {
    renderMarkers();
    fitToPins(true);
  });
});

onMounted(() => {
  const indiaBounds = L.latLngBounds(props.bounds);

  map = L.map(mapEl.value, {
    center: props.center,
    zoom: props.zoom,
    scrollWheelZoom: true,
    zoomControl: true,
    minZoom: props.minZoom,
    maxBounds: indiaBounds,
    // 1.0 = a hard edge; dragging past the box simply doesn't move.
    maxBoundsViscosity: 1.0,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    // Stop the world repeating sideways when the viewport is wider than the
    // bounded area, and skip requesting tiles outside India entirely.
    noWrap: true,
    bounds: indiaBounds,
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  map.on("dragstart", markUserMoved);

  renderMarkers();
  fitToPins(true);

  // Container revealed/resized (mobile toggle, layout settle) — keep the
  // size honest and re-frame unless the user took over.
  resizeObserver = new ResizeObserver(() => {
    if (!map) return;
    map.invalidateSize();
    fitToPins();
  });
  if (wrapper.value) resizeObserver.observe(wrapper.value);
  setTimeout(() => fitToPins(true), 400);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  map?.remove();
  map = null;
});
</script>

<template>
  <div
    ref="wrapper"
    class="relative h-full w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100"
    @wheel="markUserMoved"
  >
    <div ref="mapEl" class="h-full w-full z-0"></div>

    <!-- Pagination / context note -->
    <div
      v-if="note"
      class="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm text-[11px] font-semibold text-gray-700 px-3 py-1.5 rounded-full shadow border border-gray-200 max-w-[85%] truncate"
    >
      {{ note }}
    </div>
  </div>
</template>

<!-- Global (unscoped): Leaflet injects marker/tooltip HTML outside Vue's scope -->
<style>
.pinmap-marker {
  background: transparent;
  border: none;
}
.pinmap-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pinmap-pill {
  background: #eb3131;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 8px;
  border: 2px solid #fff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  white-space: nowrap;
  transition: transform 0.15s ease;
}
.pinmap-dot {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: #eb3131;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease;
}
.pinmap-marker:hover .pinmap-pill,
.pinmap-marker:hover .pinmap-dot {
  transform: scale(1.12);
}
.pinmap-tip {
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 8px solid #eb3131;
  margin-top: -2px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

/* Hover card */
.pinmap-tooltip {
  border-radius: 14px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  padding: 10px;
}
.pinmap-tt { width: 200px; }
.pinmap-tt-img {
  width: 100%;
  height: 92px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 8px;
}
.pinmap-tt-head { display: flex; gap: 8px; align-items: flex-start; }
.pinmap-tt-avatar {
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background: #eb3131;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pinmap-tt-titles { min-width: 0; }
.pinmap-tt-title {
  font-weight: 700;
  font-size: 13px;
  color: #111827;
  line-height: 1.3;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pinmap-tt-sub {
  font-size: 11px;
  color: #6b7280;
  margin: 2px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pinmap-tt-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.pinmap-chip {
  font-size: 10px;
  font-weight: 600;
  color: #4b5563;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1px 6px;
}
.pinmap-tt-price {
  font-size: 13px;
  font-weight: 800;
  color: #eb3131;
  margin: 6px 0 0;
}
.pinmap-tt-hint {
  font-size: 10px;
  color: #9ca3af;
  margin: 4px 0 0;
}
</style>
