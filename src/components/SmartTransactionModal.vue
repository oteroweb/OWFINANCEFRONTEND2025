<template>
  <q-dialog v-model="show" @hide="onHide" @show="onShow"
    :maximized="$q.screen.lt.md"
    transition-show="slide-up" transition-hide="slide-down">
    <div class="stm-wrap" :class="{ 'stm-wrap--mobile': $q.screen.lt.md }">

      <!-- Grab handle (mobile) -->
      <div v-if="$q.screen.lt.md" class="stm-handle" />

      <!-- Header -->
      <div class="stm-header">
        <div>
          <div class="stm-eyebrow">Nuevo movimiento</div>
          <div class="stm-title">{{ tab === 'write' ? '¿Qué pasó con tu dinero?' : tabConfig[tab].title }}</div>
        </div>
        <button class="stm-close" @click="show = false" aria-label="Cerrar">
          <q-icon name="close" size="22px" />
        </button>
      </div>

      <!-- Method tabs -->
      <div class="stm-tabs">
        <button v-for="m in methods" :key="m.id"
          class="stm-tab" :class="{ 'stm-tab--active': tab === m.id }"
          @click="tab = m.id; aiPrefill = null; aiSource = null">
          <q-icon :name="m.icon" size="16px" />
          {{ m.label }}
        </button>
      </div>

      <!-- AI prefill banner -->
      <div v-if="tab === 'write' && aiSource" class="stm-ai-banner">
        <q-icon name="auto_awesome" size="18px" color="purple" />
        <span>Pre-rellenado desde <strong>{{ aiSource }}</strong> · revisa y confirma</span>
        <button class="stm-ai-banner__clear" @click="aiPrefill = null; aiSource = null">
          <q-icon name="close" size="15px" />
        </button>
      </div>

      <!-- ── ESCRIBIR tab: inline form ── -->
      <div v-if="tab === 'write'" class="stm-body">

        <!-- Type selector -->
        <div class="stm-type-row">
          <button v-for="t in types" :key="t.id"
            class="stm-type-btn" :class="[`stm-type-btn--${t.id}`, { 'stm-type-btn--active': form.type === t.id }]"
            @click="form.type = t.id">
            <q-icon :name="t.icon" size="18px" />
            {{ t.label }}
          </button>
        </div>

        <!-- Amount -->
        <div class="stm-field">
          <label class="stm-label">Monto</label>
          <div class="stm-amount-row">
            <q-select v-model="form.currency" :options="currencyOptions" emit-value map-options dense outlined
              class="stm-currency-select" />
            <input v-model.number="form.amount" type="number" step="0.01" min="0"
              placeholder="0.00" class="stm-amount-input" />
          </div>
        </div>

        <!-- Concept -->
        <div class="stm-field">
          <label class="stm-label">Concepto</label>
          <input v-model="form.name" type="text" placeholder="Ej: Mercado, Transporte, Nómina…"
            class="stm-text-input" />
        </div>

        <!-- Account + Category row -->
        <div class="stm-row-2">
          <div class="stm-field">
            <label class="stm-label">Cuenta</label>
            <q-select v-model="form.account_id" :options="accountOptions" emit-value map-options dense outlined
              placeholder="Seleccionar…" />
          </div>
          <div class="stm-field">
            <label class="stm-label">Categoría <span class="stm-label--opt">(opcional)</span></label>
            <CategorySelector v-model="form.category_id" allow-null placeholder="Sin categoría" />
            <AnchoredJarChip :category-id="form.category_id" class="stm-jar-chip" />
          </div>
        </div>

        <!-- Date -->
        <div class="stm-field">
          <label class="stm-label">Fecha y hora</label>
          <input v-model="form.date" type="datetime-local" class="stm-text-input" />
        </div>

        <!-- Proveedor -->
        <div class="stm-field">
          <label class="stm-label">Proveedor / Comercio <span class="stm-label--opt">(opcional)</span></label>
          <q-select
            v-model="form.provider_id"
            :options="providerOptions"
            emit-value map-options
            use-input
            clearable
            dense outlined
            placeholder="Buscar proveedor…"
            option-value="id"
            option-label="name"
            @filter="filterProviders"
          >
            <template v-slot:prepend><q-icon name="storefront" /></template>
          </q-select>
        </div>

        <!-- Etiquetas -->
        <div class="stm-field">
          <label class="stm-label">Etiquetas <span class="stm-label--opt">(opcional)</span></label>
          <div class="stm-tags-row">
            <button
              v-for="tag in visibleTags"
              :key="tag.id"
              type="button"
              class="stm-tag-chip"
              :class="{ 'stm-tag-chip--active': form.tags.includes(tag.id) }"
              :style="form.tags.includes(tag.id)
                ? { background: `color-mix(in srgb, ${tag.color} 18%, transparent)`, borderColor: tag.color, color: tag.color }
                : {}"
              @click="toggleTag(tag.id)"
            >
              <span class="material-icons" style="font-size:14px">{{ tag.icon }}</span>
              {{ tag.name }}
            </button>
            <button
              v-if="!showNewTagForm"
              type="button"
              class="stm-tag-chip stm-tag-chip--add"
              @click="showNewTagForm = true"
            >
              <span class="material-icons" style="font-size:14px">add</span>
              Nueva etiqueta
            </button>
            <div v-if="showNewTagForm" class="stm-new-tag-form">
              <input v-model="newTagName" class="stm-text-input stm-text-input--flex" placeholder="Nombre de etiqueta" @keydown.enter.prevent="createTag" />
              <button type="button" class="stm-btn stm-btn--primary stm-btn--xs" :disabled="!newTagName.trim()" @click="createTag">
                <q-icon name="check" size="14px" />
              </button>
              <button type="button" class="stm-btn stm-btn--ghost stm-btn--xs" @click="showNewTagForm = false; newTagName = ''">
                <q-icon name="close" size="14px" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pro features (solo layout_mode=pro) -->
        <template v-if="isProMode">
          <!-- Toggle row -->
          <div class="stm-pro-toggles">
            <button class="stm-pro-toggle" :class="{ 'stm-pro-toggle--on': proPanel === 'comision' }" @click="toggleProPanel('comision')">
              <span class="material-icons" style="font-size:16px">percent</span> Comisión
            </button>
            <button class="stm-pro-toggle" :class="{ 'stm-pro-toggle--on': proPanel === 'split' }" @click="toggleProPanel('split')">
              <span class="material-icons" style="font-size:16px">call_split</span> Split
            </button>
            <button class="stm-pro-toggle" :class="{ 'stm-pro-toggle--on': proPanel === 'items' }" @click="toggleProPanel('items')">
              <span class="material-icons" style="font-size:16px">receipt_long</span> Artículos
            </button>
          </div>

          <!-- Comisión panel -->
          <div v-if="proPanel === 'comision'" class="stm-pro-panel">
            <div class="stm-row-2">
              <div class="stm-field">
                <label class="stm-label">Tipo</label>
                <q-select v-model="comision.tipo" :options="comisionTipos" emit-value map-options dense outlined />
              </div>
              <div class="stm-field">
                <label class="stm-label">{{ comision.tipo === 'porcentaje' ? 'Porcentaje %' : 'Monto fijo' }}</label>
                <input v-model.number="comision.valor" type="number" class="stm-text-input" min="0" />
              </div>
            </div>
            <div v-if="comisionCalculada > 0" class="stm-pro-summary">
              Comisión: <strong>{{ formatMoney(comisionCalculada) }}</strong>
              — Total: <strong>{{ formatMoney((form.amount ?? 0) + comisionCalculada) }}</strong>
            </div>
          </div>

          <!-- Split panel -->
          <div v-if="proPanel === 'split'" class="stm-pro-panel">
            <div v-for="(pago, i) in splitPagos" :key="i" class="stm-row-2 stm-split-row">
              <div class="stm-field">
                <label class="stm-label">Cuenta {{ i + 1 }}</label>
                <q-select v-model="pago.account_id" :options="accountOptions" emit-value map-options dense outlined clearable placeholder="Seleccionar…" />
              </div>
              <div class="stm-field">
                <label class="stm-label">Monto</label>
                <input v-model.number="pago.amount" type="number" class="stm-text-input" min="0" />
              </div>
              <button v-if="splitPagos.length > 2" class="stm-pro-rm" @click="splitPagos.splice(i, 1)">
                <span class="material-icons" style="font-size:16px">close</span>
              </button>
            </div>
            <div class="stm-pro-summary">
              Suma: <strong>{{ formatMoney(splitTotal) }}</strong>
              <span :style="{ color: Math.abs(splitTotal - (form.amount ?? 0)) < 0.01 ? '#10b981' : '#ef4444' }">
                / {{ formatMoney(form.amount ?? 0) }}
              </span>
            </div>
            <button class="stm-pro-add" @click="splitPagos.push({ account_id: null, amount: 0 })">
              <span class="material-icons" style="font-size:15px">add</span> Agregar cuenta
            </button>
          </div>

          <!-- Items/factura panel -->
          <div v-if="proPanel === 'items'" class="stm-pro-panel">
            <div v-for="(item, i) in facturaItems" :key="i" class="stm-items-row">
              <input v-model="item.name" class="stm-text-input stm-text-input--flex" placeholder="Artículo" />
              <input v-model.number="item.quantity" type="number" class="stm-text-input stm-text-input--qty" min="1" placeholder="Qty" />
              <input v-model.number="item.price" type="number" class="stm-text-input stm-text-input--price" min="0" placeholder="Precio" />
              <button class="stm-pro-rm" @click="facturaItems.splice(i, 1)">
                <span class="material-icons" style="font-size:16px">close</span>
              </button>
            </div>
            <div class="stm-pro-summary">
              Total artículos: <strong>{{ formatMoney(itemsTotal) }}</strong>
            </div>
            <button class="stm-pro-add" @click="facturaItems.push({ name: '', quantity: 1, price: 0 })">
              <span class="material-icons" style="font-size:15px">add</span> Agregar artículo
            </button>
          </div>
        </template>

        <!-- Error -->
        <div v-if="saveError" class="stm-error">{{ saveError }}</div>

        <!-- Actions -->
        <div class="stm-footer">
          <button class="stm-btn stm-btn--ghost" @click="show = false">Cancelar</button>
          <button class="stm-btn stm-btn--primary" :disabled="saving || !canSave" @click="save">
            <q-spinner v-if="saving" size="16px" color="white" />
            <q-icon v-else name="check" size="18px" />
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </div>

      <!-- ── VOZ tab ── -->
      <div v-else-if="tab === 'voice'" class="stm-body stm-body--centered">
        <div v-if="!voiceResult" class="stm-voice-area">
          <div v-if="voiceRecording" class="stm-voice-pulse" @click="stopVoice">
            <q-icon name="mic" size="38px" color="negative" />
          </div>
          <button v-else class="stm-voice-btn" @click="startVoice">
            <q-icon name="mic" size="38px" color="white" />
          </button>
          <span class="stm-voice-label">{{ voiceRecording ? 'Escuchando… (toca para parar)' : 'Toca para dictar' }}</span>
          <span class="stm-voice-sub">Ej: "Gasté 45 dólares en Whole Foods con BofA"</span>
          <div v-if="voiceTranscript" class="stm-voice-transcript">"{{ voiceTranscript }}"</div>
          <div v-if="voiceLoading" class="stm-voice-analyzing">
            <q-spinner size="20px" color="primary" /> Analizando…
          </div>
          <div v-if="voiceError" class="stm-error">{{ voiceError }}</div>
        </div>
        <div v-else class="stm-ai-result">
          <q-icon name="check_circle" size="40px" color="positive" />
          <div class="stm-ai-result__amount">{{ voiceResult.data.currency }} {{ voiceResult.data.amount?.toFixed(2) }}</div>
          <div class="stm-ai-result__desc">{{ voiceResult.data.description }}</div>
          <div class="stm-ai-result__conf">Confianza: {{ Math.round((voiceResult.data.confidence ?? 0) * 100) }}%</div>
          <div class="stm-footer">
            <button class="stm-btn stm-btn--ghost" @click="voiceResult = null; voiceTranscript = ''">Reintentar</button>
            <button class="stm-btn stm-btn--primary" @click="applyAiResult(voiceResult, 'voz')">
              <q-icon name="edit_note" size="18px" /> Editar y guardar
            </button>
          </div>
        </div>
      </div>

      <!-- ── FOTO tab ── -->
      <div v-else-if="tab === 'photo'" class="stm-body stm-body--centered">
        <div v-if="!ocrResult">
          <label class="stm-photo-drop" :class="{ 'stm-photo-drop--hover': photoDragOver }"
            @dragover.prevent="photoDragOver = true" @dragleave="photoDragOver = false"
            @drop.prevent="onPhotoDrop">
            <input type="file" accept="image/*,application/pdf" class="stm-file-input" @change="onPhotoSelect" />
            <q-icon name="receipt_long" size="48px" class="stm-photo-icon" />
            <span class="stm-photo-label">Sube o arrastra un comprobante</span>
            <span class="stm-photo-sub">La IA extrae monto, comercio y fecha</span>
            <div class="stm-photo-tags">
              <span v-for="tag in ['Monto', 'Comercio', 'IVA', 'Fecha']" :key="tag" class="stm-photo-tag">{{ tag }}</span>
            </div>
          </label>
          <div v-if="ocrLoading" class="stm-voice-analyzing" style="margin-top:12px">
            <q-spinner size="20px" color="primary" /> Procesando imagen…
          </div>
          <div v-if="ocrError" class="stm-error" style="margin-top:8px">{{ ocrError }}</div>
        </div>
        <div v-else class="stm-ai-result">
          <q-icon name="check_circle" size="40px" color="positive" />
          <div class="stm-ai-result__amount">{{ ocrResult.data.currency }} {{ ocrResult.data.amount?.toFixed(2) }}</div>
          <div class="stm-ai-result__desc">{{ ocrResult.data.description }}</div>
          <div class="stm-footer">
            <button class="stm-btn stm-btn--ghost" @click="ocrResult = null">Otra foto</button>
            <button class="stm-btn stm-btn--primary" @click="applyAiResult(ocrResult, 'foto de factura')">
              <q-icon name="edit_note" size="18px" /> Editar y guardar
            </button>
          </div>
        </div>
      </div>

      <!-- ── AUTO IA tab ── -->
      <div v-else-if="tab === 'autoai'" class="stm-body">
        <textarea v-model="aiText" rows="4" class="stm-textarea"
          placeholder="Describe o pega texto: 'Pagué $730 en VES a 40.5, mercado del mes con Mercantil, categoría supermercado'" />
        <div v-if="aiError" class="stm-error">{{ aiError }}</div>
        <div v-if="aiTextResult" class="stm-ai-result">
          <q-icon name="auto_awesome" size="32px" color="purple" />
          <div class="stm-ai-result__amount">{{ aiTextResult.data.currency }} {{ aiTextResult.data.amount?.toFixed(2) }}</div>
          <div class="stm-ai-result__desc">{{ aiTextResult.data.description }}</div>
        </div>
        <div class="stm-footer">
          <button class="stm-btn stm-btn--ghost" @click="show = false">Cancelar</button>
          <button v-if="aiTextResult" class="stm-btn stm-btn--primary" @click="applyAiResult(aiTextResult, 'texto libre')">
            <q-icon name="edit_note" size="18px" /> Editar y guardar
          </button>
          <button v-else class="stm-btn stm-btn--ai" :disabled="aiLoading || !aiText.trim()" @click="runTextAi">
            <q-spinner v-if="aiLoading" size="16px" color="white" />
            <q-icon v-else name="auto_awesome" size="18px" />
            {{ aiLoading ? 'Analizando…' : 'Analizar con IA' }}
          </button>
        </div>
      </div>

    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUiStore } from 'stores/ui';
