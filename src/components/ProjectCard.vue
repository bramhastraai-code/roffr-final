<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { fmtINRShort, WHATSAPP } from '@/data/properties.js'
import { gbInfo } from '@/data/groupBuy.js'

const props = defineProps({
  project: { type: Object, required: true },
  showGroupBuy: { type: Boolean, default: true },
  detailPath: { type: String, default: '/project-details' },
})

const router = useRouter()

const go = () => {
  if (!props.project._id) return
  router.push(`${props.detailPath}/${props.project._id}`)
}

const cover = computed(() => {
  const pics = props.project.propertyPictures
  return (pics && pics[0]) || (props.project.marketingCollaterals?.[0]?.link) || null
})

const gb = computed(() => gbInfo(props.project))

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

const memberColors = ['bg-orange-400', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-400', 'bg-rose-400']

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
  if (!gb.value) return
  const g = gb.value
  const text = `Hi, I want to join the Group Buy for ${props.project.projectName} (${props.project.venue || ''}). Status: ${g.joined}/${g.slots} joined, ${g.daysLeft} days left, ${g.discount} discount = ${g.rsSavings} savings.`
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank')
}
</script>

<template>
  <article
    class="rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden"
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

      <!-- Great Value badge -->
      <span class="absolute top-4 left-4 bg-green-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-md tracking-wide shadow-sm">
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
    </div>

    <!-- ── Body ──────────────────────────────────────────── -->
    <div class="px-5 pt-5 pb-5 flex flex-col gap-0 flex-1">

      <!-- Name + Phone button -->
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="font-bold text-gray-900 text-[17px] leading-snug">{{ project.projectName }}</h3>
          <div class="flex items-center gap-1.5 mt-1.5">
            <i class="pi pi-map-marker text-gray-400 text-xs shrink-0"></i>
            <span class="text-sm text-gray-500 truncate">{{ project.venue || project.builderName || 'Location not specified' }}</span>
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

      <!-- Member avatars row -->
      <div v-if="showGroupBuy && gb" class="flex items-center gap-3 mt-4">
        <!-- Avatars -->
        <div class="flex -space-x-2 shrink-0">
          <div
            v-for="i in Math.min(gb.joined, 3)"
            :key="i"
            class="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
            :class="memberColors[(i - 1) % memberColors.length]"
          >{{ String.fromCharCode(64 + i) }}</div>
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

      <!-- Join Group button + Heart -->
      <div class="flex items-center gap-3 mt-5">
        <button
          @click="joinGroup"
          class="flex-1 bg-[#EB3131] hover:bg-[#c72828] text-white text-[15px] font-bold py-3.5 rounded-2xl transition-colors duration-200 active:scale-[0.98] shadow-sm"
        >
          Join Group
        </button>
        <!-- <button
          @click.stop
          class="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0"
        >
          <i class="pi pi-heart text-gray-400 text-base"></i>
        </button> -->
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-100 mt-5 mb-4"></div>

      <!-- Trust badges -->
      <div class="flex items-center gap-5">
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
  </article>
</template>
