<template>
  <q-dialog v-model="show" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <div class="ob__wrap">

      <!-- Top bar -->
      <div class="ob__topbar">
        <div class="ob__brand">
          <div class="ob__brand-mark" />
          <span class="ob__brand-name">OW Finance</span>
        </div>
        <div class="ob__dots">
          <div v-for="(s, i) in STEPS" :key="s.id"
            class="ob__dot" :class="{ 'ob__dot--done': i <= currentIndex }" />
        </div>
        <button class="ob__close" @click="skip">
          <q-icon name="close" size="22px" />
        </button>
      </div>

      <!-- Step content -->
      <div class="ob__body">
        <div class="ob__step">

          <!-- Welcome -->
          <template v-if="step.id === 'welcome'">
            <div class="ob__welcome">
              <div class="ob__welcome-mark" />
              <h2 class="t-h1">Bienvenido/a a OW Finance</h2>
              <p class="t-body ob__welcome-sub">
                Tarda 2 minutos en configurar tu perfil. El asesor IA lo usará para darte consejos que realmente aplican a tu vida.
              </p>
              <q-btn unelevated color="primary" size="lg" label="Empezar" class="ob__cta" @click="next" />
              <button class="ob__skip-link" @click="skip">Prefiero configurarlo después</button>
            </div>
          </template>

          <!-- Done -->
          <template v-else-if="step.id === 'done'">
            <div class="ob__done">
              <q-icon name="check_circle" size="64px" color="positive" />
              <h2 class="t-h1">¡Todo listo!</h2>
              <p class="t-body ob__welcome-sub">Tu asesor IA ya conoce tu perfil. Puedes actualizarlo en cualquier momento desde Configuración.</p>
              <q-btn unelevated color="primary" size="lg" label="Ir a mi inicio" class="ob__cta" :loading="saving" @click="finish" />
            </div>
          </template>

          <!-- Data steps -->
          <template v-else>
            <h2 class="t-h2">{{ step.title }}</h2>
            <p class="t-body-sm ob__step-sub">{{ step.sub }}</p>

            <!-- About: occupation + income + living -->
            <template v-if="step.id === 'about'">
              <ChipField label="Ocupación" :options="OPTIONS.occupation" v-model="form.occupation" />
              <ChipField label="Rango de ingresos" :options="OPTIONS.income_range" v-model="form.income_range" />
              <ChipField label="Vivienda" :options="OPTIONS.living_situation" v-model="form.living_situation" />
            </template>

            <!-- Situation: debts + emergency + money_relationship -->
            <template v-if="step.id === 'situation'">
              <ChipField label="Deudas actuales" :options="OPTIONS.debt_situation" v-model="form.debt_situation" />
              <ChipField label="Fondo de emergencia" :options="OPTIONS.emergency_fund" v-model="form.emergency_fund" />
              <ChipField label="Mi relación con el dinero" :options="OPTIONS.money_relationship" v-model="form.money_relationship" />
            </template>

            <!-- Goals: main_goal + dream + emotional_keyword -->
            <template v-if="step.id === 'goals'">
              <ChipField label="Meta principal" :options="OPTIONS.main_goal" v-model="form.main_goal" />
              <div class="ob__field">
                <div class="ob__field-label">Sueño a largo plazo</div>
                <q-input v-model="form.dream" type="textarea" outlined dense autogrow :maxlength="500"
                  placeholder="Ej: Tener libertad financiera y viajar con mi familia…" />
              </div>
              <ChipField label="¿Cómo quieres sentirte?" :options="OPTIONS.emotional_keyword" v-model="form.emotional_keyword" />
            </template>

            <!-- Jars: placeholder — cántaros se configuran en la app -->
            <template v-if="step.id === 'jars'">
              <div class="ob__jars-hint">
                <q-icon name="savings" size="40px" color="primary" />
                <p class="t-body">Los cántaros organizan tu dinero por propósito. Puedes personalizarlos en <strong>Configuración → Mi perfil financiero</strong> después del onboarding.</p>
              </div>
            </template>
          </template>

        </div>
      </div>

      <!-- Bottom nav (all steps except welcome/done) -->
      <div v-if="step.id !== 'welcome' && step.id !== 'done'" class="ob__footer">
        <button v-if="currentIndex > 0" class="ob__back" @click="back">
          <q-icon name="chevron_left" size="20px" /> Atrás
        </button>
        <div class="ob__footer-right">
          <button v-if="step.skippable" class="ob__skip-link" @click="next">Saltar</button>
          <q-btn unelevated color="primary" label="Continuar" @click="next" />
        </div>
      </div>

    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