import { useAuthStore } from 'stores/auth';
import { api } from 'src/boot/axios';
import { useTransactionTypesStore } from 'stores/transactionTypes';
import { useTagsStore } from 'stores/tags';
import { useVoiceInput } from 'src/composables/useVoiceInput';
import { useAiExtraction, type ExtractionResult } from 'src/composables/useAiExtraction';
import AnchoredJarChip from 'src/components/AnchoredJarChip.vue';
import CategorySelector from 'src/components/CategorySelector.vue';
import { jarForCategory, getCachedJars } from 'src/utils/txCatalog';

defineOptions({ name: 'SmartTransactionModal' });

const emit = defineEmits<{ saved: [] }>();

const $q = useQuasar();
const ui = useUiStore();
const auth = useAuthStore();
const ttypes = useTransactionTypesStore();
const tagsStore = useTagsStore();

const show = computed({
  get: () => ui.showSmartModal,
  set: (v) => { if (!v) ui.closeSmartModal(); },
});

const tab = ref<'write' | 'voice' | 'photo' | 'autoai'>('write');

const methods = [
  { id: 'write'  as const, icon: 'edit_note',    label: 'Escribir' },
  { id: 'voice'  as const, icon: 'mic',           label: 'Voz' },
  { id: 'photo'  as const, icon: 'receipt_long',  label: 'Foto' },
  { id: 'autoai' as const, icon: 'auto_awesome',  label: 'Auto IA' },
];

