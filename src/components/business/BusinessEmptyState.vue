<template>
  <div v-if="visible" class="bes">
    <div class="bes__inner">
      <div class="bes__head">
        <span class="bes__mark" :style="{ background: tint }">{{ (business?.name ?? 'E').charAt(0).toUpperCase() }}</span>
        <div class="bes__head-text">
          <h2 class="bes__name">{{ business?.name ?? 'Tu empresa' }}</h2>
          <p class="bes__desc">Está creada y casi vacía. Sus cuentas y movimientos son aparte de los tuyos.</p>
        </div>
      </div>

      <div class="bes__steps">
        <div v-for="s in steps" :key="s.n" class="bes__step" :style="s.primary ? { borderColor: tint } : undefined">
          <span class="bes__icon" :class="{ 'bes__icon--done': s.done }" :style="s.primary && !s.done ? { background: tint, color: '#fff' } : undefined">
            <q-icon :name="s.done ? 'check' : s.icon" size="18px" />
          </span>
          <div class="bes__step-text">
            <div class="bes__step-title">
              {{ s.title }} <span v-if="s.minutes" class="bes__minutes">{{ s.minutes }}</span>
            </div>
            <p class="bes__step-body">{{ s.body }}</p>
          </div>
          <q-btn
            v-if="!s.done && s.show"
            :unelevated="s.primary"
            :outline="!s.primary"
            rounded
            no-caps
            size="md"
            :label="s.cta"
            :disable="s.disabled"
            :style="s.primary ? { background: tint, color: '#fff' } : undefined"
            @click="s.action"
          />
        </div>
      </div>

      <div class="bes__note">
        <q-icon name="schedule" size="18px" />
        <p>La gestión de empleados y pagos de nómina llega más adelante. Por ahora la empresa lleva cuentas, cántaros y movimientos.</p>
      </div>
    </div>

    <BusinessOnboardingFlow v-model="showOnboarding" :business="business" @done="onOnboarded" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'boot/axios';
import { useBusinessStore } from 'stores/business';
import { useUiStore } from 'stores/ui';
import BusinessOnboardingFlow from './BusinessOnboardingFlow.vue';

defineOptions({ name: 'BusinessEmptyState' });

/**
 * Arranque de una empresa recién creada. Se auto-oculta: solo se ve en contexto
 * de empresa y mientras falte configurarla o crear la primera cuenta.
 * (Las cuentas se piden con el contexto activo: el interceptor añade business_id.)
 */
const router = useRouter();
const store = useBusinessStore();
const ui = useUiStore();

const business = computed(() => store.activeBusiness);
const tint = computed(() => business.value?.color ?? 'var(--brand-primary)');
const onboarded = computed(() => !!business.value?.onboarded_at);
const isOwner = computed(() => store.isOwner);
const hasAccounts = ref<boolean | null>(null);
const showOnboarding = ref(false);

async function loadAccountsCount() {
  if (!business.value) {
    hasAccounts.value = null;
    return;
  }
  try {
    const res = await api.get('/accounts', { params: { per_page: 1 } });
    const raw = res.data?.data;
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? (raw.data as unknown[]) : [];
    hasAccounts.value = list.length > 0;
  } catch {
    hasAccounts.value = null;
  }
}

onMounted(() => void loadAccountsCount());
watch(() => business.value?.id, () => void loadAccountsCount());

// Visible mientras falte algo; un viewer no puede completar nada, así que no se le muestra el arranque.
const visible = computed(
  () => !!business.value && hasAccounts.value !== null && (!onboarded.value || !hasAccounts.value) && store.canWrite,
);

const steps = computed(() => [
  {
    n: 1, icon: 'auto_awesome', primary: !onboarded.value, done: onboarded.value,
    title: 'Configurá la empresa',
    body: onboarded.value
      ? 'Listo. La empresa quedó configurada con tus respuestas.'
      : 'Unas preguntas sobre el negocio — rubro, facturación esperada, temporadas.',
    cta: 'Empezar', minutes: onboarded.value ? null : '3 minutos', disabled: false,
    show: isOwner.value, action: () => { showOnboarding.value = true; },
  },
  {
    n: 2, icon: 'account_balance', primary: onboarded.value && !hasAccounts.value, done: !!hasAccounts.value,
    title: 'Agregá una cuenta',
    body: 'El banco, la caja o lo que use la empresa para cobrar y pagar.',
    cta: 'Agregar cuenta', minutes: null, disabled: false,
    show: isOwner.value, action: () => { void router.push('/user/config'); },
  },
  {
    n: 3, icon: 'receipt_long', primary: false, done: false,
    title: 'Registrá el primer movimiento',
    body: hasAccounts.value
      ? 'Un cobro o un gasto de la empresa.'
      : 'Necesita una cuenta primero: un movimiento tiene que entrar o salir de algún lado.',
    cta: 'Registrar', minutes: null, disabled: !hasAccounts.value,
    show: true, action: () => { ui.openSmartModal(); },
  },
]);

function onOnboarded() {
  // la lista ya se actualizó en la store (upsertLocal); refrescar conteo de cuentas por si cambió
  void loadAccountsCount();
}
</script>

<style scoped lang="scss">
.bes {
  padding: 28px 22px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__inner { width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: 22px; }
  &__head { display: flex; align-items: center; gap: 14px; }
  &__mark {
    width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0; color: #fff;
    display: grid; place-items: center; font-weight: 700; font-size: 19px;
  }
  &__head-text { min-width: 0; }
  &__name { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: 21px; color: var(--fg-1); }
  &__desc { margin: 3px 0 0; font-size: 13.5px; line-height: 1.5; color: var(--fg-2); }
  &__steps { display: flex; flex-direction: column; gap: 11px; }
  &__step {
    display: flex; align-items: flex-start; gap: 14px; padding: 17px 18px; border-radius: var(--radius-lg, 16px);
    background: var(--surface-1); border: 1px solid var(--border-hairline);
  }
  &__icon {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: grid; place-items: center;
    background: var(--surface-2); color: var(--fg-2);
    &--done { background: var(--income-soft, #dcfce7); color: var(--income-fg, #15803d); }
  }
  &__step-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  &__step-title { font-family: var(--font-display); font-weight: 600; font-size: 15px; color: var(--fg-1); }
  &__minutes { font-family: var(--font-body); font-weight: 400; font-size: 11.5px; color: var(--fg-3); margin-left: 6px; }
  &__step-body { margin: 0; font-size: 13px; line-height: 1.5; color: var(--fg-2); }
  &__note {
    display: flex; gap: 10px; padding: 14px 16px; border-radius: 12px; background: var(--surface-2); color: var(--fg-2);
    p { margin: 0; font-size: 12.5px; line-height: 1.55; }
  }
}
</style>
