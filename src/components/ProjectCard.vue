<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { fmtINRShort, WHATSAPP } from '@/data/properties.js'
import { bhkConfigsOf } from '@/utils/bhkDisplay'
import { useGroupBuyStore } from '@/stores/groupBuyStore'
import { useAuthStore } from '@/stores/authStore'
import GroupBuyJoinModal from '@/components/GroupBuyJoinModal.vue'

const props = defineProps({
  project: { type: Object, required: true },
  showGroupBuy: { type: Boolean, default: true },
  detailPath: { type: String, default: '/project-details' },
})

const router = useRouter()
const groupBuyStore = useGroupBuyStore()
const authStore = useAuthStore()

const go = () => {
  if (!props.project._id) return
  router.push(`${props.detailPath}/${props.project._id}`)
}

const cover = computed(() => {
  const pics = props.project.propertyPictures
  return (pics && pics[0]) || (props.project.marketingCollaterals?.[0]?.link) || null
})

// Last locality + city from the full address, e.g. "Bhandup West, Mumbai"
const shortLocation = computed(() => {
  const full = props.project.venue || props.project.address || ''
  if (full) {
    const parts = String(full)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !/^india$/i.test(s) && !/\d{5,}/.test(s))
    if (parts.length) return parts.slice(-2).join(', ')
  }
  const fallback = [props.project.region, props.project.city].filter(Boolean).join(', ')
  return fallback || props.project.builderName || 'Location not specified'
})

const propertyConfigs = computed(() => bhkConfigsOf(props.project))

const builderName = computed(
  () => props.project.builderName || props.project.companyId?.companyName || '',
)
const builderLogo = computed(
  () => props.project.builderLogo || props.project.companyId?.logo || '',
)

// ── Real campaign data ────────────────────────────────────────────
const campaign = ref(null)
const joinModalOpen = ref(false)

const currentCustomerId = computed(
  () =>
    authStore.user?._id ||
    authStore.currentUserData?._id ||
    (typeof window !== 'undefined' ? localStorage.getItem('customerId') : '') ||
    '',
)

const gb = computed(() => {
  const c = campaign.value
  if (!c) return null
  const joined = Number(c.acceptedMembersCount || 0)
  const slots = Number(c.memberLimit || 5)
  // "Save up to" = the best unlockable tier, not just the current tier
  const tierMax = Math.max(
    0,
    ...(c.discountTiers || []).map((t) => Number(t.discountPercent) || 0),
  )
  const discountPct = Math.max(Number(c.currentDiscountPercent || 0), tierMax)
  const slotsLeft = Math.max(0, slots - joined)
  const pct = Math.round((joined / slots) * 100)
  const base = Math.max(props.project?.minPrice || 5000000, 2000000)
  const savings = Math.round((base * discountPct) / 100)
  const closing = slotsLeft <= 2 && pct >= 80
  const hot = !closing && pct >= 60
  let ribbon = ''
  if (closing) ribbon = `🔥 ONLY ${slotsLeft} SLOT${slotsLeft === 1 ? '' : 'S'} LEFT`
  else if (hot) ribbon = `⚡ FILLING FAST · ${slotsLeft} slots left`
  else if (pct >= 50) ribbon = `◉ ${slotsLeft} slots left`
  const canJoin = c.canJoin !== false && (c.status || 'ACTIVE') === 'ACTIVE'
  return { slots, joined, slotsLeft, pct, discountPct, discount: `${discountPct}%`, rsSavings: fmtINRShort(savings), closing, hot, ribbon, canJoin }
})

// Offer badge: project-level offer field if the API sends one, else the
// campaign's discount/title
const offer = computed(() => {
  const direct = props.project.offer || props.project.offerText
  if (direct && typeof direct === 'string') return direct
  const c = campaign.value
  if (!c) return ''
  const tierMax = Math.max(
    0,
    ...(c.discountTiers || []).map((t) => Number(t.discountPercent) || 0),
  )
  const pct = Math.max(Number(c.currentDiscountPercent) || 0, tierMax)
  if (pct && c.title) return `${pct}% OFF · ${c.title}`
  if (pct) return `${pct}% OFF`
  return c.title || ''
})