defineOptions({ name: 'OnboardingFlow' });

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'done'): void }>();

const $q = useQuasar();
const saving = ref(false);

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const STEPS = [
  { id: 'welcome',   title: '',                          sub: '',                                          skippable: false },
  { id: 'about',     title: 'Cuéntanos sobre ti',        sub: 'El asesor IA usará esto para darte consejos personalizados.', skippable: true },
  { id: 'situation', title: 'Tu situación actual',       sub: 'Honestidad = mejores consejos.',            skippable: true },
  { id: 'goals',     title: 'Tus metas y sueños',        sub: 'Lo que quieres lograr guía todo el plan.',  skippable: true },
  { id: 'jars',      title: 'Dale propósito a tus cántaros', sub: 'El asesor sabrá para qué es cada uno.', skippable: true },
  { id: 'done',      title: '',                          sub: '',                                          skippable: false },
];

const currentIndex = ref(0);
const step = computed(() => STEPS[currentIndex.value]!);

const OPTIONS = {
  occupation: [
    { value: 'employee', label: 'Empleado' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'entrepreneur', label: 'Emprendedor' },
    { value: 'student', label: 'Estudiante' },
    { value: 'retired', label: 'Jubilado' },
    { value: 'other', label: 'Otro' },
  ],
  income_range: [
    { value: '<500', label: '< $500' },
    { value: '500-1500', label: '$500–$1.5k' },
    { value: '1500-4000', label: '$1.5k–$4k' },
    { value: '>4000', label: '> $4.000' },
  ],
  living_situation: [
    { value: 'solo', label: 'Solo/a' },
    { value: 'pareja', label: 'Pareja' },
    { value: 'familia', label: 'Familia' },
    { value: 'roommates', label: 'Compartido' },
  ],
  debt_situation: [
    { value: 'none', label: 'Sin deudas' },
    { value: 'credit_card', label: 'Tarjeta crédito' },
    { value: 'personal_loan', label: 'Préstamo personal' },
    { value: 'mortgage', label: 'Hipoteca' },
    { value: 'multiple', label: 'Varias' },
  ],
  emergency_fund: [
    { value: 'none', label: 'Sin fondo' },
    { value: '<3m', label: '< 3 meses' },
    { value: '3-6m', label: '3–6 meses' },
    { value: '>6m', label: '> 6 meses' },
  ],
  money_relationship: [
    { value: 'want_improve', label: 'Quiero mejorar' },
    { value: 'organized', label: 'Organizado/a' },
    { value: 'hard_to_save', label: 'Me cuesta ahorrar' },
    { value: 'day_to_day', label: 'Vivo al día' },
  ],
  main_goal: [
    { value: 'debt_free', label: 'Salir de deudas' },
    { value: 'emergency_fund', label: 'Fondo emergencia' },
    { value: 'saving_goal', label: 'Meta de ahorro' },
    { value: 'invest', label: 'Invertir' },
    { value: 'survive', label: 'Llegar a fin de mes' },
  ],
  emotional_keyword: [
    { value: 'tranquilo', label: 'Tranquilo/a' },
    { value: 'libre', label: 'Libre' },
    { value: 'seguro', label: 'Seguro/a' },
    { value: 'control', label: 'En control' },
    { value: 'prospero', label: 'Próspero/a' },
  ],
};

