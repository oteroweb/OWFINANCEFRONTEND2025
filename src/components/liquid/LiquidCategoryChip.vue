<template>
  <div class="liquid-category-chip inline-flex items-center q-px-sm q-py-xs q-mr-xs">
    <q-icon :name="icon" size="14px" v-if="icon" class="q-mr-xs" />
    <span class="text-caption font-bold tracking-tight text-uppercase">
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  icon?: string;
  color?: string;
}

withDefaults(defineProps<Props>(), {
  icon: '',
  color: 'var(--primary-cyan)'
});
</script>

<style lang="scss" scoped>
.liquid-category-chip {
  border-radius: 50px;
  background: rgba(137, 206, 255, 0.1);
  color: var(--primary-cyan);
  border: none !important;
  white-space: nowrap;
}

.font-bold { font-weight: 700; }
.tracking-tight { letter-spacing: -0.02em; }
</style>