const tabConfig = {
  voice:  { title: 'Dicta tu movimiento' },
  photo:  { title: 'Sube un comprobante' },
  autoai: { title: 'Describe con texto libre' },
};

const types = [
  { id: 'expense'  as const, label: 'Gasto',      icon: 'arrow_outward'  },
  { id: 'income'   as const, label: 'Ingreso',     icon: 'arrow_downward' },
  { id: 'transfer' as const, label: 'Transferir',  icon: 'swap_horiz'     },
  { id: 'ajuste'   as const, label: 'Ajuste',      icon: 'tune'           },
];

// ── Form state ────────────────────────────────────────────────────────────
const aiPrefill = ref<ExtractionResult | null>(null);
const aiSource  = ref<string | null>(null);

const now = () => {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
};

const form = ref({
  type: 'expense' as 'expense' | 'income' | 'transfer' | 'ajuste',
  amount: null as number | null,
  currency: auth.user?.currency?.code ?? 'USD',
  name: '',
  account_id: null as number | null,
  category_id: null as number | null,
  date: now(),
  provider_id: null as number | null,
  tags: [] as number[],
});

const saving    = ref(false);
const saveError = ref<string | null>(null);

// ── Provider search ──────────────────────────────────────────────────────────
interface Provider { id: number; name: string }
const providerOptions = ref<Provider[]>([])

