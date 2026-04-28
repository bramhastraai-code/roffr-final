<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBuilderStore } from "@/stores/builderStore";

const route = useRoute();
const router = useRouter();

const builderStore = useBuilderStore();
const { currentBuilder, currentBuilderLoading, currentBuilderError } =
  storeToRefs(builderStore);

const submitting = ref(false);
const submitMsg = ref("");
const contactForm = ref({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
});

const builder = computed(() => currentBuilder.value || {});

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const loadBuilder = async (id) => {
  if (!id) return;
  await builderStore.getBuilderById(id);
};

onMounted(() => loadBuilder(route.params.id));
watch(
  () => route.params.id,
  (id) => loadBuilder(id),
);

const handleConnect = () => {
  if (!contactForm.value.phone) {
    submitMsg.value = "Phone is required.";
    return;
  }
  submitting.value = true;
  submitMsg.value = "";
  // TODO: wire to a real "request callback" endpoint when one is exposed.
  setTimeout(() => {
    submitting.value = false;
    submitMsg.value = "Thanks — the builder will reach out shortly.";
    contactForm.value = { firstName: "", lastName: "", phone: "", email: "" };
  }, 600);
};
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0 mt-10">
    <button
      @click="router.back()"
      class="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1"
    >
      <i class="pi pi-arrow-left text-xs"></i> Back
    </button>

    <div v-if="currentBuilderLoading" class="py-16 text-center text-gray-500">
      Loading…
    </div>

    <div
      v-else-if="currentBuilderError"
      class="bg-red-50 text-red-600 text-sm rounded-md p-3"
    >
      {{ currentBuilderError }}
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-6">
      <!-- LEFT (70%) -->
      <div class="w-full lg:w-[70%]">
        <div class="flex items-center gap-4 mb-4">
          <div
            class="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow"
          >
            <img
              v-if="builder?.logo"
              :src="builder.logo"
              :alt="builder.companyName"
              class="h-full w-full rounded-full object-cover"
            />
            <span v-else>{{ initials(builder?.companyName) }}</span>
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">
              {{ builder?.companyName || "Builder" }}
            </h1>
            <p class="text-sm text-gray-500">
              {{ builder?.newReraNumber ? `RERA: ${builder.newReraNumber}` : "Verified developer" }}
            </p>
          </div>
        </div>

        <div class="border-b mb-6"></div>

        <h2 class="text-lg font-semibold mb-3">About</h2>
        <p class="text-sm text-gray-700 leading-relaxed mb-6">
          {{ builder?.aboutUs || "No description provided yet." }}
        </p>

        <h2 class="text-lg font-semibold mb-3">Contact details</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <p class="text-gray-500 text-xs uppercase tracking-wider">Phone</p>
            <p class="mt-1 text-sm text-gray-800">
              {{ builder?.contactNumber || "—" }}
            </p>
          </div>
          <div>
            <p class="text-gray-500 text-xs uppercase tracking-wider">Email</p>
            <p class="mt-1 text-sm text-gray-800 truncate">
              {{ builder?.email || "—" }}
            </p>
          </div>
          <div>
            <p class="text-gray-500 text-xs uppercase tracking-wider">Address</p>
            <p class="mt-1 text-sm text-gray-800">
              {{ builder?.newAddress || "—" }}
            </p>
          </div>
        </div>

        <div v-if="builder?.guideBook" class="bg-orange-50 rounded-xl p-4">
          <p class="text-xs uppercase tracking-wider text-orange-700">
            Guide book
          </p>
          <a
            :href="builder.guideBook"
            target="_blank"
            rel="noopener"
            class="text-sm text-orange-700 underline mt-1 inline-block"
          >
            Open guide book →
          </a>
        </div>
      </div>

      <!-- RIGHT (30%) — Contact form -->
      <div class="w-full lg:w-[30%]">
        <div class="border rounded-xl p-4 flex flex-col gap-3 bg-white">
          <h3 class="font-semibold text-gray-900">Talk to this builder</h3>

          <input
            v-model="contactForm.firstName"
            type="text"
            placeholder="First name"
            class="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
          />
          <input
            v-model="contactForm.lastName"
            type="text"
            placeholder="Last name"
            class="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
          />

          <div class="flex border rounded-md overflow-hidden">
            <div class="flex items-center px-3 border-r gap-2 text-sm bg-gray-50">
              🇮🇳 +91
            </div>
            <input
              v-model="contactForm.phone"
              type="tel"
              placeholder="Phone number"
              class="w-full px-3 py-2 text-sm outline-none"
            />
          </div>

          <input
            v-model="contactForm.email"
            type="email"
            placeholder="Email"
            class="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
          />

          <button
            @click="handleConnect"
            :disabled="submitting"
            class="bg-black text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {{ submitting ? "Sending…" : "Request callback" }}
          </button>

          <p
            v-if="submitMsg"
            class="text-xs text-center"
            :class="submitMsg.startsWith('Thanks') ? 'text-green-600' : 'text-red-500'"
          >
            {{ submitMsg }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