const originalPriceLabel = computed(() => {
  const min = props.project.minPrice
  const max = props.project.maxPrice
  if (min && max && max > min) return `₹${fmtINRShort(min).replace('₹','')} - ${fmtINRShort(max)}`
  if (min) return `${fmtINRShort(min)}+`
  return 'Price on request'
})

const groupPriceLabel = computed(() => {
  if (!gb.value) return originalPriceLabel.value
  const disc = 1 - gb.value.discountPct / 100
  const min = props.project.minPrice
  const max = props.project.maxPrice
  if (min && max && max > min) return `₹${fmtINRShort(min * disc).replace('₹','')} - ${fmtINRShort(max * disc)}`
  if (min) return `${fmtINRShort(min * disc)}+`
  return 'Price on request'
})

// SVG donut
const R = 36
const CIRC = 2 * Math.PI * R
const dashOffset = computed(() =>
  gb.value ? CIRC * (1 - gb.value.pct / 100) : CIRC
)

// The per-card setInterval(2000) that reshuffled three identical dummy
// avatars is gone: it meant ~30 timers waking Vue every 2s and 90 elements
// transitioning `left` (a layout property) forever. The avatars are now a
// static overlapped stack — same social proof, zero steady-state cost.
onMounted(async () => {
  if (!props.showGroupBuy || !props.project?._id) return

  const findCached = () =>
    groupBuyStore.activeCampaigns.find(
      c => (c.projectId?._id ?? c.projectId) === props.project._id
    )

  const cached = findCached()
  if (cached) {
    campaign.value = cached
    return
  }

  // Wait for the shared global fetch rather than testing a boolean that is
  // still false while that request is in flight (which made every card fire
  // its own lookup). One request for the whole page instead of ~20.
  if (!groupBuyStore.campaignsFetched) {
    await groupBuyStore.fetchActiveCampaigns()
    campaign.value = findCached() || null
  }
  // Fetched and not in the list => this project has no active campaign.
})

const ordinal = (n) => {
  const sfx = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (sfx[(v - 20) % 10] || sfx[v] || sfx[0])
}

const viewers = computed(() => {
  if (!props.project._id) return 1249
  let h = 0
  for (let i = 0; i < props.project._id.length; i++)
    h = ((h << 5) - h + props.project._id.charCodeAt(i)) | 0
  return 500 + (Math.abs(h) % 1500)
})

const callViaWhatsapp = (e) => {
  e.stopPropagation()
  const text = `Hi, I'm interested in ${props.project.projectName}. Please share more details.`
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank')
}

const joinGroup = (e) => {
  e.stopPropagation()
  if (!campaign.value || !gb.value?.canJoin) return
  joinModalOpen.value = true
}

const handleJoined = async () => {
  if (currentCustomerId.value) {
    await groupBuyStore.fetchMyRequests(currentCustomerId.value).catch(() => {})
  }
}
</script>