async function filterProviders(val: string, update: (fn: () => void) => void) {
  if (!val.trim()) {
    update(() => { providerOptions.value = [] })
    return
  }
  try {
    const res = await api.get<Provider[] | { data: Provider[] }>('/providers', { params: { search: val } })
    const raw = res.data
    const list = Array.isArray(raw) ? raw : ((raw as { data: Provider[] }).data ?? [])
    update(() => { providerOptions.value = list })
  } catch {
    update(() => { providerOptions.value = [] })
  }
}

// ── Tags ──────────────────────────────────────────────────────────────────────
const LITE_TAG_SLUGS = ['impulso', 'planificado', 'recurrente']

const isLiteLayout = computed(() =>
  (auth.settings?.layout_mode ?? auth.user?.layout_mode) !== 'pro'
)

const visibleTags = computed(() =>
  isLiteLayout.value
    ? tagsStore.tags.filter(t => LITE_TAG_SLUGS.includes(t.slug))
    : tagsStore.tags
)

function toggleTag(id: number) {
  const idx = form.value.tags.indexOf(id)
  if (idx === -1) form.value.tags.push(id)
  else form.value.tags.splice(idx, 1)
}

const showNewTagForm = ref(false)
const newTagName = ref('')

async function createTag() {
  if (!newTagName.value.trim()) return
  await tagsStore.createTag(newTagName.value.trim())
  newTagName.value = ''
  showNewTagForm.value = false
}

