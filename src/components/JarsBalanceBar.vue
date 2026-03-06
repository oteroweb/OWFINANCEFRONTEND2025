<template>
  <div class="jars-bar" aria-label="Disponible por cántaro">
    <!-- Loading skeleton -->
    <div v-if="loading" class="jars-bar__inner">
      <div class="row no-wrap items-center q-gutter-xs q-px-sm">
        <q-skeleton v-for="i in 6" :key="i" height="22px" width="90px" style="border-radius: 999px;" />
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="items.length" class="jars-bar__inner" ref="scrollEl">
      <div class="row no-wrap items-center q-px-sm" style="gap: 6px; min-width: max-content;">
        <div class="jars-bar__prefix text-caption text-grey-6 q-mr-xs no-wrap">
          {{ periodLabel }}
        </div>
        <div
          v-for="jar in items"
          :key="jar.id"
          class="jars-bar__chip row no-wrap items-center"
          :class="{
            'jars-bar__chip--neg': jar.available < 0,
            'jars-bar__chip--warn': jar.available >= 0 && jar.allocated > 0 && jar.available < jar.allocated * 0.15,
            'jars-bar__chip--ok': jar.available >= 0 && (jar.allocated <= 0 || jar.available >= jar.allocated * 0.15),
          }"
        >
          <span class="jars-bar__dot" :style="{ background: jar.color }" />
          <span class="jars-bar__name text-caption">{{ jar.name }}</span>
          <span class="jars-bar__sep">·</span>
          <span
            class="jars-bar__amount text-caption text-weight-bold"
            :class="jar.available < 0 ? 'text-negative' : (jar.available < (jar.allocated * 0.15) && jar.allocated > 0 ? 'text-orange-8' : 'text-green-8')"
          >{{ currencySymbol }}{{ formatNum(jar.available) }}</span>
        </div>
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="refresh"
          color="grey-5"
          class="q-ml-xs"
          :loading="refreshing"
          @click="load(true)"
        >
          <q-tooltip>Actualizar disponible</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="jars-bar__inner row items-center q-px-sm text-caption text-grey-5" style="height: 30px;">
      Sin cántaros activos
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';
import { usePeriodStore } from 'stores/period';

// ------ props / emits ------
defineOptions({ name: 'JarsBalanceBar' });

// ------ stores ------
const auth = useAuthStore();
const period = usePeriodStore();

// ------ state ------
interface JarItem {
  id: number;
  name: string;
  color: string;
  available: number;
  allocated: number;
}

const items = ref<JarItem[]>([]);
const loading = ref(true);
const refreshing = ref(false);

// ------ computed ------
const currencySymbol = computed(() => {
  const u = auth.user as Record<string, unknown> | null;
  const cur = u?.currency as Record<string, unknown> | null;
  return (cur?.symbol as string) || '$';
});

const anchorMonth = computed(() => period.state.anchor.slice(0, 7)); // YYYY-MM

const periodLabel = computed(() => {
  const d = new Date(period.state.anchor + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) + ':';
});

// ------ helpers ------
function formatNum(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return sign + (abs / 1000).toFixed(1) + 'k';
  return sign + abs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ------ main load ------
async function load(isRefresh = false) {
  if (isRefresh) refreshing.value = true;
  else loading.value = true;

  try {
    const anchor = period.state.anchor; // YYYY-MM-DD
    const [y, m] = anchor.split('-').map(Number);

    // Single bulk call — GET /jars/all-balances?year=Y&month=M
    const res = await api.get('/jars/all-balances', { params: { year: y, month: m } });
    const raw: Array<{
      jar_id: number;
      jar_name: string;
      color: string;
      available_balance: number;
      allocated_amount: number;
    }> = res.data?.data || [];

    items.value = raw
      .map((r) => ({
        id: r.jar_id,
        name: r.jar_name,
        color: r.color || '#6B7280',
        available: Number(r.available_balance ?? 0),
        allocated: Number(r.allocated_amount ?? 0),
      }))
      .sort((a, b) => {
        if (a.available < 0 && b.available >= 0) return -1;
        if (a.available >= 0 && b.available < 0) return 1;
        return a.name.localeCompare(b.name);
      });
  } catch (e) {
    console.error('[JarsBalanceBar] Error loading balances:', e);
    items.value = [];
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

// ------ lifecycle ------
onMounted(() => void load());

// Reload whenever the anchor month changes
watch(anchorMonth, () => void load());

// Expose refresh for parent
defineExpose({ refresh: () => void load(true) });
</script>

<style scoped>
.jars-bar {
  background: #f5f7fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  overflow: hidden;
  min-height: 34px;
  display: flex;
  align-items: center;
}

.jars-bar__inner {
  overflow-x: auto;
  scrollbar-width: none;       /* Firefox */
  -ms-overflow-style: none;    /* IE */
  width: 100%;
  padding: 4px 0;
  display: flex;
  align-items: center;
}
.jars-bar__inner::-webkit-scrollbar {
  display: none;               /* Chrome/Safari */
}

.jars-bar__prefix {
  white-space: nowrap;
  font-size: 11px;
  user-select: none;
}

.jars-bar__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px 3px 6px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  user-select: none;
  transition: background 0.15s;
  cursor: default;
}
.jars-bar__chip--ok {
  background: rgba(74, 222, 128, 0.1);
}
.jars-bar__chip--warn {
  background: rgba(251, 191, 36, 0.15);
}
.jars-bar__chip--neg {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
}

.jars-bar__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.jars-bar__name {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.7);
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.jars-bar__sep {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.3);
}

.jars-bar__amount {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

/* Mobile refinements */
@media (max-width: 599px) {
  .jars-bar__name {
    max-width: 60px;
  }
  .jars-bar__chip {
    padding: 2px 6px 2px 5px;
    font-size: 10px;
  }
  .jars-bar__amount,
  .jars-bar__name,
  .jars-bar__sep {
    font-size: 10px;
  }
  .jars-bar__dot {
    width: 7px;
    height: 7px;
  }
}
</style>
