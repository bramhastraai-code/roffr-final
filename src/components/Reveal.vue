<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { observe, unobserve } from '@/composables/useIntersect'

// The single reveal-on-scroll wrapper. Replaces FadeIn.vue (GSAP ScrollTrigger)
// and GsapFade.vue, which had different defaults, kept ScrollTrigger on the
// homepage critical path, and — in GsapFade's case — killed every trigger in
// the app on unmount.
//
// Prop names match the old FadeIn API so migration is mechanical.
const props = defineProps({
  as: { type: String, default: 'div' },
  y: { type: Number, default: 16 },      // px of travel
  delay: { type: Number, default: 0 },   // seconds, as FadeIn used
  once: { type: Boolean, default: true },
})

const root = ref(null)
let settle = null

// Applying .is-done sets `transform: none`, which is the point: translateY(0)
// still creates a stacking context and a promoted compositor layer, `none`
// does not. Leaving it in place is what forced the `relative z-20` hack in
// HomeView and permanently promoted all 13 homepage sections.
const finish = () => {
  clearTimeout(settle)
  root.value?.classList.add('is-done')
}

onMounted(() => {
  const el = root.value
  if (!el) return

  el.style.setProperty('--reveal-y', `${props.y}px`)
  if (props.delay) {
    el.style.setProperty('--reveal-delay', `${Math.round(props.delay * 1000)}ms`)
  }

  observe(el, (entry) => {
    if (!entry.isIntersecting) {
      if (!props.once) el.classList.remove('is-revealed', 'is-done')
      return
    }
    el.addEventListener('transitionend', finish, { once: true })
    el.classList.add('is-revealed')
    // Safety net: transitionend never fires under reduced motion or if the
    // element is display:none mid-transition.
    settle = setTimeout(finish, 900)
    if (props.once) unobserve(el)
  })
})

onBeforeUnmount(() => {
  clearTimeout(settle)
  if (root.value) unobserve(root.value)
})
</script>

<template>
  <component :is="as" ref="root" data-reveal>
    <slot />
  </component>
</template>