// ── Pro mode features ──────────────────────────────────────────────────────
const isProMode = computed(() =>
  (auth.settings?.layout_mode ?? auth.user?.layout_mode) === 'pro'
);

type ProPanel = 'comision' | 'split' | 'items' | null;
const proPanel = ref<ProPanel>(null);

function toggleProPanel(panel: ProPanel) {
  proPanel.value = proPanel.value === panel ? null : panel;
}

// Comisión
const comisionTipos = [
  { label: 'Monto fijo ($)', value: 'fijo' },
  { label: 'Porcentaje (%)', value: 'porcentaje' },
  { label: 'Pago móvil BCV (0.30%)', value: 'bcv' },
];
const comision = ref({ tipo: 'porcentaje', valor: 0 });
const comisionCalculada = computed(() => {
  const base = Math.abs(form.value.amount ?? 0);
  if (comision.value.tipo === 'fijo')       return comision.value.valor;
  if (comision.value.tipo === 'porcentaje') return (base * comision.value.valor) / 100;
  if (comision.value.tipo === 'bcv')        return (base * 0.30) / 100;
  return 0;
});

// Split
const splitPagos = ref<{ account_id: number | null; amount: number }[]>([
  { account_id: null, amount: 0 },
  { account_id: null, amount: 0 },
]);
const splitTotal = computed(() => splitPagos.value.reduce((s, p) => s + (p.amount ?? 0), 0));

// Items / factura
const facturaItems = ref<{ name: string; quantity: number; price: number }[]>([
  { name: '', quantity: 1, price: 0 },
]);
const itemsTotal = computed(() =>
  facturaItems.value.reduce((s, it) => s + (it.quantity ?? 0) * (it.price ?? 0), 0)
);

