<template>
  <transition name="dqm-fade">
    <div v-if="modelValue" class="dqm-scrim" @click="onClose">
      <div class="dqm-card" role="dialog" aria-label="Agregar movimiento" @click.stop>
        <!-- Header -->
        <div class="dqm-header">
          <div>
            <div class="dqm-eyebrow">Acción rápida</div>
            <div class="dqm-title">¿Qué quieres registrar?</div>
          </div>
          <button class="dqm-close" aria-label="Cerrar" @click="onClose">
            <q-icon name="close" size="20px" />
          </button>
        </div>

        <!-- Step 1: Tipo -->
        <div class="dqm-section">
          <div class="dqm-section__head">
            <span class="dqm-label">Tipo de movimiento</span>
            <span class="dqm-step">Paso 1 de 2</span>
          </div>
          <div class="dqm-segmented">
            <button
              v-for="t in TYPES"
              :key="t.id"
              class="dqm-segmented__btn"
              :class="{ 'dqm-segmented__btn--active': type === t.id }"
              :style="type === t.id ? { color: t.color } : {}"
              @click="type = t.id"
            >
              <q-icon :name="t.icon" size="16px" />
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Step 2: Método -->
        <div class="dqm-section">
          <div class="dqm-section__head">
            <span class="dqm-label">¿Cómo lo querés ingresar?</span>
            <span class="dqm-step">Paso 2 de 2</span>
          </div>
          <div class="dqm-methods">
            <button
              v-for="m in METHODS"
              :key="m.id"
              class="dqm-method"
              :style="{ '--dqm-accent': m.accent, '--dqm-tint': m.tint }"
              @click="choose(m.id)"
            >
              <div class="dqm-method__top">
                <div class="dqm-method__icon">
                  <q-icon :name="m.icon" size="20px" />
                </div>
                <div class="dqm-method__label-row">
                  <span class="dqm-method__label">{{ m.label }}</span>
                  <span v-if="m.badge" class="dqm-badge">{{ m.badge }}</span>
                </div>
              </div>
              <span class="dqm-method__sub">{{ m.sub }}</span>
              <div v-if="m.chips" class="dqm-chips">
                <span v-for="c in m.chips" :key="c" class="dqm-chip">{{ c }}</span>
              </div>
            </button>
          </div>
        </div>

        <div class="dqm-sep" />

        <!-- Movimientos especiales -->
        <div class="dqm-section">
          <div class="dqm-section__head">
            <span class="dqm-label">O registrá un movimiento especial</span>
          </div>
          <div class="dqm-plans">
            <button
              v-for="p in PLANS"
              :key="p.id"
              class="dqm-plan"
              :style="{ '--dqm-accent': p.accent, '--dqm-tint': p.tint }"
              @click="choosePlan(p.id)"
            >
              <div class="dqm-plan__head">
                <div class="dqm-plan__icon">
                  <q-icon :name="p.icon" size="16px" />
                </div>
                <span class="dqm-plan__label">{{ p.label }}</span>
                <span v-if="p.badge" class="dqm-badge dqm-badge--plan">{{ p.badge }}</span>
              </div>
              <span class="dqm-plan__sub">{{ p.sub }}</span>
            </button>
          </div>
        </div>

        <div class="dqm-sep" />

        <!-- CTA Asesor IA -->
        <button class="dqm-ai-btn" @click="openAI">
          <q-icon name="psychology" size="20px" />
          ¿Tenés una duda? Hablá con el Asesor IA
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from 'stores/ui';

type TypeId = 'expense' | 'income' | 'transfer';
type MethodId = 'text' | 'voice' | 'photo' | 'autoai';
type PlanId = 'debt' | 'dream' | 'jar';

interface Props {
  modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), { modelValue: false });
const emit = defineEmits<{
  'update:modelValue': [visible: boolean];
}>();

const router = useRouter();
const ui = useUiStore();

const type = ref<TypeId>('expense');

const TYPES: { id: TypeId; label: string; icon: string; color: string }[] = [
  { id: 'expense', label: 'Gasto', icon: 'arrow_outward', color: 'var(--expense)' },
  { id: 'income', label: 'Ingreso', icon: 'arrow_downward', color: 'var(--income)' },
  { id: 'transfer', label: 'Transferir', icon: 'swap_horiz', color: '#8B5CF6' },
];

const METHODS: { id: MethodId; label: string; sub: string; icon: string; accent: string; tint: string; badge?: string; chips?: string[] }[] = [
  { id: 'text', label: 'Escribir', sub: 'Completá monto, comercio y categoría paso a paso.', icon: 'edit_note', accent: 'var(--brand-primary)', tint: 'var(--brand-primary-soft)' },
  { id: 'voice', label: 'Nota de voz', sub: 'Dictá la transacción — la IA la transcribe y categoriza.', icon: 'mic', accent: '#0EA5E9', tint: 'rgba(14,165,233,0.10)', badge: 'Transcripción IA' },
  { id: 'photo', label: 'Foto de factura', sub: 'Sacá la foto y se extraen todos los datos del recibo.', icon: 'receipt_long', accent: '#F59E0B', tint: 'rgba(245,158,11,0.10)', chips: ['Monto', 'Comercio', 'Items', 'Fecha', 'IVA'] },
  { id: 'autoai', label: 'Auto IA', sub: 'Pegá un mensaje o describí en lenguaje natural.', icon: 'auto_awesome', accent: '#8B5CF6', tint: 'rgba(139,92,246,0.10)', badge: 'Beta' },
];

