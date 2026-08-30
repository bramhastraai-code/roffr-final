<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">
    <!-- Header -->
    <div v-reveal>
      <h2 class="font-intertight font-bold text-[26px] md:text-[32px] text-gray-900">How it works?</h2>
      <p class="text-gray-500 mt-1.5 text-sm md:text-base">Buy property together in 3 simple steps and save more.</p>
    </div>

    <!-- Steps -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-7 mt-10">
      <div
        v-for="(step, i) in steps"
        :key="step.number"
        v-reveal="{ y: 16, delay: i * 90 }"
        class="group rounded-card border border-gray-200 bg-white overflow-hidden shadow-e1 hover:shadow-e2 transition-shadow duration-300"
      >
        <!-- Visual. This section previously had no imagery at all — just three
             numbered circles. These photos already existed in public/ and were
             referenced by nothing. -->
        <div class="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          <img
            :src="step.image"
            :alt="step.alt"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            width="480"
            height="300"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>

          <!-- Number badge, now sitting on the image -->
          <div
            class="absolute top-4 left-4 w-11 h-11 rounded-full bg-[#EB3131] text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-black/20 ring-2 ring-white/25"
          >
            {{ step.number }}
          </div>

          <h3 class="absolute bottom-3.5 left-4 right-4 text-white font-bold text-[16px] drop-shadow-sm">
            {{ step.title }}
          </h3>
        </div>

        <!-- Content -->
        <div class="p-5">
          <p class="text-sm text-gray-500 leading-relaxed">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Copy unchanged. Images are existing assets from public/images/HomePage/
// groupSection/, which were sitting unreferenced in the repo.
const steps = [
  {
    number: 1,
    title: "Find a Deal",
    description: "Browse verified properties and active group deals.",
    image: "/images/HomePage/groupSection/group3.webp",
    alt: "A magnifying glass held over model apartment buildings",
  },
  {
    number: 2,
    title: "Join the Group",
    description: "Reserve your spot with a token amount and track group progress.",
    image: "/images/HomePage/groupSection/group2.webp",
    alt: "A wooden house model and a padlock resting on building plans",
  },
  {
    number: 3,
    title: "Save More Together",
    description: "Once the group is full, we negotiate better prices for everyone.",
    image: "/images/HomePage/groupSection/group1.webp",
    alt: "Hands holding model houses beside a rising growth arrow and coins",
  },
];
</script>