function formatMoney(n: number) {
  return `$ ${Math.abs(n).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Currency options from user accounts ──────────────────────────────────
const currencyOptions = computed(() => {
  const codes = new Set<string>();
  codes.add(auth.user?.currency?.code ?? 'USD');
  (auth.user?.accounts ?? []).forEach((a: { currency?: { code?: string } }) => {
    if (a.currency?.code) codes.add(a.currency.code);
  });
  return [...codes].map(c => ({ label: c, value: c }));
});

// ── Account options ───────────────────────────────────────────────────────
interface UserAccount { id: number; name: string; currency?: { code?: string } }
const accountOptions = computed(() =>
  ((auth.user?.accounts ?? []) as unknown as UserAccount[]).map((a) => ({
    label: `${a.name}${a.currency?.code ? ` (${a.currency.code})` : ''}`,
    value: a.id,
  }))
);

// ── Categories ────────────────────────────────────────────────────────────
interface Category { id: number; name: string }
const categories       = ref<Category[]>([]);
const loadingCategories = ref(false);

async function loadCategories() {
  if (categories.value.length) return;
  loadingCategories.value = true;
  try {
    const res = await api.get<{ data: Category[] }>('/categories');
    categories.value = res.data?.data ?? (res.data as unknown as Category[]) ?? [];
  } catch { /* silent */ }
  finally { loadingCategories.value = false; }
}

// ── Transaction type id mapping ───────────────────────────────────────────
const typeIdFor = computed(() => {
  const map: Record<string, string | null> = { expense: null, income: null, transfer: null, ajuste: null };
  for (const t of ttypes.types) {
    const s = (t.slug ?? '').toLowerCase();
    if (s.includes('gasto') || s.includes('expense')) map.expense = t.id;
    else if (s.includes('ingreso') || s.includes('income')) map.income = t.id;
    else if (s.includes('transfer')) map.transfer = t.id;
    else if (s.includes('ajuste') || s.includes('adjust')) map.ajuste = t.id;
  }
  return map;
});

const canSave = computed(() =>
  !!form.value.name.trim() && !!form.value.amount && form.value.amount > 0 && !!form.value.account_id
);

async function save() {
  if (!canSave.value || saving.value) return;
  saving.value = true;
  saveError.value = null;

  const typeId = typeIdFor.value[form.value.type] ?? null;
  const rawAmt = form.value.amount ?? 0;
  const amount = form.value.type === 'expense'
    ? -Math.abs(rawAmt)
    : form.value.type === 'ajuste'
      ? rawAmt  // ajuste: puede ser positivo o negativo
      : Math.abs(rawAmt);

  const derivedJar = jarForCategory(form.value.category_id ?? null, getCachedJars());

  // Pro: determinar payments (split o pago simple)
  let payments: { account_id: number | null; amount: number }[];
  if (isProMode.value && proPanel.value === 'split' && splitPagos.value.some(p => p.account_id)) {
    payments = splitPagos.value
      .filter(p => p.account_id && p.amount)
      .map(p => ({ account_id: p.account_id, amount: p.amount }));
  } else {
    payments = [{ account_id: form.value.account_id, amount }];
  }

  // Pro: items de factura
  const items = (isProMode.value && proPanel.value === 'items')
    ? facturaItems.value.filter(it => it.name && it.price > 0).map(it => ({
        name: it.name,
        quantity: it.quantity,
        amount: it.quantity * it.price,
      }))
    : undefined;

  // Pro: monto final con comisión
  const finalAmount = (isProMode.value && proPanel.value === 'comision' && comisionCalculada.value > 0)
    ? (form.value.amount ?? 0) + comisionCalculada.value
    : form.value.amount;

  const payload: Record<string, unknown> = {
    name: form.value.name.trim(),
    date: form.value.date.replace('T', ' ') + ':00',
    amount: finalAmount,
    transaction_type_id: typeId,
    category_id: form.value.category_id ?? null,
    jar_id: derivedJar?.id ?? null,
    provider_id: form.value.provider_id ?? null,
    tags: form.value.tags,
    payments,
  };

  if (items?.length) payload['items'] = items;

  try {
    await api.post('/transactions', payload);
    $q.notify({ type: 'positive', message: 'Movimiento guardado' });
    emit('saved');
    ui.closeSmartModal();
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    saveError.value = e?.response?.data?.message ?? 'Error al guardar. Intenta de nuevo.';
  } finally {
    saving.value = false;
  }
}

// ── Voice ─────────────────────────────────────────────────────────────────
const { transcript: voiceTranscript, isRecording: voiceRecording, error: voiceInputError, start: startVoiceRec, stop: stopVoiceRec } = useVoiceInput();
const { loading: voiceLoading, error: voiceAiError, extractFromText } = useAiExtraction();
const voiceResult = ref<ExtractionResult | null>(null);
const voiceError  = computed(() => voiceInputError.value ?? voiceAiError.value);

function startVoice() {
  voiceResult.value = null;
  navigator.vibrate?.(50);
  startVoiceRec();
}

async function stopVoice() {
  navigator.vibrate?.(50);
  stopVoiceRec();
  await new Promise(r => setTimeout(r, 300));
  if (voiceTranscript.value) {
    voiceResult.value = await extractFromText('voice', voiceTranscript.value);
  }
}

// ── OCR / Photo ───────────────────────────────────────────────────────────
const { loading: ocrLoading, error: ocrError, extractFromText: extractFromImage } = useAiExtraction();
const ocrResult    = ref<ExtractionResult | null>(null);
const photoDragOver = ref(false);

function processPhoto(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = (e.target?.result as string)?.split(',')[1] ?? '';
    void extractFromImage('ocr', file.name, base64).then(r => { ocrResult.value = r; });
  };
  reader.readAsDataURL(file);
}

function onPhotoSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) void processPhoto(file);
}

function onPhotoDrop(e: DragEvent) {
  photoDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) void processPhoto(file);
}

// ── Auto IA text ──────────────────────────────────────────────────────────
const { loading: aiLoading, error: aiError, extractFromText: extractText } = useAiExtraction();
const aiText       = ref('');
const aiTextResult = ref<ExtractionResult | null>(null);

async function runTextAi() {
  aiTextResult.value = null;
  aiTextResult.value = await extractText('auto', aiText.value);
}

// ── Apply AI result to form ───────────────────────────────────────────────
function applyAiResult(result: ExtractionResult, source: string) {
  aiPrefill.value = result;
  aiSource.value  = source;

  const d = result.data;
  if (d.type) {
    const map: Record<string, 'expense' | 'income' | 'transfer'> = { expense: 'expense', income: 'income', transfer: 'transfer' };
    form.value.type = map[d.type] ?? 'expense';
  }
  if (d.amount) form.value.amount = d.amount;
  if (d.currency) form.value.currency = d.currency;
  if (d.description) form.value.name = d.description;
  if (d.date) form.value.date = d.date.slice(0, 16);

  // OWF-129 — Resolver sugerencia de categoría al ID real del usuario
  if (d.category_suggestion && categories.value.length) {
    const suggestion = d.category_suggestion.toLowerCase().trim();
    const match = categories.value.find(c => {
      const name = c.name.toLowerCase();
      return name === suggestion || name.includes(suggestion) || suggestion.includes(name);
    });
    if (match) form.value.category_id = match.id;
  }

  tab.value = 'write';
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
function onShow() {
  tab.value = ui.smartModalTab;
  form.value.type = ui.smartModalType;
  form.value.date = now();
  form.value.amount = null;
  form.value.name = '';
  form.value.category_id = null;
  form.value.provider_id = null;
  form.value.tags = [];
  showNewTagForm.value = false;
  newTagName.value = '';
  aiPrefill.value = null;
  aiSource.value  = null;
  voiceResult.value = null;
  ocrResult.value   = null;
  aiTextResult.value = null;
  aiText.value = '';
  saveError.value = null;

  if (!form.value.account_id && accountOptions.value.length) {
    form.value.account_id = accountOptions.value[0]!.value;
  }

  void ttypes.fetchTransactionTypes();
  void loadCategories();
  void tagsStore.fetchTags();
}

function onHide() {
  if (voiceRecording.value) stopVoiceRec();
}

watch(() => ui.showSmartModal, (v) => { if (!v) onHide(); });
</script>

<style scoped lang="scss">
.stm-wrap {
  background: var(--surface-1, #fff);
  border-radius: var(--radius-xl, 20px);
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;

  &--mobile {
    border-radius: 22px 22px 0 0;
    max-width: none;
    height: auto;
    max-height: 92vh;
    overflow-y: auto;
  }
}

.stm-handle {
  width: 40px; height: 4px;
  border-radius: 999px;
  background: var(--surface-3, #e2e8f0);
  margin: 12px auto 0;
  flex-shrink: 0;
}

.stm-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 22px 12px;
}

.stm-eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--fg-3, #94a3b8);
  margin-bottom: 3px;
}

.stm-title {
  font-family: var(--font-display, 'DM Sans', sans-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--fg-1, #0f172a);
}

.stm-close {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--fg-3, #94a3b8);
  display: flex;
  padding: 4px;
  border-radius: 8px;
  &:hover { background: var(--surface-2, #f1f4f6); }
}

// ── Tabs ──
.stm-tabs {
  display: flex;
  gap: 5px;
  padding: 0 22px 14px;
  flex-wrap: wrap;
}

.stm-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: var(--surface-2, #f1f4f6);
  color: var(--fg-2, #64748b);
  transition: all 140ms ease;

  &--active {
    background: var(--brand-primary, #2d4da6);
    color: #fff;
    font-weight: 700;
  }
}

// ── AI prefill banner ──
.stm-ai-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 22px 10px;
  padding: 10px 13px;
  border-radius: var(--radius-sm, 8px);
  background: linear-gradient(90deg, rgba(124,58,237,.08), rgba(14,165,233,.08));
  font-size: 12.5px;
  color: var(--fg-1, #0f172a);

  &__clear {
    border: none; background: transparent; cursor: pointer;
    color: var(--fg-3); display: flex; margin-left: auto;
  }
}

// ── Body ──
.stm-body {
  padding: 0 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &--centered {
    align-items: center;
    text-align: center;
    padding-top: 8px;
  }
}

// ── Type row ──
.stm-type-row {
  display: flex;
  gap: 6px;
  background: var(--surface-2, #f1f4f6);
  border-radius: 999px;
  padding: 4px;
}

.stm-type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  border-radius: 999px;
  padding: 9px 8px;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--fg-2, #64748b);
  transition: all 150ms ease;

  &--active { background: var(--surface-1, #fff); box-shadow: 0 1px 4px rgba(0,0,0,.1); }

  &--expense.stm-type-btn--active  { color: #ef4444; }
  &--income.stm-type-btn--active   { color: #10b981; }
  &--transfer.stm-type-btn--active { color: #8b5cf6; }
  &--ajuste.stm-type-btn--active   { color: #f59e0b; }
}

// ── Fields ──
.stm-label {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
  margin-bottom: 5px;
  &--opt { font-weight: 400; color: var(--fg-3, #94a3b8); }
}

.stm-amount-row {
  display: flex;
  gap: 6px;
  align-items: stretch;
}

.stm-currency-select { width: 90px; flex-shrink: 0; }

.stm-amount-input, .stm-text-input {
  flex: 1;
  width: 100%;
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-sm, 8px);
  padding: 10px 14px;
  font-family: var(--font-body, sans-serif);
  font-size: 15px;
  color: var(--fg-1, #0f172a);
  background: var(--surface-2, #f8fafc);
  outline: none;
  transition: border-color 140ms;
  box-sizing: border-box;

  &:focus { border-color: var(--brand-primary, #2d4da6); background: var(--surface-1, #fff); }
  &::placeholder { color: var(--fg-3, #94a3b8); }
}

.stm-amount-input { font-size: 32px; font-weight: 700; line-height: 1.1; }

.stm-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stm-textarea {
  width: 100%;
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-sm, 8px);
  padding: 12px 14px;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  color: var(--fg-1, #0f172a);
  background: var(--surface-2, #f8fafc);
  resize: none;
  outline: none;
  line-height: 1.55;
  box-sizing: border-box;
  &:focus { border-color: var(--brand-primary); background: var(--surface-1, #fff); }
  &::placeholder { color: var(--fg-3, #94a3b8); }
}

// ── Error ──
.stm-error {
  padding: 10px 13px;
  border-radius: var(--radius-sm, 8px);
  background: rgba(239,68,68,.1);
  color: #b91c1c;
  font-size: 13px;
}

// ── Footer buttons ──
.stm-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.stm-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 20px;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 140ms ease;

  &--ghost {
    background: var(--surface-2, #f1f4f6);
    color: var(--fg-2, #64748b);
    &:hover { background: var(--surface-3, #e2e8f0); }
  }

  &--primary {
    background: var(--brand-primary, #2d4da6);
    color: #fff;
    box-shadow: 0 4px 14px rgba(45,77,166,.3);
    &:hover:not(:disabled) { opacity: .9; }
    &:disabled { opacity: .5; cursor: not-allowed; }
  }

  &--ai {
    background: linear-gradient(90deg, #7c3aed, #2563eb);
    color: #fff;
    &:disabled { opacity: .5; cursor: not-allowed; }
  }
}

// ── Voice ──
.stm-voice-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: var(--surface-2, #f8fafc);
  border-radius: var(--radius-lg, 16px);
  width: 100%;
}

.stm-voice-btn {
  width: 72px; height: 72px; border-radius: 36px;
  background: var(--brand-primary, #2d4da6);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 22px rgba(45,77,166,.35);
  transition: transform 140ms;
  &:active { transform: scale(0.94); }
}

.stm-voice-pulse {
  width: 72px; height: 72px; border-radius: 36px;
  background: rgba(239,68,68,.12);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  animation: stmPulse 1s ease-in-out infinite;
}

@keyframes stmPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.stm-voice-label { font-size: 14px; font-weight: 600; color: var(--fg-1); }
.stm-voice-sub   { font-size: 12px; color: var(--fg-2); text-align: center; }
.stm-voice-transcript {
  font-size: 13px; font-style: italic; color: var(--fg-1);
  background: var(--surface-1, #fff);
  padding: 8px 14px; border-radius: 8px; max-width: 100%;
}
.stm-voice-analyzing {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--fg-2);
}

// ── AI result ──
.stm-ai-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: var(--surface-2, #f8fafc);
  border-radius: var(--radius-lg, 16px);
  width: 100%;
  text-align: center;

  &__amount { font-family: var(--font-money, monospace); font-size: 22px; font-weight: 700; color: var(--fg-1); }
  &__desc   { font-size: 13px; color: var(--fg-2); }
  &__conf   { font-size: 11px; color: var(--fg-3); }
}

// ── Photo drop ──
.stm-photo-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 2px dashed var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-lg, 16px);
  padding: 36px 20px;
  cursor: pointer;
  background: var(--surface-2, #f8fafc);
  transition: border-color 150ms;
  width: 100%;
  box-sizing: border-box;
  &--hover { border-color: var(--brand-primary); }
}

.stm-file-input { display: none; }
.stm-photo-icon { color: var(--fg-3, #94a3b8); }
.stm-photo-label { font-size: 14px; font-weight: 600; color: var(--fg-1); }
.stm-photo-sub   { font-size: 12px; color: var(--fg-2); text-align: center; }
.stm-photo-tags  { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-top: 4px; }
.stm-photo-tag {
  font-size: 11px; font-weight: 600;
  padding: 3px 9px; border-radius: 999px;
  background: var(--surface-1, #fff);
  color: var(--fg-2, #64748b);
  border: 1px solid var(--border-hairline, #e2e8f0);
}

// ── Pro features ────────────────────────────────────────────────────────────
.stm-pro-toggles {
  display: flex;
  gap: 8px;
  padding: 0 4px;
}

.stm-pro-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1.5px solid var(--border-hairline, #e2e8f0);
  background: var(--surface-2, #f8fafc);
  font-size: 12px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
  cursor: pointer;
  transition: all 120ms;

  &--on {
    background: var(--brand-primary, #2d4da6);
    border-color: var(--brand-primary, #2d4da6);
    color: #fff;
  }
}

.stm-pro-panel {
  padding: 12px;
  background: var(--surface-2, #f8fafc);
  border-radius: 10px;
  border: 1px solid var(--border-hairline, #e2e8f0);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stm-pro-summary {
  font-size: 12.5px;
  color: var(--fg-2, #64748b);
  padding: 6px 8px;
  background: var(--surface-1, #fff);
  border-radius: 6px;
  border: 1px solid var(--border-hairline, #e2e8f0);
}

.stm-pro-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-primary, #2d4da6);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
}

.stm-pro-rm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(239,68,68,.25);
  color: #ef4444;
  background: rgba(239,68,68,.06);
  cursor: pointer;
  flex-shrink: 0;
  align-self: flex-end;
  margin-bottom: 2px;
}

.stm-split-row {
  align-items: flex-end;
  gap: 6px !important;
}

.stm-items-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.stm-text-input--flex  { flex: 1; min-width: 0; }
.stm-text-input--qty   { width: 56px; flex-shrink: 0; }
.stm-text-input--price { width: 80px; flex-shrink: 0; }

.stm-jar-chip { margin-top: 8px; }

// ── Tags ────────────────────────────────────────────────────────────────────
.stm-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.stm-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid var(--border-hairline, #e2e8f0);
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
  cursor: pointer;
  transition: all 120ms;

  &--active { font-weight: 700; }
  &--add { color: var(--fg-3, #94a3b8); border-style: dashed; }
  &--add:hover { color: var(--fg-2); border-color: var(--fg-3); }
}

.stm-new-tag-form {
  display: flex;
  gap: 4px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.stm-btn--xs {
  padding: 4px 8px;
  font-size: 12px;
  min-height: unset;
}
</style>
