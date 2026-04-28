<script setup></script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0 mt-10">
    <div class="flex gap-6">
      <!-- LEFT (70%) -->
      <div class="w-[70%]">
        <!-- Name -->
        <h1 class="text-2xl font-semibold mb-2">Abdul</h1>
        <div class="border-b mb-6"></div>

        <!-- About -->
        <h2 class="text-lg font-semibold mb-4">About the firm</h2>

        <!-- Info Row -->
        <div class="grid grid-cols-3 gap-6 mb-6">
          <div>
            <p class="text-gray-500 text-sm">Operating since</p>
            <p class="mt-1">N/A</p>
          </div>

          <div>
            <p class="text-gray-500 text-sm">Team Size</p>
            <p class="mt-1">1</p>
          </div>

          <div>
            <p class="text-gray-500 text-sm">Address</p>
            <p class="mt-1 text-blue-600 cursor-pointer">View</p>
          </div>
        </div>

        <!-- Specialization -->
        <h2 class="text-lg font-semibold">Area of Specialization</h2>
      </div>

      <!-- RIGHT (30%) -->
      <div class="w-[30%] flex flex-col gap-6">
        <!-- Image Box -->
        <div
          class="border rounded-xl h-[260px] flex items-center justify-center bg-gray-50"
        >
          <span class="text-gray-400 text-4xl">📦</span>
        </div>

        <!-- Form -->
        <div class="border rounded-xl p-4 flex flex-col gap-4">
          <input
            type="text"
            placeholder="First Name"
            class="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
          />

          <input
            type="text"
            placeholder="Last Name"
            class="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
          />

          <!-- Phone -->
          <div class="flex border rounded-md overflow-hidden">
            <div class="flex items-center px-3 border-r gap-2">
              🇮🇳
              <span class="text-sm">+91</span>
            </div>
            <input
              type="text"
              placeholder="Phone Number"
              class="w-full px-3 py-2 outline-none"
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            class="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
          />

          <button class="bg-black text-white py-2 rounded-md">
            Connect with me
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
