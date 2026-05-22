<script setup>
import { onMounted, computed } from "vue";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
import { useAuthStore } from "@/stores/authStore";

const groupBuyStore = useGroupBuyStore();
const authStore = useAuthStore();

const customerId = computed(
  () =>
    authStore?.user?._id ||
    authStore?.customer?._id ||
    localStorage.getItem("customerId") ||
    ""
);

const fmtCurrency = (v) =>
  v != null ? `₹ ${Number(v).toLocaleString("en-IN")}` : "—";

const statusBadgeClass = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "PAYMENT_DONE":
      return "bg-blue-100 text-blue-700";
    case "ACCEPTED":
    case "FOLLOWUP":
    case "SITE_VISIT_SCHEDULED":
      return "bg-emerald-100 text-emerald-700";
    case "CONVERTED":
      return "bg-green-200 text-green-800";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

onMounted(async () => {
  if (customerId.value) {
    await groupBuyStore.fetchMyRequests(customerId.value);
  }
});
</script>

<template>
  <section class="px-4 md:px-10 py-8 max-w-6xl mx-auto">
    <h1 class="font-marcellus text-2xl md:text-3xl text-gray-900">
      My Group Buys
    </h1>
    <p class="text-sm text-gray-500 mt-1">
      Track all group-buy campaigns you've joined and their token payments.
    </p>

    <div v-if="groupBuyStore.loading" class="mt-10 text-center text-gray-500">
      Loading...
    </div>

    <div
      v-else-if="!groupBuyStore.myRequests.length"
      class="mt-10 text-center text-gray-500"
    >
      You haven't joined any group buy yet.
    </div>

    <div v-else class="grid md:grid-cols-2 gap-4 mt-6">
      <article
        v-for="req in groupBuyStore.myRequests"
        :key="req._id"
        class="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm"
      >
        <header class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-400">
              {{ req.campaignId?.title || "Group buy" }}
            </p>
            <h3 class="text-lg font-semibold mt-1 text-gray-900">
              {{ req.projectId?.projectName || "Project" }}
            </h3>
            <p class="text-xs text-gray-500">
              {{ req.projectId?.glocation || req.projectId?.city || "" }}
            </p>
          </div>
          <span
            class="text-[10px] font-semibold px-2 py-1 rounded-full"
            :class="statusBadgeClass(req.status)"
            >{{ req.status }}</span
          >
        </header>

        <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div>
            <p class="text-xs text-gray-400">Token amount</p>
            <p class="font-medium">{{ fmtCurrency(req.tokenAmount) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Payment status</p>
            <p
              class="font-medium text-xs"
              :class="req.tokenPaid ? 'text-emerald-600' : 'text-amber-600'"
            >
              {{ req.tokenPaid ? "✓ Builder confirmed receipt" : "Pay token to builder" }}
            </p>
          </div>
        </div>

        <div
          v-if="req.sourcingManagerId"
          class="mt-4 rounded-xl bg-gray-50 px-3 py-2 text-xs"
        >
          <p class="text-gray-500">Your sourcing manager</p>
          <p class="font-medium text-gray-800">
            {{ req.sourcingManagerId.name }} — {{ req.sourcingManagerId.phoneNumber }}
          </p>
        </div>

        <div
          v-if="req.notes && req.notes.length"
          class="mt-3 text-xs text-gray-500 space-y-1"
        >
          <p class="font-semibold text-gray-600">Updates</p>
          <p
            v-for="(n, i) in req.notes.slice(-3)"
            :key="i"
            class="border-l-2 border-orange-200 pl-2"
          >
            <span class="italic">{{ n.byRole }}:</span> {{ n.note }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
