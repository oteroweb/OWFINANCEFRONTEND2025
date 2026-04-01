<template>
  <div class="liquid-jar-card q-pa-lg column justify-between">
    <div class="row justify-between items-start">
      <div class="icon-box flex flex-center">
        <q-icon :name="icon" size="24px" />
      </div>
      <q-btn round flat icon="more_vert" size="sm" class="text-soft" />
    </div>

    <div class="column q-mt-lg">
      <span class="text-subtitle2 text-soft tracking-wider uppercase font-medium">
        {{ label }}
      </span>
      <div class="row items-baseline q-gutter-x-xs">
        <span class="text-h5 text-pure text-editorial font-bold">
          {{ currency }}{{ amount }}
        </span>
      </div>
      
      <!-- Liquid Progress Bar -->
      <div class="progress-container q-mt-sm">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  amount: string | number;
  progress?: number;
  currency?: string;
  icon?: string;
}

withDefaults(defineProps<Props>(), {
  progress: 0,
  currency: '$',
  icon: 'solar:jar-bold-duotone'
});
</script>

<style lang="scss" scoped>
.liquid-jar-card {
  width: 160px;
  height: 200px;
  border-radius: 32px;
  background: var(--surface-container);
  flex-shrink: 0;
  border: none !important;
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);

  &:active {
    transform: scale(0.95);
  }
}

.icon-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--surface-container-high);
  color: var(--primary-cyan);
}

.progress-container {
  height: 6px;
  background: var(--surface-container-highest);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #89ceff 0%, #0ea5e9 100%);
  border-radius: 3px;
}

.text-editorial { font-family: 'Manrope', sans-serif !important; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-pure { color: var(--text-pure); }
.text-soft { color: var(--text-soft); }
.tracking-wider { letter-spacing: 0.08em; }
</style>