const PLANS: { id: PlanId; label: string; sub: string; icon: string; accent: string; tint: string; badge?: string; route: string }[] = [
  { id: 'debt', label: 'Pago de deuda', sub: 'Cuota Cashea, tarjeta, préstamo o personal.', icon: 'credit_card', accent: '#EF4444', tint: 'rgba(239,68,68,0.10)', badge: 'Cashea', route: '/user/debts' },
  { id: 'dream', label: 'Aporte a sueño', sub: 'Sumá al ahorro de una meta de largo plazo.', icon: 'auto_awesome', accent: '#8B5CF6', tint: 'rgba(139,92,246,0.10)', route: '/user/dreams' },
  { id: 'jar', label: 'Aporte a jar', sub: 'Movimiento hacia un jar de corto plazo.', icon: 'savings', accent: 'var(--brand-primary)', tint: 'var(--brand-primary-soft)', route: '/user/jars' },
];

const METHOD_TO_TAB: Record<MethodId, 'write' | 'voice' | 'photo' | 'autoai'> = {
  text: 'write',
  voice: 'voice',
  photo: 'photo',
  autoai: 'autoai',
};

function onClose() {
  emit('update:modelValue', false);
}

function choose(methodId: MethodId) {
  ui.openSmartModal(METHOD_TO_TAB[methodId], type.value);
  onClose();
}

const PLAN_ACTIONS: Record<PlanId, string> = {
  debt: 'pay',
  dream: 'contribute',
  jar: 'deposit',
};

async function choosePlan(planId: PlanId) {
  const plan = PLANS.find((p) => p.id === planId);
  onClose();
  if (plan) await router.push({ path: plan.route, query: { quickAction: PLAN_ACTIONS[planId] } });
}

async function openAI() {
  onClose();
  await router.push('/user/asesor');
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') onClose();
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      type.value = 'expense';
      document.addEventListener('keydown', onKeydown);
    } else {
      document.removeEventListener('keydown', onKeydown);
    }
  },
);

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<style lang="scss" scoped>
.dqm-scrim {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(10, 14, 28, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.dqm-card {
  width: min(620px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  padding: 28px;
  box-shadow: var(--shadow-popover);
}

.dqm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
}

.dqm-eyebrow {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.dqm-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--fg-1);
  margin-top: 4px;
}

.dqm-close {
  border: none;
  background: var(--surface-2);
  color: var(--fg-2);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.dqm-section {
  margin-bottom: 22px;
}

.dqm-section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dqm-label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.dqm-step {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--fg-2);
}

.dqm-segmented {
  display: flex;
  gap: 4px;
  background: var(--surface-2);
  border-radius: var(--radius-pill);
  padding: 4px;
}

.dqm-segmented__btn {
  flex: 1;
  border: 0;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--fg-2);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 160ms ease-out;

  &--active {
    background: var(--surface-1);
    font-weight: 700;
    box-shadow: var(--shadow-card);
  }
}

.dqm-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.dqm-method {
  text-align: left;
  border: 1px solid var(--border-hairline);
  cursor: pointer;
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: 14px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 116px;
  transition: all 160ms ease-out;

  &:hover {
    border-color: var(--dqm-accent);
    background: var(--dqm-tint);
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--dqm-tint);
    color: var(--dqm-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__label-row {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  }

  &__label {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 15px;
    color: var(--fg-1);
  }

  &__sub {
    font-family: var(--font-body);
    font-size: 12.5px;
    color: var(--fg-2);
    line-height: 1.45;
  }
}

.dqm-badge {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: var(--radius-pill);
  background: var(--dqm-tint);
  color: var(--dqm-accent);
  white-space: nowrap;

  &--plan {
    margin-left: auto;
    font-size: 9px;
  }
}

.dqm-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
  padding-top: 4px;
}

.dqm-chip {
  font-family: var(--font-body);
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  color: var(--fg-2);
  border: 1px solid var(--border-hairline);
}

.dqm-sep {
  height: 1px;
  background: var(--border-hairline);
  margin: 0 0 18px;
}

.dqm-plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.dqm-plan {
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--border-hairline);
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: 12px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 160ms ease-out;

  &:hover {
    border-color: var(--dqm-accent);
    background: var(--dqm-tint);
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    background: var(--dqm-tint);
    color: var(--dqm-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__label {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 13px;
    color: var(--fg-1);
  }

  &__sub {
    font-family: var(--font-body);
    font-size: 11.5px;
    color: var(--fg-2);
    line-height: 1.4;
  }
}

.dqm-ai-btn {
  width: 100%;
  border: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: var(--radius-pill);
  background: linear-gradient(90deg, #7c3aed 0%, #2563eb 60%, #0ea5e9 100%);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 6px 24px rgba(124, 58, 237, 0.3);
  transition: opacity 160ms;

  &:hover {
    opacity: 0.88;
  }
}

.dqm-fade-enter-active,
.dqm-fade-leave-active {
  transition: opacity 200ms ease-out;
}
.dqm-fade-enter-from,
.dqm-fade-leave-to {
  opacity: 0;
}

@media (max-width: 599px) {
  .dqm-plans {
    grid-template-columns: 1fr;
  }
}
</style>
