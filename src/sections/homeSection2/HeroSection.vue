<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";
import { useSearchStore } from "@/stores/SearchStore";
const searchStore = useSearchStore();
const { searchSuggestionData, term } = storeToRefs(searchStore);

import { storeToRefs } from "pinia";
import { debounce } from "@/utils/debounce";

const suggestionsList = computed(() =>
  Array.isArray(searchSuggestionData.value)
    ? searchSuggestionData.value
    : searchSuggestionData.value?.data || [],
);
</script>

<template>
  <section class="relative">
    <div class="">
      <img
        src="https://images.unsplash.com/photo-1563891315366-4606cd73a33f?q=1920&auto=format"
        alt=""
        class="w-full h-[500px] xl:h-[700px] object-cover"
      />

      <div class="absolute inset-0 bg-black/60"></div>
    </div>

    <div
      class="text-center absolute top-[35%] -translate-x-1/2 left-1/2 text-white w-full"
    >
      <div class="">
        <h1 class="font-outfit text-[35px] md:text-[50px] xl:text-[75px]">Why Pay More Alone?</h1>
        <p class="font-inter text-[14px] xl:text-[20px] md:max-w-3xl mx-auto">
          Unlock massive savings through the power of collective buying. Join
          thousands of smart families securing their dream homes together.
        </p>
      </div>

      <div
        ref="containerRef"
        class="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl p-[1px] rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-xl relative mt-6 mx-auto"
      >
        <div
          class="w-full flex items-center bg-white rounded-full px-2 sm:px-3 py-1.5 sm:py-2 gap-1 sm:gap-2"
        >
          <!-- City dropdown -->
          <div class="relative flex items-center">
            <button
              type="button"
              class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-gray-700 text-xs sm:text-sm font-medium outline-none hover:text-orange-600 transition-colors"
              @click.stop="cityDropdownOpen = !cityDropdownOpen"
            >
              <span class="truncate max-w-[90px] sm:max-w-[140px]">
                {{ selectedCity || "All cities" }}
              </span>
              <i
                class="pi text-[10px] sm:text-xs"
                :class="cityDropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'"
              ></i>
            </button>

            <div class="h-5 sm:h-6 w-px bg-gray-300 mx-1.5 sm:mx-2"></div>

            <ul
              v-if="cityDropdownOpen"
              class="absolute top-full left-0 mt-2 w-40 sm:w-48 max-h-64 overflow-auto bg-white text-black rounded-2xl shadow-lg border border-gray-200 z-30 text-xs sm:text-sm"
            >
              <li
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                @click.stop="onCitySelect('')"
              >
                All cities
              </li>
              <li
                v-for="city in uniqueCitiesData"
                :key="city"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                @click.stop="onCitySelect(city)"
              >
                {{ city }}
              </li>
            </ul>
          </div>

          <!-- Search input -->
          <input
            v-model="searchInput"
            type="text"
            class="w-full outline-none px-1.5 sm:px-2 text-gray-600 placeholder-gray-400 text-xs sm:text-sm md:text-base"
            placeholder="Search for locations, Developers, Projects"
            autocomplete="off"
            @keyup.enter="onSearchButtonClicked"
          />

          <!-- Search button -->
          <button
            @click="onSearchButtonClicked"
            class="h-8 w-8 sm:h-10 sm:w-10 min-w-[2rem] sm:min-w-[2.5rem] rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <i class="pi pi-search text-xs sm:text-sm"></i>
          </button>

          <!-- Suggestions dropdown -->
          <ul
            v-if="suggestionsVisible && suggestionsList.length"
            class="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-auto bg-white text-black rounded-2xl shadow-lg border border-gray-200 z-50 text-xs sm:text-sm"
          >
            <li
              v-for="(suggestion, index) in suggestionsList"
              :key="suggestion._id || index"
              class="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer"
              @click="onSuggestionClick(suggestion?._id)"
            >
              {{ suggestion.title }}
            </li>
          </ul>
        </div>
      </div>
    </div>

  </section>
  <div class="max-w-7xl mx-auto mt-10 bg-black text-white flex items-center justify-between py-4 px-10 rounded-md">
    <div class="">
      <p class="font-semibold text-[25px]">Find my Realtor</p>
      <p>Connect with the best locality property advisors</p>
    </div>
    <div class="">
      <router-link to="/broker-list" class="bg-white px-6 py-2 rounded-full font-semibold text-black flex items-center gap-1"><p>Search</p>
        <i class="pi pi-angle-right"></i>
      </router-link>
    </div>
  </div>
</template>
