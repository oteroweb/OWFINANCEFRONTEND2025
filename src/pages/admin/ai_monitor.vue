<template>
  <div class="ai-monitor">
    <div class="ai-monitor__header">
      <div>
        <div class="ai-monitor__super">Admin · Monitor</div>
        <h1 class="ai-monitor__title">IA Providers</h1>
      </div>
      <div class="ai-monitor__period-sel">
        <button v-for="d in [7,30,90]" :key="d"
          class="ai-monitor__period-btn"
          :class="{ 'ai-monitor__period-btn--active': period === d }"
          @click="period = d; loadStats()">
          {{ d }}d
        </button>
      </div>
    </div>

    <!-- Provider status cards -->
    <div class="ai-monitor__providers">
      <div v-for="p in providers" :key="p.id" class="ai-provider-card"
        :class="{ 'ai-provider-card--active': isActive(p.id), 'ai-provider-card--ok': p.has_key, 'ai-provider-card--missing': !p.has_key }">
        <div class="ai-provider-card__head">
          <div class="ai-provider-card__dot" :class="p.has_key ? 'ai-provider-card__dot--ok' : 'ai-provider-card__dot--off'"></div>
          <span class="ai-provider-card__name">{{ p.label }}</span>
          <span v-if="isActive(p.id)" class="ai-provider-card__badge">activo</span>
        </div>
        <div class="ai-provider-card__model">{{ p.model_extraction }}</div>
        <div class="ai-provider-card__stats" v-if="providerStats(p.id) as any">
          <span class="ai-provider-card__calls">{{ providerStats(p.id)!.calls }} llamadas</span>
          <span class="ai-provider-card__cost">${{ Number(providerStats(p.id)!.cost_usd).toFixed(4) }}</span>
        </div>
        <div v-else class="ai-provider-card__nodata">sin actividad</div>
        <div class="ai-provider-card__chain" v-if="chainPosition(p.id) !== null">
          <span class="material-icons" style="font-size:13px">low_priority</span>
          fallback #{{ (chainPosition(p.id) as number) + 1 }}
        </div>
      </div>
    </div>

    <!-- Summary KPIs -->
    <div class="ai-monitor__kpis" v-if="stats">
      <div class="ai-kpi">
        <span class="ai-kpi__val">{{ stats.totals?.total_calls ?? 0 }}</span>
        <span class="ai-kpi__lbl">llamadas ({{ period }}d)</span>
      </div>
      <div class="ai-kpi">
        <span class="ai-kpi__val">{{ fmtTokens(stats.totals?.total_input) }}</span>
        <span class="ai-kpi__lbl">tokens entrada</span>
      </div>
      <div class="ai-kpi">
        <span class="ai-kpi__val">{{ fmtTokens(stats.totals?.total_output) }}</span>
        <span class="ai-kpi__lbl">tokens salida</span>
      </div>
      <div class="ai-kpi">
        <span class="ai-kpi__val ai-kpi__val--cost">${{ Number(stats.totals?.total_cost ?? 0).toFixed(4) }}</span>
        <span class="ai-kpi__lbl">costo estimado</span>
      </div>
    </div>

    <!-- By feature -->
    <div v-if="stats?.by_feature?.length" class="ai-monitor__section">
      <div class="ai-monitor__section-title">Por funcionalidad</div>
      <div class="ai-monitor__feature-row" v-for="f in stats.by_feature" :key="f.feature">
        <span class="ai-monitor__feature-name">
          <span class="material-icons">{{ featureIcon(f.feature) }}</span>
          {{ featureLabel(f.feature) }}
        </span>
        <span class="ai-monitor__feature-calls">{{ f.calls }} llamadas</span>
        <span class="ai-monitor__feature-cost">${{ Number(f.cost_usd).toFixed(4) }}</span>
      </div>
    </div>

    <!-- Recent calls table -->
    <div class="ai-monitor__section" v-if="stats?.recent?.length">
      <div class="ai-monitor__section-title">Últimas llamadas</div>
      <div class="ai-monitor__table-wrap">
        <table class="ai-monitor__table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>User</th>
              <th>Funcionalidad</th>
              <th>Provider</th>
              <th>Modelo</th>
              <th>Tokens E</th>
              <th>Tokens S</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in stats.recent" :key="r.id">
              <td>{{ r.date }}</td>
              <td>#{{ r.user_id }}</td>
              <td>
                <span class="ai-monitor__feat-chip">
                  <span class="material-icons">{{ featureIcon(r.feature) }}</span>
                  {{ featureLabel(r.feature) }}
                </span>
              </td>
              <td>
                <span class="ai-monitor__provider-chip" :class="'ai-monitor__provider-chip--' + r.provider_name">
                  {{ r.provider_name }}
                </span>
              </td>
              <td class="ai-monitor__mono">{{ r.model_used }}</td>
              <td class="ai-monitor__mono">{{ fmtTokens(r.input_tokens) }}</td>
              <td class="ai-monitor__mono">{{ fmtTokens(r.output_tokens) }}</td>
              <td class="ai-monitor__cost-cell">${{ Number(r.estimated_cost_usd).toFixed(5) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && !stats?.recent?.length" class="ai-monitor__empty">
      <span class="material-icons">auto_awesome</span>
      <p>Aún no hay llamadas registradas en este período.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

interface Provider {
  id: string
  label: string
  has_key: boolean
  model_extraction: string
  model_advisor: string
  pricing: Record<string, number>
}

interface Stats {
  period_days: number
  totals: { total_calls: number; total_input: number; total_output: number; total_cost: number } | null
  by_provider: Array<{ provider_name: string; calls: number; input_tokens: number; output_tokens: number; cost_usd: number }>
  by_feature: Array<{ feature: string; calls: number; cost_usd: number }>
  recent: Array<{ id: number; user_id: number; feature: string; provider_name: string; model_used: string; input_tokens: number; output_tokens: number; estimated_cost_usd: number; date: string }>
}

const period    = ref(30)
const loading   = ref(false)
const providers = ref<Provider[]>([])
const stats     = ref<Stats | null>(null)
const activeExtraction = ref('')
const activeAdvisor    = ref('')
const extractionChain  = ref<string[]>([])
const advisorChain     = ref<string[]>([])

function isActive(id: string) {
  return id === activeExtraction.value || id === activeAdvisor.value
}

function chainPosition(id: string): number | null {
  const ei = extractionChain.value.indexOf(id)
  const ai = advisorChain.value.indexOf(id)
  const pos = Math.min(ei === -1 ? 99 : ei, ai === -1 ? 99 : ai)
  return pos === 99 ? null : pos
}

function providerStats(id: string) {
  return stats.value?.by_provider.find(p => p.provider_name === id)
}

function fmtTokens(n: number | null | undefined): string {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return String(n)
}

const FEATURE_LABELS: Record<string, string> = {
  voice: 'Voz', ocr: 'OCR', auto_ia: 'Auto IA', advisor: 'Asesor',
}
const FEATURE_ICONS: Record<string, string> = {
  voice: 'mic', ocr: 'document_scanner', auto_ia: 'auto_awesome', advisor: 'support_agent',
}
function featureLabel(f: string) { return FEATURE_LABELS[f] ?? f }
function featureIcon(f: string)  { return FEATURE_ICONS[f]  ?? 'star' }

async function loadProviders() {
  const { data } = await api.get('/admin/ai/providers')
  providers.value        = data.providers
  activeExtraction.value = data.active_extraction
  activeAdvisor.value    = data.active_advisor
  extractionChain.value  = data.extraction_chain
  advisorChain.value     = data.advisor_chain
}

async function loadStats() {
  loading.value = true
  try {
    const { data } = await api.get(`/admin/ai/stats?days=${period.value}`)
    stats.value = data
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadProviders(), loadStats()])
})
</script>

