<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue"
import gsap from "gsap"
import AnimatedTitle from "@/components/AnimatedTitle.vue"
import { observe, unobserve } from "@/composables/useIntersect"

// Swiper
import { Swiper, SwiperSlide } from "swiper/vue"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

const modules = [Autoplay, Pagination]

const steps = ref([
  "/svg/WorkSection/1.svg",
  "/svg/WorkSection/2.svg",
  "/svg/WorkSection/3.svg",
  "/svg/WorkSection/4.svg",
  "/svg/WorkSection/5.svg",
  "/svg/WorkSection/6.svg",
])

const isMobile = ref(false)

let ctx
let mq = null
let watched = null
// Keep a reference to the actual handler. The previous version stored the
// MediaQueryList on window.__stepsMq__ and then called removeEventListener
// with a brand-new arrow function, so the listener was never removed.
const updateIsMobile = (e) => (isMobile.value = !e.matches)

onMounted(() => {
  mq = window.matchMedia("(min-width: 768px)")
  updateIsMobile(mq)
  mq.addEventListener("change", updateIsMobile)

  // Plays once when the steps scroll into view. This used to be a
  // `repeat: -1` timeline that scaled six items forever — including while the
  // section was several screens away — which is noise, not explanation: a
  // "how it works" diagram teaches its order once.
  ctx = gsap.context(() => {
    const items = gsap.utils.toArray(".step-item")
    if (!items.length) return

    gsap.set(items, { scale: 0.85, opacity: 0 })
    watched = items[0]

    // Uses the app's shared IntersectionObserver rather than ScrollTrigger,
    // which recomputes positions on the main thread during scroll.
    observe(watched, (entry) => {
      if (!entry.isIntersecting) return
      unobserve(watched)
      gsap.to(items, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.12,
      })
    })
  })
})

onBeforeUnmount(() => {
  if (watched) unobserve(watched)
  watched = null
  ctx && ctx.revert()
  mq?.removeEventListener("change", updateIsMobile)
  mq = null
})
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 xl:px-0">
    <div class="text-center title-text">
      <AnimatedTitle
        text="How Does Group Roffr Work?"
        customClass="text-[25px] md:text-[40px]"
      />
      <AnimatedTitle
        class="text-[#0D0D0D80]"
        text="Follow the simple to you Dream Home"
      />
    </div>

    <!-- Desktop / Tablet: original GSAP grid -->
    <div
      class="mt-10 hidden md:grid grid-cols-6 gap-2 justify-items-center"
    >
      <img
        v-for="(step, index) in steps"
        :key="index"
        :src="step"
        alt=""
        class="step-item"
      />
    </div>

    <!-- Mobile: Swiper, 1 slide at a time, autoplay -->
    <div class="mt-8 md:hidden">
      <Swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="16"
        :loop="true"
        :autoplay="{ delay: 2000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="w-full max-w-xs mx-auto"
      >
        <SwiperSlide
          v-for="(step, index) in steps"
          :key="index"
          class="flex justify-center"
        >
          <img :src="step" alt="" class="w-64 mx-auto" />
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>
