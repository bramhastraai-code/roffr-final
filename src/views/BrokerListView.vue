<script setup>
import { onMounted, ref } from 'vue';
import { useBrokerStore } from '@/stores/brokerStore';
import { storeToRefs } from 'pinia';

const brokerStore = useBrokerStore()

onMounted(async() => {
    await brokerStore.getBrokerData()
})

// original (kept)
const { brokerData } = storeToRefs(brokerStore)

// ✅ mock override
brokerData.value = [
    {
        name: "360 degrees",
        rera_id: "A51800002698",
        operating_since: "2004",
        team_members: 3,
        sale_listings: 43,
        rental_listings: 40,
        active_areas: "Bandra Kurla Complex, Bandra West",
        active_buildings: "Lodha Adrina, Lodha Altamount",
        logo: "https://via.placeholder.com/120x60?text=360"
    },
    {
        name: "Abdul",
        rera_id: "",
        operating_since: "N/A",
        team_members: 1,
        sale_listings: 0,
        rental_listings: 0,
        active_areas: "",
        active_buildings: "",
        logo: ""
    },
    {
        name: "Ad",
        rera_id: "",
        operating_since: "N/A",
        team_members: 1,
        sale_listings: 0,
        rental_listings: 0,
        active_areas: "",
        active_buildings: "",
        logo: ""
    },
    {
        name: "Aditya Pasari",
        rera_id: "",
        operating_since: "N/A",
        team_members: 1,
        sale_listings: 0,
        rental_listings: 0,
        active_areas: "",
        active_buildings: "",
        logo: ""
    }
]
</script>

<template>
    <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0 mt-10">
        <h1 class="title-text text-center mb-8">Find Realtor</h1>

        <!-- Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Card -->
            <div
                v-for="(broker, index) in brokerData"
                :key="index"
                class="bg-white rounded-xl border shadow-sm overflow-hidden"
            >
                <!-- Top Image -->
                <div class="h-[160px] bg-gray-100 flex items-center justify-center">
                    <img
                        v-if="broker?.logo"
                        :src="broker.logo"
                        class="h-16 object-contain"
                        alt="logo"
                    />
                    <div v-else class="text-gray-400">
                        📦
                    </div>
                </div>

                <!-- Content -->
                <div class="p-4 text-sm text-gray-700">
                    
                    <!-- Name -->
                    <h2 class="font-semibold text-lg text-black">
                        {{ broker?.name || 'N/A' }}
                    </h2>

                    <!-- RERA -->
                    <p class="text-xs text-gray-500 mb-3">
                        RERA ID: {{ broker?.rera_id || 'N/A' }}
                    </p>

                    <!-- Divider -->
                    <div class="border-t my-2"></div>

                    <!-- Info -->
                    <div class="flex justify-between py-1">
                        <span class="text-gray-500">Operating Since</span>
                        <span>{{ broker?.operating_since || 'N/A' }}</span>
                    </div>

                    <div class="flex justify-between py-1">
                        <span class="text-gray-500">Team members</span>
                        <span>{{ broker?.team_members || 0 }}</span>
                    </div>

                    <div class="flex justify-between py-1">
                        <span class="text-gray-500">Sale listings</span>
                        <span>{{ broker?.sale_listings || 0 }}</span>
                    </div>

                    <div class="flex justify-between py-1">
                        <span class="text-gray-500">Rental listings</span>
                        <span>{{ broker?.rental_listings || 0 }}</span>
                    </div>

                    <div class="border-t my-2"></div>

                    <div class="flex justify-between gap-4 py-1">
                        <span class="text-gray-500">Active areas</span>
                        <p class="text-xs mt-1 line-clamp-1">
                            {{ broker?.active_areas || 'N/A' }}
                        </p>
                    </div>

                    <div class="border-t my-2"></div>

                    <div class="flex justify-between gap-4 py-1">
                        <span class="text-gray-500">Active buildings</span>
                        <p class="text-xs mt-1 line-clamp-1">
                            {{ broker?.active_buildings || 'N/A' }}
                        </p>
                    </div>

                </div>
            </div>

        </div>
    </section>
</template>