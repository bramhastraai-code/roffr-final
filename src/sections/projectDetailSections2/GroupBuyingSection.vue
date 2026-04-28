<script setup>
import { ref } from "vue";
import VueApexCharts from "vue3-apexcharts";

const chartOptions = ref({
  chart: {
    type: "radialBar",
    sparkline: { enabled: true },
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        size: "65%",
      },
      track: {
        background: "#e5e7eb",
        strokeWidth: "100%",
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          fontSize: "28px",
          fontWeight: 600,
          offsetY: 10,
          formatter: () => "3/5",
        },
      },
    },
  },
  fill: {
    colors: ["#ef4444"], // red
  },
  stroke: {
    lineCap: "round",
  },
});

const series = ref([60]); // 3/5 = 60%

const users = ref([
  { name: "Akash Dalvi", location: "Thane" },
  { name: "Vishal Patil", location: "Thane" },
  { name: "Kiran Pawar", location: "Thane" },
]);
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 2xl:px-0 py-8">
    <div class="">
        <h1 class="title-text">Group Buying</h1>
    </div>

    <div class="bg-white border rounded-2xl p-6 flex gap-8 items-center shadow-sm mt-6">

      <!-- LEFT: Chart -->
      <div class="w-[35%] flex flex-col items-center justify-center">

        <VueApexCharts
          type="radialBar"
          height="220"
          :options="chartOptions"
          :series="series"
        />

        <p class="text-sm text-gray-500 text-center mt-3">
          Enjoy the ultimate deal after at least
          <span class="text-red-500 font-semibold">5</span> people join!
        </p>

        <button
          class="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Join group buy
        </button>

        <p class="text-xs text-red-400 mt-2">
          *Every 60 days, Restart.
        </p>
      </div>

      <!-- RIGHT: Users -->
      <div class="w-[65%] grid grid-cols-2 gap-4">
        <div
          v-for="(user, index) in users"
          :key="index"
          class="flex items-center justify-between border rounded-xl p-3"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <p class="text-sm font-medium">
                {{ user.name }}
                <span class="text-gray-400 text-xs">• {{ user.location }}</span>
              </p>
              <p class="text-red-500 text-xs">3 bhk</p>
            </div>
          </div>

          <div class="text-green-500 text-lg">✔</div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* optional smooth look */
</style>