const form = ref({
  occupation: null as string | null,
  income_range: null as string | null,
  living_situation: null as string | null,
  debt_situation: null as string | null,
  emergency_fund: null as string | null,
  money_relationship: null as string | null,
  main_goal: null as string | null,
  dream: '',
  emotional_keyword: null as string | null,
});

function next() {
  if (currentIndex.value < STEPS.length - 1) currentIndex.value++;
}
function back() {
  if (currentIndex.value > 0) currentIndex.value--;
}

async function finish() {
  saving.value = true;
  try {
    await api.put('/user/financial-profile', {
      ...form.value,
      onboarding_profile_completed: true,
    });
    try { localStorage.setItem('ow-onboarded', '1'); } catch (lsErr) { void lsErr; }
    emit('done');
    emit('update:modelValue', false);
  } catch {
    $q.notify({ type: 'negative', message: 'Error guardando perfil. Puedes completarlo en Configuración.' });
    emit('done');
    emit('update:modelValue', false);
  } finally {
    saving.value = false;
  }
}

async function skip() {
  try {
    await api.put('/user/financial-profile', { onboarding_profile_completed: true });
  } catch (skipErr) { void skipErr; }
  try { localStorage.setItem('ow-onboarded', '1'); } catch (lsErr) { void lsErr; }
  emit('done');
  emit('update:modelValue', false);
}

// Internal chip-field component
const ChipField = defineComponent({
  props: {
    label: String,
    options: Array as () => { value: string; label: string }[],
    modelValue: { type: String as () => string | null, default: null },
  },
  emits: ['update:modelValue'],
  setup(p, { emit: e }) {
    return () => h('div', { class: 'ob__field' }, [
      h('div', { class: 'ob__field-label' }, p.label),
      h('div', { class: 'ob__chips' },
        (p.options ?? []).map(o =>
          h('button', {
            class: ['ob__chip', p.modelValue === o.value ? 'ob__chip--active' : ''],
            onClick: () => e('update:modelValue', p.modelValue === o.value ? null : o.value),
          }, o.label)
        )
      ),
    ]);
  },
});
</script>

<style scoped lang="scss">
.ob {
  &__wrap {
    background: var(--bg-canvas, var(--surface-1));
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__topbar {
    flex-shrink: 0;
    padding: 18px 24px 0;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  &__brand-mark {
    width: 22px;
    height: 22px;
    border-radius: 7px;
    background: var(--brand-primary);
  }

  &__brand-name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 14px;
    color: var(--fg-1);
  }

  &__dots {
    flex: 1;
    display: flex;
    gap: 6px;
    padding: 0 12px;
  }

  &__dot {
    flex: 1;
    height: 5px;
    border-radius: 999px;
    background: var(--surface-3);
    transition: background 0.25s ease;

    &--done { background: var(--brand-primary); }
  }

  &__close {
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--fg-3);
    display: inline-flex;
    padding: 4px;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  &__step {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__step-sub {
    color: var(--fg-2);
    margin-top: -8px;
  }

  &__welcome, &__done {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    padding-top: 40px;
  }

  &__welcome-mark {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: var(--brand-primary);
  }

  &__welcome-sub {
    color: var(--fg-2);
    max-width: 440px;
  }

  &__cta {
    min-width: 200px;
    margin-top: 8px;
  }

  &__skip-link {
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--fg-3);
    font-family: var(--font-body);
    font-size: 13px;
    text-decoration: underline;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__field-label {
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--fg-2);
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1.5px solid var(--border-hairline, rgba(0,0,0,.12));
    background: var(--surface-2);
    color: var(--fg-1);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover { border-color: var(--brand-primary); }

    &--active {
      background: var(--brand-primary-soft, #EEF2FF);
      border-color: var(--brand-primary);
      color: var(--brand-primary);
      font-weight: 700;
    }
  }

  &__jars-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    padding: 24px;
    background: var(--surface-2);
    border-radius: var(--radius-md);
  }

  &__footer {
    flex-shrink: 0;
    border-top: 1px solid var(--border-hairline, rgba(0,0,0,.08));
    background: var(--surface-1);
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__footer-right {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--fg-2);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
  }
}
</style>
