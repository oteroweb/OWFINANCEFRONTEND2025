<template>
  <q-dialog :model-value="modelValue" @update:model-value="onToggle">
    <q-card class="cbm">
      <!-- Cabecera teñida con el color asignado (D-009) -->
      <div class="cbm__head" :style="{ background: tint }">
        <span class="cbm__head-mark">
          <template v-if="name.trim()">{{ name.trim().charAt(0).toUpperCase() }}</template>
          <q-icon v-else name="store" size="18px" />
        </span>
        <div class="cbm__head-text">
          <div class="cbm__head-title">{{ name.trim() || 'Nueva empresa' }}</div>
          <div class="cbm__head-sub">Su propia contabilidad, aparte de la tuya</div>
        </div>
        <q-btn flat dense round icon="close" color="white" aria-label="Cerrar" @click="close" />
      </div>

      <div class="cbm__body">
        <div class="cbm__field">
          <span class="cbm__label">Nombre de la empresa</span>
          <q-input v-model="name" outlined dense autofocus maxlength="100" placeholder="Ej: Distribuidora Otero" />
        </div>

        <div class="cbm__field">
          <span class="cbm__label">RIF o identificación fiscal <em>opcional</em></span>
          <q-input v-model="taxId" outlined dense maxlength="40" placeholder="J-00000000-0" />
          <span class="cbm__hint">Podés dejarlo vacío y agregarlo después, cuando la empresa esté registrada.</span>
        </div>

        <div class="cbm__field">
          <span class="cbm__label">Moneda de la empresa</span>
          <q-select
            v-model="currencyId"
            :options="currencyOptions"
            option-value="id"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
            :loading="loadingCurrencies"
          />
          <span class="cbm__hint">Es la de esta contabilidad; no cambia la de tus cuentas personales.</span>
        </div>

        <div class="cbm__field">
          <span class="cbm__label">Cómo querés verla</span>
          <div class="cbm__modes">
            <button
              v-for="m in MODES"
              :key="m.id"
              type="button"
              class="cbm__mode"
              :class="{ 'cbm__mode--on': mode === m.id }"
              :style="mode === m.id ? { borderColor: tint } : undefined"
              @click="mode = m.id"
            >
              <span class="cbm__mode-label">{{ m.label }}</span>
              <span class="cbm__hint">{{ m.desc }}</span>
            </button>
          </div>
          <span class="cbm__hint">
            Cada contabilidad guarda su propia vista. Podés tener tu cuenta personal en Lite y esta empresa en Pro.
          </span>
        </div>

        <div class="cbm__color-row">
          <span class="cbm__swatch" :style="{ background: tint }" />
          <span class="cbm__hint cbm__color-text">Con este color vas a reconocer la empresa en la barra de arriba.</span>
          <button type="button" class="cbm__link" :style="{ color: tint }" @click="pickColor = !pickColor">
            {{ pickColor ? 'Listo' : 'Cambiar' }}
          </button>
        </div>
        <div v-if="pickColor" class="cbm__palette">
          <button
            v-for="c in BUSINESS_PALETTE"
            :key="c.id"
            type="button"
            class="cbm__palette-dot"
            :class="{ 'cbm__palette-dot--on': tint === c.value, 'cbm__palette-dot--taken': isTaken(c.value) }"
            :style="{ background: c.value }"
            :title="isTaken(c.value) ? `${c.label} — ya en uso` : c.label"
            :aria-label="c.label"
            @click="color = c.value"
          />
        </div>

        <div class="cbm__actions">
          <q-btn
            unelevated
            rounded
            no-caps
            class="cbm__submit"
            :style="{ background: tint, color: '#fff' }"
            label="Crear empresa"
            :disable="!valid"
            :loading="saving"
            @click="submit"
          />
          <q-btn flat rounded no-caps label="Cancelar" @click="close" />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';
import {
  useBusinessStore,
  businessErrorMessage,
  BUSINESS_PALETTE,
  type Business,
  type BusinessMode,
} from 'stores/business';

defineOptions({ name: 'CreateBusinessModal' });

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  created: [business: Business];
}>();

const $q = useQuasar();
const auth = useAuthStore();
const store = useBusinessStore();

const MODES: Array<{ id: BusinessMode; label: string; desc: string }> = [
  { id: 'lite', label: 'Lite', desc: 'Una vista simple: saldo, cántaros y movimientos.' },
  { id: 'pro', label: 'Pro', desc: 'Paneles, reportes y categorías en árbol.' },
];

