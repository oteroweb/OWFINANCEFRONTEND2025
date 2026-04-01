<template>
  <component
    :is="tag"
    class="relative inline-flex items-center justify-center overflow-hidden font-medium transition-all duration-200 active:scale-[0.97]"
    :class="[
      variant === 'primary' ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30' : '',
      variant === 'secondary' ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : '',
      variant === 'glass' ? 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20' : '',
      size === 'sm' ? 'px-3 py-1.5 text-sm rounded-lg' : '',
      size === 'md' ? 'px-4 py-2 text-base rounded-xl' : '',
      size === 'lg' ? 'px-6 py-3 text-lg rounded-2xl' : '',
      block ? 'w-full' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tag?: string;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
}>(), {
  tag: 'button',
  variant: 'primary',
  size: 'md',
  block: false
});

defineEmits(['click']);
</script>