<style lang="scss" scoped>
.ai-monitor {
  padding: 28px 32px 80px;
  max-width: 1200px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__super {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--info);
    margin-bottom: 4px;
  }

  &__title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -.02em;
    color: var(--fg-1);
  }

  &__period-sel {
    display: inline-flex;
    background: var(--surface-2);
    border-radius: 999px;
    padding: 3px;
    gap: 2px;
  }

  &__period-btn {
    border: 0;
    cursor: pointer;
    padding: 5px 14px;
    border-radius: 999px;
    background: transparent;
    color: var(--fg-2);
    font-size: 12px;
    font-weight: 600;
    transition: background 120ms, color 120ms;

    &--active {
      background: var(--info);
      color: #fff;
    }
  }

  &__providers {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  &__kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  &__section {
    background: var(--surface-1);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    margin-bottom: 16px;

    &-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--fg-3);
      margin-bottom: 12px;
    }
  }

  &__feature-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-top: 1px solid var(--border-hairline);

    &:first-of-type { border-top: none; }
  }

  &__feature-name {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: var(--fg-1);

    .material-icons { font-size: 16px; color: var(--fg-3); }
  }

  &__feature-calls { font-size: 12px; color: var(--fg-2); }
  &__feature-cost  { font-size: 12px; font-weight: 700; color: var(--fg-1); }

  &__table-wrap {
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;

    th {
      text-align: left;
      padding: 6px 10px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: var(--fg-3);
      border-bottom: 1px solid var(--border-hairline);
    }

    td {
      padding: 8px 10px;
      color: var(--fg-2);
      border-bottom: 1px solid var(--border-hairline);
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--surface-2); }
  }

  &__mono { font-family: var(--font-money); }
  &__cost-cell { font-weight: 700; color: var(--fg-1); }

  &__feat-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--fg-2);

    .material-icons { font-size: 13px; }
  }

  &__provider-chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 700;
    background: var(--surface-2);
    color: var(--fg-2);

    &--opencode-go { background: color-mix(in srgb, #6366f1 15%, var(--surface-1)); color: #6366f1; }
    &--groq        { background: color-mix(in srgb, #f97316 15%, var(--surface-1)); color: #f97316; }
    &--openrouter  { background: color-mix(in srgb, #0ea5e9 15%, var(--surface-1)); color: #0ea5e9; }
    &--gemini      { background: color-mix(in srgb, #22c55e 15%, var(--surface-1)); color: #22c55e; }
    &--xai         { background: color-mix(in srgb, #64748b 15%, var(--surface-1)); color: #64748b; }
    &--openai      { background: color-mix(in srgb, #10b981 15%, var(--surface-1)); color: #10b981; }
    &--anthropic   { background: color-mix(in srgb, #c84b31 15%, var(--surface-1)); color: #c84b31; }
  }

  &__empty {
    text-align: center;
    padding: 48px 20px;
    color: var(--fg-3);

    .material-icons { font-size: 40px; display: block; margin-bottom: 12px; }
    p { font-size: 14px; }
  }
}

.ai-provider-card {
  background: var(--surface-1);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--active { border-color: var(--info); }
  &--missing { opacity: .6; }

  &__head {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &--ok  { background: #22c55e; }
    &--off { background: var(--fg-3); }
  }

  &__name {
    font-size: 13px;
    font-weight: 700;
    color: var(--fg-1);
    flex: 1;
  }

  &__badge {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    background: var(--info);
    color: #fff;
    padding: 2px 6px;
    border-radius: 999px;
  }

  &__model {
    font-size: 10.5px;
    color: var(--fg-3);
    font-family: var(--font-money);
  }

  &__stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
  }

  &__calls { font-size: 11.5px; color: var(--fg-2); }
  &__cost  { font-size: 11.5px; font-weight: 700; color: var(--fg-1); }

  &__nodata {
    font-size: 11px;
    color: var(--fg-3);
    margin-top: 4px;
  }

  &__chain {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: var(--fg-3);
    margin-top: 2px;
  }
}

.ai-kpi {
  background: var(--surface-1);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;

  &__val {
    font-family: var(--font-money);
    font-size: 22px;
    font-weight: 700;
    color: var(--fg-1);

    &--cost { color: var(--info); }
  }

  &__lbl {
    font-size: 11px;
    color: var(--fg-3);
    font-weight: 600;
    letter-spacing: .04em;
  }
}
</style>