interface CurrencyOption {
  id: number;
  label: string;
}

const name = ref('');
const taxId = ref('');
const currencyId = ref<number | null>(auth.user?.currency_id ?? null);
const mode = ref<BusinessMode>('lite');
const color = ref<string | null>(null);
const pickColor = ref(false);
const saving = ref(false);
const loadingCurrencies = ref(false);
const currencyOptions = ref<CurrencyOption[]>([]);

const usedColors = computed(() => store.businesses.map((b) => b.color));
const autoColor = computed(
  () => (BUSINESS_PALETTE.find((c) => !usedColors.value.includes(c.value)) ?? BUSINESS_PALETTE[0])!.value,
);
const tint = computed(() => color.value ?? autoColor.value);
const valid = computed(() => name.value.trim().length > 1);

function isTaken(value: string) {
  return usedColors.value.includes(value) && value !== tint.value;
}

async function loadCurrencies() {
  if (currencyOptions.value.length) return;
  loadingCurrencies.value = true;
  try {
    const res = await api.get('/currencies', { params: { order_by: 'name', order_dir: 'asc' } });
    const raw = (res.data?.data || res.data) as Array<{ id: number; name: string; code?: string; symbol?: string }>;
    currencyOptions.value = (Array.isArray(raw) ? raw : []).map((c) => ({
      id: c.id,
      label: c.code ? `${c.code} — ${c.name}` : c.name,
    }));
  } catch {
    $q.notify({ type: 'warning', message: 'No se pudieron cargar las monedas; se usará la tuya.' });
  } finally {
    loadingCurrencies.value = false;
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) void loadCurrencies();
  },
  { immediate: true },
);

function reset() {
  name.value = '';
  taxId.value = '';
  currencyId.value = auth.user?.currency_id ?? null;
  mode.value = 'lite';
  color.value = null;
  pickColor.value = false;
}

function close() {
  emit('update:modelValue', false);
  reset();
}

function onToggle(v: boolean) {
  if (!v) reset();
  emit('update:modelValue', v);
}

async function submit() {
  if (!valid.value) return;
  saving.value = true;
  try {
    const b = await store.createBusiness({
      name: name.value,
      tax_id: taxId.value,
      currency_id: currencyId.value,
      mode: mode.value,
      color: color.value,
    });
    $q.notify({ type: 'positive', message: 'Empresa creada' });
    emit('created', b);
    close();
  } catch (e: unknown) {
    $q.notify({ type: 'negative', message: businessErrorMessage(e, 'No se pudo crear la empresa') });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.cbm {
  width: min(470px, 100%);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;

  &__head {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  &__head-mark {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.22);
    color: #fff;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 15px;
  }
  &__head-text { flex: 1; min-width: 0; }
  &__head-title {
    font-weight: 700;
    font-size: 16px;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__head-sub { font-size: 11.5px; color: rgba(255, 255, 255, 0.8); margin-top: 1px; }

  &__body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    min-height: 0;
  }
  &__field { display: flex; flex-direction: column; gap: 6px; }
  &__label { font-size: 12px; font-weight: 600; color: var(--fg-2); em { font-weight: 400; font-style: normal; color: var(--fg-3); margin-left: 6px; } }
  &__hint { font-size: 11.5px; line-height: 1.45; color: var(--fg-3); }

  &__modes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }
  &__mode {
    text-align: left;
    cursor: pointer;
    padding: 12px 13px;
    border-radius: var(--radius-md, 12px);
    background: transparent;
    border: 1px solid var(--border-hairline);
    display: flex;
    flex-direction: column;
    gap: 4px;
    &--on { background: var(--surface-2); }
  }
  &__mode-label { font-size: 13.5px; font-weight: 600; color: var(--fg-1); }

  &__color-row {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 12px 13px;
    border-radius: var(--radius-md, 12px);
    background: var(--surface-2);
  }
  &__swatch { width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0; }
  &__color-text { flex: 1; min-width: 0; }
  &__link { border: 0; background: transparent; cursor: pointer; font-size: 12.5px; font-weight: 600; white-space: nowrap; }

  &__palette { display: flex; gap: 8px; flex-wrap: wrap; }
  &__palette-dot {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    cursor: pointer;
    border: 2px solid transparent;
    &--taken { opacity: 0.35; }
    &--on { border-color: var(--fg-1); }
  }

  &__actions { display: flex; gap: 10px; margin-top: 2px; }
  &__submit { flex: 1; font-weight: 700; }
}
</style>
