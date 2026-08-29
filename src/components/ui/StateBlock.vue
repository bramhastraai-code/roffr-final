<script setup>
// One empty / error state for the whole app. Before this there were three
// different empty-state designs and several pages (BrokerDetailsView, most
// notably) had none at all.
defineProps({
  // 'empty' | 'error'
  variant: { type: String, default: 'empty' },
  icon: { type: String, default: 'pi-inbox' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
})

defineEmits(['action'])
</script>

<template>
  <div
    class="text-center py-16 px-6 bg-white rounded-card border"
    :class="variant === 'error' ? 'border-red-100' : 'border-gray-200'"
  >
    <div
      class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
      :class="variant === 'error' ? 'bg-red-50' : 'bg-gray-50'"
    >
      <i
        class="pi text-2xl"
        :class="[
          variant === 'error' ? 'pi-exclamation-triangle text-brand' : `${icon} text-gray-300`,
        ]"
      ></i>
    </div>

    <p class="text-[15px] font-semibold text-gray-900">{{ title }}</p>
    <p v-if="message" class="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
      {{ message }}
    </p>

    <button
      v-if="actionLabel"
      @click="$emit('action')"
      class="mt-5 inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-control transition-colors duration-200"
    >
      <i v-if="variant === 'error'" class="pi pi-refresh text-xs"></i>
      {{ actionLabel }}
    </button>
  </div>
</template>
