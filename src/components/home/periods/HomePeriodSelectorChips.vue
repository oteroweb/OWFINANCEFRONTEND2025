<template>
  <div class="period-chips">
    <button
      v-for="tab in primaryTabs"
      :key="tab.value"
      class="period-chips__chip"
      :class="{ 'period-chips__chip--active': modelValue === tab.value }"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>

    <!-- "Más" dropdown for extended granularities -->
    <div class="period-chips__more-wrap">
      <button
        class="period-chips__chip period-chips__chip--more"
        :class="{ 'period-chips__chip--active': isExtended }"
        @click="showMore = !showMore"
      >
        {{ isExtended ? activeExtendedLabel : 'Más' }}
        <span class="material-icons" style="font-size:15px; vertical-align:middle">expand_more</span>
      </button>
      <div v-if="showMore" class="period-chips__dropdown">
        <button
          v-for="tab in secondaryTabs"
          :key="tab.value"
          class="period-chips__dropdown-item"
          :class="{ 'period-chips__dropdown-item--active': modelValue === tab.value }"
          @click="selectSecondary(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PeriodType } from 'stores/period';

interface Props {
  modelValue: PeriodType;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: PeriodType];
}>();

const showMore = ref(false);

const primaryTabs: Array<{ label: string; value: PeriodType }> = [
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' },
];

const secondaryTabs: Array<{ label: string; value: PeriodType }> = [
  { label: 'Día', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Quincena', value: 'fortnight' },
  { label: 'Bimestre', value: 'semester' },
  { label: 'Todo', value: 'all' },
];

const isExtended = computed(() =>
  secondaryTabs.some((t) => t.value === props.modelValue)
);

const activeExtendedLabel = computed(() => {
  const found = secondaryTabs.find((t) => t.value === props.modelValue);
  return found?.label ?? 'Más';
});

function selectSecondary(value: PeriodType) {
  emit('update:modelValue', value);
  showMore.value = false;
}
</script>

<style scoped lang="scss">
.period-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  align-items: center;
}

.period-chips__chip {
  border: none;
  border-radius: 9999px;
  background: var(--surface-2, #f1f4f6);
  color: var(--fg-2, #64748b);
  font-weight: 600;
  font-size: 12.5px;
  padding: 8px 14px;
  cursor: pointer;
  transition: all 160ms cubic-bezier(0.23, 1, 0.32, 1);
  display: inline-flex;
  align-items: center;
  gap: 3px;

  .body--dark & {
    background: #222a3d;
    color: #94a3b8;
  }

  &:active {
    transform: scale(0.97);
  }
}

.period-chips__chip--active {
  background: var(--brand-primary, #2d4da6);
  color: #fff;
}

.period-chips__chip--more {
  gap: 2px;
}

.period-chips__more-wrap {
  position: relative;
}

.period-chips__dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 50;
  background: var(--surface-1, #fff);
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  padding: 6px;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.period-chips__dropdown-item {
  border: none;
  background: transparent;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-1, #0f172a);
  cursor: pointer;
  text-align: left;

  &:hover {
    background: var(--surface-2, #f1f4f6);
  }
}

.period-chips__dropdown-item--active {
  background: var(--brand-primary, #2d4da6);
  color: #fff;

  &:hover {
    background: var(--brand-primary, #2d4da6);
  }
}
</style>