<template>
  <article
    class="group rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-[transform,box-shadow] duration-200 hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden"
    @click="go"
  >
    <!-- ── Image ─────────────────────────────────────────── -->
    <div class="relative h-64 bg-gray-100 overflow-hidden shrink-0">
      <div
        class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        :style="cover ? { backgroundImage: `url('${cover}')` } : {}"
      ></div>
      <!-- subtle gradient at bottom -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>

      <!-- Offer badge or Great Value fallback -->
      <span
        v-if="offer"
        class="offer-badge absolute top-4 left-4 text-white text-[11px] font-bold px-3 py-1.5 rounded-md tracking-wide shadow-lg max-w-[75%] truncate"
      >
        <i class="pi pi-bolt text-[10px] mr-1"></i>{{ offer }}
      </span>
      <span v-else class="absolute top-4 left-4 bg-green-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-md tracking-wide shadow-sm">
        Great Value
      </span>

      <!-- Donut meter – centered-right on image -->
      <div v-if="showGroupBuy && gb" class="absolute top-1/2 right-5 -translate-y-1/2 flex flex-col items-center gap-2">
        <div class="bg-white rounded-full shadow-xl p-2">
          <svg width="86" height="86" viewBox="0 0 86 86">
            <!-- track -->
            <circle cx="43" cy="43" :r="R" fill="none" stroke="#e5e7eb" stroke-width="7" />
            <!-- progress -->
            <circle
              cx="43" cy="43" :r="R"
              fill="none"
              stroke="#3b82f6"
              stroke-width="7"
              stroke-linecap="round"
              :stroke-dasharray="CIRC"
              :stroke-dashoffset="dashOffset"
              transform="rotate(-90 43 43)"
              style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"
            />
            <!-- center text -->
            <text x="43" y="38" text-anchor="middle" font-size="11" font-weight="700" fill="#111827">
              {{ gb.joined }}/{{ gb.slots }}
            </text>
            <text x="43" y="53" text-anchor="middle" font-size="10" fill="#6b7280">Joined</text>
          </svg>
        </div>
        <span class="text-[10px] text-white font-semibold bg-black/55 backdrop-blur-sm px-3 py-1 rounded-full whitespace-nowrap shadow">
          {{ gb.slotsLeft }} spots left
        </span>
      </div>

      <!-- Builder chip -->
      <div
        v-if="builderName"
        class="absolute bottom-3 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1 shadow-sm max-w-[65%]"
      >
        <img
          v-if="builderLogo"
          :src="builderLogo"
          class="w-5 h-5 rounded-full object-cover shrink-0"
          alt=""
        />
        <span
          v-else
          class="w-5 h-5 rounded-full bg-[#1a2b5f] text-white text-[9px] font-bold flex items-center justify-center shrink-0"
        >{{ builderName.charAt(0).toUpperCase() }}</span>
        <span class="text-[11px] font-semibold text-gray-800 truncate">{{ builderName }}</span>
      </div>
    </div>

    <!-- ── Body ──────────────────────────────────────────── -->
    <div class="px-5 pt-5 pb-5 flex flex-col gap-0 flex-1">

      <!-- Name + Phone button -->
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="font-bold text-gray-900 text-[17px] leading-snug">{{ project.projectName }}</h3>
          <div class="flex items-center gap-1.5 mt-1.5">
            <i class="pi pi-map-marker text-gray-400 text-xs shrink-0"></i>
            <span class="text-sm text-gray-500 truncate">{{ shortLocation }}</span>
          </div>
          <!-- Property configurations -->
          <div v-if="propertyConfigs.length" class="flex items-center gap-1.5 mt-2 flex-wrap">
            <span
              v-for="cfg in propertyConfigs"
              :key="cfg"
              class="text-[11px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5"
            >{{ cfg }}</span>
          </div>
        </div>
        <button
          @click="callViaWhatsapp"
          class="w-12 h-12 bg-[#EB3131] hover:bg-[#c72828] rounded-full flex items-center justify-center shadow-md transition-colors duration-200 shrink-0"
          title="Call now"
        >
          <i class="pi pi-phone text-white text-base"></i>
        </button>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-100 my-4"></div>

      <!-- Prices -->
      <div v-if="showGroupBuy && gb" class="flex items-stretch gap-0">
        <div class="flex-1 pr-4">
          <div class="text-xs font-semibold text-green-600 mb-1">Group Price</div>
          <div class="text-[15px] font-bold text-green-600 leading-tight">{{ groupPriceLabel }}</div>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 pl-4">
          <div class="text-xs text-gray-400 mb-1">Original Price</div>
          <div class="text-[15px] font-semibold text-gray-400 line-through leading-tight">{{ originalPriceLabel }}</div>
        </div>
      </div>
      <div v-else class="text-base font-bold text-gray-800">{{ originalPriceLabel }}</div>

      <!-- Divider -->
      <div class="border-t border-gray-100 my-4"></div>

      <!-- Savings pill -->
      <div v-if="showGroupBuy && gb" class="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-xl px-3.5 py-2.5">
        <span class="text-base shrink-0">🏷️</span>
        <span class="text-[13px] text-green-700 font-semibold leading-snug">
          You save up to {{ gb.rsSavings }} ({{ gb.discount }}) collectively
        </span>
      </div>

      <!-- Member avatars row (static overlapped stack) -->
      <div v-if="showGroupBuy && gb" class="flex items-center gap-3 mt-4">
        <div class="flex shrink-0">
          <img
            v-for="(_, idx) in Math.min(gb.joined, 3)"
            :key="idx"
            :src="`/dummy/dummy-case${(idx % 3) + 1}.webp`"
            class="w-11 h-11 rounded-full border-2 border-white object-cover shadow-md blur-[1.5px] -ml-2.5 first:ml-0"
            loading="lazy"
            decoding="async"
            width="44"
            height="44"
            alt="member"
          />
        </div>

        <span class="text-gray-400 text-base font-light">+</span>

        <!-- You? dashed circle -->
        <div
          class="w-9 h-9 rounded-full border-2 border-dashed border-[#EB3131] bg-white flex items-center justify-center shrink-0"
        >
          <span class="text-[#EB3131] font-bold text-sm">?</span>
        </div>

        <!-- Text -->
        <div class="leading-snug min-w-0">
          <span class="text-[#EB3131] font-bold text-sm">You?</span>
          <br />
          <span class="text-gray-500 text-xs">Become {{ ordinal(gb.joined + 1) }} member</span>
        </div>
      </div>

      <!-- ── Pinned bottom section ──────────────────────────── -->
      <div class="mt-auto pt-4 border-t border-gray-100">

        <!-- Button: Join Group (active campaign) OR View Project Details -->
        <button
          v-if="showGroupBuy && gb && gb.canJoin"
          @click="joinGroup"
          class="w-full bg-[#EB3131] hover:bg-[#c72828] text-white text-[15px] font-bold py-3.5 rounded-2xl transition-colors duration-200 active:scale-[0.98] shadow-sm"
        >
          Join Group
        </button>
        <button
          v-else
          @click.stop="go"
          class="w-full border border-gray-300 hover:border-[#EB3131] hover:text-[#EB3131] text-gray-700 text-[15px] font-bold py-3.5 rounded-2xl transition-colors duration-200 active:scale-[0.98]"
        >
          View Project Details
        </button>

        <!-- Trust badges -->
        <div class="flex items-center gap-5 mt-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <i class="pi pi-verified text-green-600 text-sm"></i>
            </div>
            <div>
              <div class="text-[11px] font-bold text-gray-800 leading-none">Verified Projects</div>
              <div class="text-[10px] text-gray-400 leading-none mt-0.5">RERE Verified</div>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span class="text-amber-500 font-bold text-sm">%</span>
            </div>
            <div>
              <div class="text-[11px] font-bold text-gray-800 leading-none">Lowest Price</div>
              <div class="text-[10px] text-gray-400 leading-none mt-0.5">Group Buying Power</div>
            </div>
          </div>
        </div>

        <!-- Viewers -->
        <div class="flex items-center gap-2 mt-3 text-[11px] text-gray-400">
          <i class="pi pi-eye text-gray-300 text-xs"></i>
          {{ viewers.toLocaleString('en-IN') }} buyers viewed this project
        </div>
      </div>
    </div>
  </article>

  <!-- Group Buy Join Modal -->
  <GroupBuyJoinModal
    :open="joinModalOpen"
    :campaign="campaign || {}"
    :customer-id="currentCustomerId"
    :project="project"
    @close="joinModalOpen = false"
    @joined="handleJoined"
  />
</template>

<style scoped>
/* Offer badge.
   Was three INFINITE animations per card (background-position + scale +
   a `left` sweep) — on ~30 cards that meant ~90 loops, ~60 of them forcing
   layout or paint every frame. Now a static gradient plus a single pop that
   fires once when the card enters view. Same scarcity cue, no steady state. */
.offer-badge {
  position: absolute;
  background: linear-gradient(110deg, #eb3131, #e8820c, #dd2476);
  animation: offer-pop 600ms var(--ease-pop) both;
}

@keyframes offer-pop {
  0%   { transform: scale(0.86); opacity: 0; }
  60%  { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
