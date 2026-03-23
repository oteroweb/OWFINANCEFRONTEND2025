<template>
  <div class="expense-chart-grid">
    <q-card flat class="glass-panel chart-card">
      <q-card-section class="chart-card__header">
        <div>
          <div class="text-subtitle1 text-weight-bold">Distribucion por cantaro</div>
          <div class="text-caption text-grey-7" style="opacity:0.8">
            Peso visual del presupuesto esperado en el periodo actual.
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="chart-card__body">
        <VChart class="chart-surface" autoresize :option="pieOption" />
      </q-card-section>
    </q-card>

    <q-card flat class="glass-panel chart-card">
      <q-card-section class="chart-card__header">
        <div>
          <div class="text-subtitle1 text-weight-bold">Asignado vs gastado</div>
          <div class="text-caption text-grey-7">
            Comparacion rapida entre lo planificado, lo consumido y el balance real.
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="chart-card__body">
        <VChart class="chart-surface" autoresize :option="barOption" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
} from 'echarts/components';

use([CanvasRenderer, PieChart, BarChart, TooltipComponent, LegendComponent, GridComponent, TitleComponent]);

type JarChartRow = {
  id: number;
  name: string;
  color: string;
  assignedExpected: number;
  spent: number;
  balance: number;
};

const props = defineProps<{
  rows: JarChartRow[];
  currencyCode: string;
  hideValues?: boolean;
}>();

function formatAmount(amount: number): string {
  if (props.hideValues) return '••••••';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: props.currencyCode || 'USD',
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${props.currencyCode || 'USD'}`;
  }
}

const safeRows = computed(() => props.rows.filter((row) => Number(row.assignedExpected) > 0 || Number(row.spent) !== 0 || Number(row.balance) !== 0));

const pieOption = computed(() => ({
  backgroundColor: 'transparent',
  color: safeRows.value.map((row) => row.color || '#6b7280'),
  tooltip: {
    trigger: 'item',
    formatter: (params: { name: string; value: number; percent: number }) =>
      `${params.name}<br/>Asignado: ${formatAmount(params.value)}<br/>Peso: ${params.percent}%`,
  },
  legend: {
    top: 0,
    type: 'scroll',
    icon: 'circle',
    textStyle: {
      color: '#4b5563',
      fontSize: 11,
    },
  },
  series: [
    {
      type: 'pie',
      radius: ['42%', '70%'],
      center: ['50%', '56%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 6,
      },
      label: {
        color: '#374151',
        formatter: (params: { name: string; value: number }) => `${params.name}\n${formatAmount(params.value)}`,
      },
      emphasis: {
        scale: true,
        scaleSize: 8,
      },
      data: safeRows.value.map((row) => ({
        value: Number(row.assignedExpected || 0),
        name: row.name,
      })),
    },
  ],
  animationEasing: 'cubicOut',
  animationDuration: 1200,
}));

const barOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: Array<{ seriesName: string; value: number; name: string }>) => {
      if (!params.length) return '';
      const title = params[0]?.name || '';
      const lines = params.map((item) => `${item.seriesName}: ${formatAmount(item.value)}`);
      return [title, ...lines].join('<br/>');
    },
  },
  legend: {
    top: 0,
    textStyle: { color: '#4b5563', fontSize: 11 },
  },
  grid: {
    left: 12,
    right: 12,
    top: 42,
    bottom: 10,
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    axisLabel: {
      color: '#6b7280',
      formatter: (value: number) => formatAmount(value),
    },
    splitLine: {
      lineStyle: { color: 'rgba(148, 163, 184, 0.18)' },
    },
  },
  yAxis: {
    type: 'category',
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      color: '#374151',
      width: 110,
      overflow: 'truncate',
    },
    data: safeRows.value.map((row) => row.name),
  },
  series: [
    {
      name: 'Asignado',
      type: 'bar',
      barMaxWidth: 18,
      itemStyle: { color: '#0ea5e9', borderRadius: [0, 8, 8, 0] },
      data: safeRows.value.map((row) => Number(row.assignedExpected || 0)),
    },
    {
      name: 'Gastado',
      type: 'bar',
      barMaxWidth: 18,
      itemStyle: { color: '#ef4444', borderRadius: [0, 8, 8, 0] },
      data: safeRows.value.map((row) => Number(row.spent || 0)),
    },
    {
      name: 'Balance',
      type: 'bar',
      barMaxWidth: 18,
      itemStyle: { color: '#10b981', borderRadius: [0, 8, 8, 0] },
      data: safeRows.value.map((row) => Number(row.balance || 0)),
    },
  ],
  animationEasing: 'cubicOut',
  animationDuration: 1200,
}));
</script>

<style scoped>
.expense-chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chart-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.chart-card__header {
  padding: 18px 18px 14px;
}

.chart-card__body {
  padding: 8px 12px 12px;
}

.chart-surface {
  width: 100%;
  min-height: 360px;
}

@media (max-width: 768px) {
  .chart-surface {
    min-height: 300px;
  }
}
</style>