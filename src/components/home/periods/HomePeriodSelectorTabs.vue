<template>
  <div class="period-widget">
    <div class="period-widget__inner row items-center no-wrap">
      <div class="period-widget__tabs row no-wrap items-center q-gutter-xs">
        <q-btn
          v-for="tab in tabs"
          :key="tab.value"
          dense
          no-caps
          :label="tab.label"
          :flat="modelValue !== tab.value"
          :unelevated="modelValue === tab.value"
          :color="modelValue === tab.value ? 'primary' : 'grey-7'"
          class="period-widget__tab"
          @click="emit('update:modelValue', tab.value)"
        />
      </div>

      <div class="period-widget__spacer" />

      <div class="period-widget__nav row items-center q-gutter-xs">
        <q-btn dense flat icon="chevron_left" @click="emit('shift', -1)" />
        <div class="period-widget__label">{{ monthLabel }}</div>
        <q-btn dense flat icon="chevron_right" @click="emit('shift', 1)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type HomeIntervalKey =
  | 'all'
  | 'year'
  | 'semester'
  | 'quarter'
  | 'month'
  | 'fortnight'
  | 'week'
  | 'day'
  | 'custom';

interface TabItem {
  label: string;
  value: HomeIntervalKey;
}

interface Props {
  modelValue: HomeIntervalKey;
  monthLabel: string;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: HomeIntervalKey];
  shift: [direction: -1 | 1];
}>();

const tabs: TabItem[] = [
  { label: 'Todo', value: 'all' },
  { label: 'Anual', value: 'year' },
  { label: 'Semestral', value: 'semester' },
  { label: 'Trimestral', value: 'quarter' },
  { label: 'Mensual', value: 'month' },
  { label: 'Quincenal', value: 'fortnight' },
  { label: 'Semanal', value: 'week' },
  { label: 'Diario', value: 'day' },
  { label: 'Personalizado', value: 'custom' },
];
</script>

<style scoped lang="scss">
.period-widget {
  background: #ffffff;
  border-radius: 18px;
  padding: 10px 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 18px;

  .body--dark & {
    background: #1a1a2e;
    box-shadow: 0 10px 28px rgba(14, 165, 233, 0.14);
  }
}

.period-widget__inner {
  width: 100%;
}

.period-widget__tabs {
  flex: 1 1 auto;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.period-widget__tab {
  min-width: 86px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
}

.period-widget__spacer {
  width: 14px;
}

.period-widget__nav {
  flex: 0 0 auto;
}

.period-widget__label {
  min-width: 120px;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;

  .body--dark & {
    color: #e2e8f0;
  }
}

@media (max-width: 900px) {
  .period-widget {
    margin-bottom: 14px;
    padding: 8px 10px;
  }

  .period-widget__label {
    min-width: 100px;
    font-size: 13px;
  }
}
</style>
