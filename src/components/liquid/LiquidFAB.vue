<template>
  <q-page-sticky position="bottom" :offset="offset" class="fab-sticky">
    <q-btn
      fab
      :icon="icon"
      class="liquid-fab"
      @click="$emit('click')"
    />
  </q-page-sticky>
</template>

<script setup lang="ts">
interface Props {
  icon?: string;
  offset?: [number, number];
}

withDefaults(defineProps<Props>(), {
  icon: 'add',
  offset: () => [0, 24]
});

defineEmits(['click']);
</script>

<style lang="scss" scoped>
.fab-sticky {
  z-index: 2000;
}

.liquid-fab {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #89ceff 0%, #7c4dff 100%) !important;
  color: white !important;
  box-shadow: 0 12px 24px rgba(124, 77, 255, 0.4) !important;
  border: none !important;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  
  &:active {
    transform: scale(0.85) rotate(90deg);
  }
}
</style>
