<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { fmtINRShort } from '@/data/properties.js'
import GroupBuyMeter from '@/components/GroupBuyMeter.vue'

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

const priceLabel = computed(() => {
  const min = props.project.minPrice
  const max = props.project.maxPrice
  if (min && max && max > min) return `${fmtINRShort(min)} - ${fmtINRShort(max)}`
  if (min) return `${fmtINRShort(min)}+`
  return 'Price on request'
})
</script>

<template>
  <article class="prop p-2 rounded-xl border border-black/10 flex flex-col h-full" @click="go">
    <div class="prop-img">
      <div class="prop-img-inner" :style="cover ? { backgroundImage: `url('${cover}')` } : {}"></div>
      <div class="prop-img-overlay"></div>
      <span v-if="project.projectReraNumber" class="prop-tag tag-rera">RERA Verified</span>
      <span v-if="project.projectStatus" class="prop-tag tag-deal prop-tag-right">{{ project.projectStatus }}</span>
    </div>
    <div class="prop-loc">{{ project.builderName || project.companyId?.companyName }}</div>
    <h3 class="prop-name">{{ project.projectName }}</h3>
    <div class="prop-spec flex-1">{{ project.venue }}</div>
    <div class="prop-foot mt-auto">
      <div class="prop-price">{{ priceLabel }}</div>
      <span class="prop-link">View →</span>
    </div>
    <GroupBuyMeter v-if="showGroupBuy" :project="project" />
  </article>
</template>
