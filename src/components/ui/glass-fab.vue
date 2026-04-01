<template>
  <button
    class="glass-fab border border-white/40 shadow-xl backdrop-blur-md z-50 transition-transform cursor-pointer rounded-full flex items-center justify-center outline-none select-none active:scale-95"
    :class="[
      sizeClasses[size],
      colorClasses[color],
      positionClasses[position]
    ]"
    @click="$emit('click', $event)"
  >
    <q-icon :name="icon" :size="iconSize" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  size: {
    type: String as () => 'md' | 'lg' | 'xl',
    default: 'lg',
  },
  color: {
    type: String as () => 'primary' | 'dark' | 'glass',
    default: 'primary',
  },
  position: {
    type: String as () => 'bottom-right' | 'bottom-center',
    default: 'bottom-right',
  }
});

defineEmits(['click']);

const sizeClasses = {
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16',
};

const iconSize = computed(() => {
  return props.size === 'md' ? '24px' : props.size === 'lg' ? '28px' : '32px';
});

const colorClasses = {
  primary: 'bg-indigo-600/90 text-white border-indigo-500/50',
  dark: 'bg-slate-800/90 text-white border-slate-700/50',
  glass: 'bg-white/40 text-slate-800 border-white/60',
};

const positionClasses = {
  'bottom-right': 'fixed bottom-6 right-6',
  'bottom-center': 'fixed bottom-6 left-1/2 -translate-x-1/2',
};
</script>

<style scoped>
.glass-fab {
  /* Add physics-based spring curve for scaling, same as Emil's rules */
  transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition-duration: 0.3s;
}

.glass-fab:active {
  transition-duration: 0.1s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
