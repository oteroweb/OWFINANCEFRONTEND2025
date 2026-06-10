<template>
  <div class="h-40 flex items-end justify-between space-x-2 pt-4 pb-2 px-1">
    <div 
      v-for="(item, idx) in props.data" 
      :key="idx" 
      class="flex flex-col items-center justify-end flex-1 h-full gap-2 relative group"
    >
      <!-- The Bar -->
      <div 
        class="w-full bg-indigo-500 rounded-t-sm transition-all duration-700 ease-in-out hover:bg-indigo-400 cursor-pointer"
        :style="{ height: getPercentage(item.value) + '%' }"
      />
      <!-- Label -->
      <span class="text-xs text-slate-400 font-medium tracking-wide">
        {{ item.label }}
      </span>
      <!-- Tooltip -->
      <div class="absolute -top-8 bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {{ Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'}).format(item.value) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: Array<{ label: string, value: number }>
}>();

const maxVal = computed(() => {
  if (!props.data || props.data.length === 0) return 1;
  return Math.max(...props.data.map(d => d.value));
});

const getPercentage = (val: number) => {
  return (val / maxVal.value) * 100;
};
</script>
