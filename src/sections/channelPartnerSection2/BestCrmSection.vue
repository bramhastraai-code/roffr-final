<script setup>
// The float used to be a `repeat: -1` GSAP timeline that ran forever, even
// while this section was off-screen. It is now four lines of CSS (below),
// viewport- and tab-gated via v-motion-gate / data-loop — and this file no
// longer pulls GSAP in at all.
</script>

<template>
  <section
    v-motion-gate
    class="max-w-7xl mx-auto py-12 px-4 lg:py-20 lg:px-4 2xl:px-0 relative overflow-hidden"
  >
    <div class="text-center px-2">
      <h1
        class="font-instument italic text-orange-600 text-3xl sm:text-4xl lg:text-[60px] leading-tight"
      >
        The best real estate CRM
      </h1>
      <h1 class="title-text text-lg sm:text-xl lg:text-2xl">
        Everything you need in one place
      </h1>
    </div>

    <!-- Images: column on mobile, row on md+ -->
    <div
      class="mt-10 lg:mt-20 flex flex-col md:flex-row items-center justify-between gap-8 mx-auto relative z-10"
    >
      <div class="w-full md:w-1/2 flex justify-center">
        <img
          id="box1"
          data-loop
          src="/svg/channelPage/box1.svg"
          alt=""
          class="w-full max-w-sm sm:max-w-md"
        >
      </div>
      <div class="w-full md:w-1/2 flex justify-center">
        <img
          id="box2"
          data-loop
          src="/svg/channelPage/box2.svg"
          alt=""
          class="w-full max-w-sm sm:max-w-md"
        >
      </div>
    </div>

    <!-- Background circle, scaled down on mobile -->
    <div
      class="absolute -top-10 sm:top-0 left-1/2 -translate-x-1/2 pointer-events-none"
    >
      <img
        src="/svg/channelPage/circle.svg"
        alt=""
        class="w-[260px] sm:w-[340px] lg:w-auto"
      >
    </div>
  </section>
</template>

<style scoped>
/* Gentle float — replaces the old infinite GSAP timeline. Gated by
   v-motion-gate on the section, so it pauses when scrolled away. */
#box1,
#box2 {
  animation: crm-float 5s var(--ease-loop) infinite alternate;
}
#box2 {
  animation-delay: -1.2s;
}
@keyframes crm-float {
  from { transform: translate3d(0, 0, 0) rotate(0deg); }
  to   { transform: translate3d(0, -15px, 0) rotate(1deg); }
}
</style>
