<template>
  <q-dialog v-model="show" persistent transition-show="jump-up" transition-hide="jump-down">
    <div class="ob">

      <!-- Top bar: only on form steps -->
      <template v-if="!isEdge">
        <div class="ob__topbar">
          <button class="ob__back" @click="back">
            <q-icon name="arrow_back" size="19px" />
          </button>
          <div class="ob__phase-bars">
            <div
              v-for="(ph, i) in PHASES"
              :key="ph"
              class="ob__phase-bar"
              :class="{
                'ob__phase-bar--done':   phaseIndex > i,
                'ob__phase-bar--active': phaseIndex === i,
              }"
            />
          </div>
          <button class="ob__close-btn" @click="skip">
            <q-icon name="close" size="19px" />
          </button>
        </div>
        <div class="ob__phase-label">{{ PHASES[phaseIndex] ?? '' }}</div>
      </template>

      <!-- Body -->
      <div class="ob__body" :class="{ 'ob__body--centered': isEdge }">

        <!-- ── Intro ─────────────────────────────────────────────── -->
        <template v-if="step.id === 'intro'">
          <div class="ob__intro">
            <div class="ob__avatar">
              <div class="ob__avatar-ring ob__avatar-ring--2" />
              <div class="ob__avatar-ring ob__avatar-ring--1" />
              <div class="ob__avatar-core">
                <q-icon name="auto_awesome" size="28px" color="white" />
              </div>
            </div>
            <h2 class="t-h1 ob__intro-title">Configura tu perfil financiero</h2>
            <p class="ob__intro-sub">
              El asesor IA usará esto para darte consejos que realmente aplican a tu vida.
            </p>
            <div class="ob__intro-phases">
              <div v-for="ph in INTRO_PHASES" :key="ph.label" class="ob__intro-phase">
                <q-icon :name="ph.icon" size="18px" class="ob__intro-phase-icon" />
                <span>{{ ph.label }}</span>
              </div>
            </div>
            <div class="ob__intro-meta">
              <span class="ob__meta-badge">
                <q-icon name="schedule" size="14px" /> ~2 minutos
              </span>
              <span class="ob__meta-badge">
                <q-icon name="lock" size="14px" /> Privado
              </span>
              <span class="ob__meta-badge">
                <q-icon name="skip_next" size="14px" /> Puedes saltar
              </span>
            </div>
            <q-btn unelevated color="primary" size="lg" label="Empezar mi perfil" class="ob__cta" @click="next" />
            <button class="ob__skip-link" @click="skip">Ahora no · explorar primero</button>
          </div>
        </template>

        <!-- ── Done ──────────────────────────────────────────────── -->
        <template v-else-if="step.id === 'done'">
          <div class="ob__done">
            <div class="ob__ring-wrap">
              <svg class="ob__ring-svg" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="38" class="ob__ring-bg" />
                <circle cx="44" cy="44" r="38" class="ob__ring-fill"
                  :stroke-dasharray="`${completeness * 2.39} 999`" />
              </svg>
              <div class="ob__ring-inner">
                <span class="ob__ring-pct">{{ completeness }}%</span>
              </div>
            </div>
            <div class="ob__level-badge" :class="`ob__level-badge--${levelKey}`">
              <q-icon :name="LEVELS[levelKey]!.icon" size="16px" />
              {{ LEVELS[levelKey]!.label }}
            </div>
            <h2 class="t-h1 ob__done-title">¡Tu perfil está listo!</h2>
            <p class="ob__done-sub">
              El asesor IA ya conoce tu situación y puede darte consejos personalizados. Actualiza tu perfil en cualquier momento desde Configuración.
            </p>
            <q-btn unelevated color="primary" size="lg" label="Ir a mi panel" class="ob__cta" :loading="saving" @click="finish" />
          </div>
        </template>

        <!-- ── Data steps ──────────────────────────────────────── -->
        <template v-else>
          <div class="ob__step">
            <h2 class="t-h2">{{ step.title }}</h2>
            <p class="ob__step-sub">{{ step.sub }}</p>

            <!-- Plan strip (shows forming plan) -->
            <div v-if="planSlug" class="ob__plan-strip">
              <q-icon name="auto_awesome" size="16px" style="color: var(--brand-primary)" />
              <span>Tu plan: <strong>{{ planSlug }}</strong></span>
            </div>

            <!-- About -->
            <template v-if="step.id === 'about'">
              <ChipField label="Ocupación" :options="OPTIONS.occupation" :value="form.occupation"
                @change="v => autoSelect('occupation', v)" />
              <ChipField label="Rango de ingresos" :options="OPTIONS.income_range" :value="form.income_range"
                @change="v => autoSelect('income_range', v)" />
              <ChipField label="Vivienda" :options="OPTIONS.living_situation" :value="form.living_situation"
                @change="v => autoSelect('living_situation', v)" />
            </template>

            <!-- Situation -->
            <template v-if="step.id === 'situation'">
              <ChipField label="Deudas actuales" :options="OPTIONS.debt_situation" :value="form.debt_situation"
                @change="v => autoSelect('debt_situation', v)" />
              <ChipField label="Fondo de emergencia" :options="OPTIONS.emergency_fund" :value="form.emergency_fund"
                @change="v => autoSelect('emergency_fund', v)" />
              <ChipField label="Mi relación con el dinero" :options="OPTIONS.money_relationship" :value="form.money_relationship"
                @change="v => autoSelect('money_relationship', v)" />
            </template>

            <!-- Goals -->
            <template v-if="step.id === 'goals'">
              <ChipField label="Meta principal" :options="OPTIONS.main_goal" :value="form.main_goal"
                @change="v => autoSelect('main_goal', v)" />
              <div class="ob__field">
                <div class="ob__field-label">Sueño a largo plazo <span class="ob__optional">(opcional)</span></div>
                <q-input v-model="form.dream" type="textarea" outlined dense autogrow :maxlength="500"
                  placeholder="Ej: Tener libertad financiera y viajar con mi familia…" />
              </div>
              <ChipField label="¿Cómo quieres sentirte?" :options="OPTIONS.emotional_keyword" :value="form.emotional_keyword"
                @change="v => autoSelect('emotional_keyword', v)" />
            </template>

            <!-- Jars -->
            <template v-if="step.id === 'jars'">
              <div v-if="templatesLoading" class="ob__jars-loading">
                <q-spinner color="primary" size="32px" />
              </div>
              <template v-else>
                <div class="ob__templates">
                  <button
                    v-for="t in templates"
                    :key="t.slug"
                    class="ob__tpl"
                    :class="{ 'ob__tpl--active': selectedTemplate === t.slug }"
                    @click="selectedTemplate = selectedTemplate === t.slug ? null : t.slug"
                  >
                    <div class="ob__tpl-head">
                      <span class="ob__tpl-name">{{ t.name }}</span>
                      <q-icon
                        :name="selectedTemplate === t.slug ? 'check_circle' : 'radio_button_unchecked'"
                        size="20px"
                        :color="selectedTemplate === t.slug ? 'primary' : 'grey-4'"
                      />
                    </div>
                    <p class="ob__tpl-desc">{{ t.description }}</p>
                    <div class="ob__tpl-jars">
                      <span v-for="j in t.jars.slice(0, 5)" :key="j.id" class="ob__tpl-jar"
                        :style="{ background: j.color + '22', color: j.color }">
                        {{ j.name }} · {{ j.percent }}%
                      </span>
                      <span v-if="t.jars.length > 5" class="ob__tpl-jar ob__tpl-jar--more">+{{ t.jars.length - 5 }} más</span>
                    </div>
                  </button>
                </div>
                <p class="ob__tpl-skip-hint">Puedes omitir esto y crear tus cántaros manualmente después.</p>
              </template>
            </template>
          </div>
        </template>

      </div>

      <!-- Footer nav (only on data steps) -->
      <div v-if="!isEdge" class="ob__footer">
        <div class="ob__footer-right">
          <button v-if="step.skippable" class="ob__skip-link" @click="next">Saltar</button>
          <q-btn unelevated color="primary" label="Continuar" @click="next" />
        </div>
      </div>

    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

interface JarTemplate {
  id: number;
  slug: string;
  name: string;
  description: string;
  jars: Array<{ id: number; name: string; percent: number; color: string }>;
}

defineOptions({ name: 'OnboardingFlow' });

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'done'): void;
}>();

const $q = useQuasar();
const saving = ref(false);

const templates = ref<JarTemplate[]>([]);
const templatesLoading = ref(false);
const selectedTemplate = ref<string | null>(null);

async function loadTemplates() {
  if (templates.value.length) return;
  templatesLoading.value = true;
  try {
    const res = await api.get<{ data: JarTemplate[] }>('/jar-templates');
    templates.value = res.data?.data ?? (res.data as unknown as JarTemplate[]) ?? [];
  } catch {
    templates.value = [];
  } finally {
    templatesLoading.value = false;
  }
}

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const STEPS = [
  { id: 'intro',     title: '',                                sub: '',                                           skippable: false },
  { id: 'about',     title: 'Cuéntanos sobre ti',              sub: 'El asesor IA usará esto para personalizarte.', skippable: true  },
  { id: 'situation', title: 'Tu situación actual',             sub: 'Honestidad = mejores consejos.',             skippable: true  },
  { id: 'goals',     title: 'Tus metas y sueños',             sub: 'Lo que quieres lograr guía todo el plan.',   skippable: true  },
  { id: 'jars',      title: 'Dale propósito a tus cántaros',  sub: 'El asesor sabrá para qué es cada uno.',      skippable: true  },
  { id: 'done',      title: '',                                sub: '',                                           skippable: false },
];

const PHASES = ['Sobre ti', 'Situación', 'Metas', 'Plan'];

const INTRO_PHASES = [
  { icon: 'person', label: 'Sobre ti · tu situación' },
  { icon: 'flag', label: 'Tus metas y sueños' },
  { icon: 'savings', label: 'Plan de cántaros' },
  { icon: 'auto_awesome', label: 'Asesor IA personalizado' },
];

const LEVELS: Record<string, { label: string; icon: string }> = {
  seed:   { label: 'Semilla', icon: 'eco' },
  sprout: { label: 'Brote',   icon: 'local_florist' },
  tree:   { label: 'Árbol',   icon: 'park' },
};

const currentIndex = ref(0);
const step = computed(() => STEPS[currentIndex.value]!);
const isEdge = computed(() => step.value.id === 'intro' || step.value.id === 'done');

// phaseIndex: maps step index (1-4) to phase (0-3)
const phaseIndex = computed(() => Math.max(0, Math.min(currentIndex.value - 1, PHASES.length - 1)));

watch(
  () => step.value?.id,
  (id) => { if (id === 'jars') void loadTemplates(); }
);

// ─── Form ────────────────────────────────────────────────────────────
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

const FORM_KEYS = [
  'occupation','income_range','living_situation',
  'debt_situation','emergency_fund','money_relationship',
  'main_goal','emotional_keyword',
] as const;

const completeness = computed(() => {
  const filled = FORM_KEYS.filter(k => !!form.value[k]).length;
  return Math.round((filled / FORM_KEYS.length) * 100);
});

const levelKey = computed<'seed' | 'sprout' | 'tree'>(() => {
  const pct = completeness.value;
  if (pct >= 75) return 'tree';
  if (pct >= 40) return 'sprout';
  return 'seed';
});

// Plan slug: derive from main_goal (simple heuristic)
const PLAN_MAP: Record<string, string> = {
  debt_free:      'Sin deudas',
  emergency_fund: 'Fondo 6 meses',
  saving_goal:    'Ahorro meta',
  invest:         'Inversión',
  survive:        'Balanceado',
};
const planSlug = computed(() => form.value.main_goal ? PLAN_MAP[form.value.main_goal] ?? null : null);

// ─── Options ─────────────────────────────────────────────────────────
const OPTIONS = {
  occupation: [
    { value: 'employee',     label: 'Empleado' },
    { value: 'freelancer',   label: 'Freelancer' },
    { value: 'entrepreneur', label: 'Emprendedor' },
    { value: 'student',      label: 'Estudiante' },
    { value: 'retired',      label: 'Jubilado' },
    { value: 'other',        label: 'Otro' },
  ],
  income_range: [
    { value: '<500',     label: '< $500' },
    { value: '500-1500', label: '$500–$1.5k' },
    { value: '1500-4000',label: '$1.5k–$4k' },
    { value: '>4000',    label: '> $4.000' },
  ],
  living_situation: [
    { value: 'solo',       label: 'Solo/a' },
    { value: 'pareja',     label: 'Pareja' },
    { value: 'familia',    label: 'Familia' },
    { value: 'roommates',  label: 'Compartido' },
  ],
  debt_situation: [
    { value: 'none',          label: 'Sin deudas' },
    { value: 'credit_card',   label: 'Tarjeta crédito' },
    { value: 'personal_loan', label: 'Préstamo personal' },
    { value: 'mortgage',      label: 'Hipoteca' },
    { value: 'multiple',      label: 'Varias' },
  ],
  emergency_fund: [
    { value: 'none', label: 'Sin fondo' },
    { value: '<3m',  label: '< 3 meses' },
    { value: '3-6m', label: '3–6 meses' },
    { value: '>6m',  label: '> 6 meses' },
  ],
  money_relationship: [
    { value: 'want_improve', label: 'Quiero mejorar' },
    { value: 'organized',    label: 'Organizado/a' },
    { value: 'hard_to_save', label: 'Me cuesta ahorrar' },
    { value: 'day_to_day',   label: 'Vivo al día' },
  ],
  main_goal: [
    { value: 'debt_free',      label: 'Salir de deudas' },
    { value: 'emergency_fund', label: 'Fondo emergencia' },
    { value: 'saving_goal',    label: 'Meta de ahorro' },
    { value: 'invest',         label: 'Invertir' },
    { value: 'survive',        label: 'Llegar a fin de mes' },
  ],
  emotional_keyword: [
    { value: 'tranquilo', label: 'Tranquilo/a' },
    { value: 'libre',     label: 'Libre' },
    { value: 'seguro',    label: 'Seguro/a' },
    { value: 'control',   label: 'En control' },
    { value: 'prospero',  label: 'Próspero/a' },
  ],
};

// ─── Navigation ───────────────────────────────────────────────────────
function next() {
  if (currentIndex.value < STEPS.length - 1) currentIndex.value++;
}
function back() {
  if (currentIndex.value > 0) currentIndex.value--;
}

function autoSelect(key: keyof typeof form.value, value: string | null) {
  (form.value as Record<string, string | null>)[key] = value;
  // Auto-advance 280ms after chip selection (only if step has all chips or just one field)
  const stepId = step.value.id;
  if (stepId === 'about' || stepId === 'situation' || stepId === 'goals') {
    // only auto-advance from the last field in a step
    const lastFieldMap: Record<string, string> = {
      about: 'living_situation',
      situation: 'money_relationship',
      goals: 'emotional_keyword',
    };
    if (lastFieldMap[stepId] === key && value !== null) {
      setTimeout(next, 280);
    }
  }
}

// ─── Finish / Skip ────────────────────────────────────────────────────
async function finish() {
  saving.value = true;
  try {
    if (selectedTemplate.value) {
      await api.post('/jar-templates/apply', { template_slug: selectedTemplate.value });
    }
    await api.put('/user/financial-profile', {
      ...form.value,
      onboarding_profile_completed: true,
    });
    try { localStorage.setItem('ow-onboarded', '1'); } catch { /* noop */ }
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
  } catch { /* noop */ }
  try { localStorage.setItem('ow-onboarded', '1'); } catch { /* noop */ }
  emit('done');
  emit('update:modelValue', false);
}

// ─── ChipField ────────────────────────────────────────────────────────
const ChipField = defineComponent({
  props: {
    label: String,
    options: Array as () => { value: string; label: string }[],
    value: { type: String as () => string | null, default: null },
  },
  emits: ['change'],
  setup(p, { emit: e }) {
    return () => h('div', { class: 'ob__field' }, [
      h('div', { class: 'ob__field-label' }, p.label),
      h('div', { class: 'ob__chips' },
        (p.options ?? []).map(o =>
          h('button', {
            class: ['ob__chip', p.value === o.value ? 'ob__chip--active' : ''],
            onClick: () => e('change', p.value === o.value ? null : o.value),
          }, o.label)
        )
      ),
    ]);
  },
});
</script>

<style scoped lang="scss">
/* ── Dialog shell ─────────────────────────────────────────────────── */
:deep(.q-dialog__inner) {
  padding: 20px;
}

.ob {
  width: min(540px, 100vw - 40px);
  max-height: calc(100vh - 60px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--surface-1);
  border-radius: var(--radius-xl, 20px);
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.28);
}

/* ── Topbar ───────────────────────────────────────────────────────── */
.ob__topbar {
  flex-shrink: 0;
  padding: 16px 20px 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ob__back, .ob__close-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
  color: var(--fg-2);
  transition: background 120ms;

  &:hover { background: var(--surface-2); }
}

.ob__phase-bars {
  flex: 1;
  display: flex;
  gap: 5px;
}

.ob__phase-bar {
  flex: 1;
  height: 5px;
  border-radius: 999px;
  background: var(--surface-3);
  transition: background 300ms ease;

  &--active { background: color-mix(in srgb, var(--brand-primary) 50%, var(--surface-3)); }
  &--done   { background: var(--brand-primary); }
}

.ob__phase-label {
  flex-shrink: 0;
  text-align: center;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-primary);
  padding: 0 20px 10px;
}

/* ── Body ─────────────────────────────────────────────────────────── */
.ob__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 24px;
  scrollbar-width: thin;

  &--centered {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 440px;
  }
}

/* ── Intro stage ──────────────────────────────────────────────────── */
.ob__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;
  padding: 16px 0 8px;
}

/* AI avatar with animated rings */
.ob__avatar {
  position: relative;
  width: 88px;
  height: 88px;
  display: grid;
  place-items: center;
}

.ob__avatar-core {
  position: relative;
  z-index: 3;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--brand-primary);
  display: grid;
  place-items: center;
  animation: ob-float 3.2s ease-in-out infinite;
}

.ob__avatar-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--brand-primary);
  animation: ob-ripple 2.8s ease-out infinite;

  &--1 { opacity: 0.35; animation-delay: 0s; }
  &--2 { opacity: 0.18; animation-delay: 0.7s; transform: scale(1.4); }
}

@keyframes ob-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}

@keyframes ob-ripple {
  0%   { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.8); opacity: 0; }
}

.ob__intro-title {
  font-size: 22px;
  margin: 0;
  max-width: 380px;
}

.ob__intro-sub {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--fg-2);
  max-width: 380px;
  margin: 0;
  line-height: 1.55;
}

.ob__intro-phases {
  display: flex;
  flex-direction: column;
  gap: 9px;
  width: 100%;
  max-width: 320px;
  text-align: left;
}

.ob__intro-phase {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--fg-1);
  font-weight: 500;
}

.ob__intro-phase-icon {
  color: var(--brand-primary);
  flex-shrink: 0;
}

.ob__intro-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.ob__meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  color: var(--fg-2);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
}

/* ── Done stage ───────────────────────────────────────────────────── */
.ob__done {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 16px 0 8px;
}

.ob__ring-wrap {
  position: relative;
  width: 88px;
  height: 88px;
}

.ob__ring-svg {
  width: 88px;
  height: 88px;
  transform: rotate(-90deg);
}

.ob__ring-bg {
  fill: none;
  stroke: var(--surface-3);
  stroke-width: 8;
}

.ob__ring-fill {
  fill: none;
  stroke: var(--brand-primary);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dashoffset: 0;
  transition: stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ob__ring-inner {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.ob__ring-pct {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20px;
  color: var(--brand-primary);
}

.ob__level-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;

  &--seed   { background: #F0FDF4; color: #16A34A; }
  &--sprout { background: #EFF6FF; color: #2563EB; }
  &--tree   { background: #FFF7ED; color: #EA580C; }
}

.ob__done-title { margin: 0; }

.ob__done-sub {
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--fg-2);
  max-width: 380px;
  margin: 0;
  line-height: 1.55;
}

/* ── Data step ────────────────────────────────────────────────────── */
.ob__step {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ob__step-sub {
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--fg-2);
  margin-top: -8px;
}

.ob__plan-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--brand-primary) 8%, var(--surface-1));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--fg-1);
}

/* ── Fields / chips ───────────────────────────────────────────────── */
.ob__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ob__field-label {
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--fg-2);
}

.ob__optional {
  font-weight: 400;
  color: var(--fg-3);
  margin-left: 4px;
}

.ob__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ob__chip {
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
  transition: border-color 150ms, background 150ms, color 150ms;

  &:hover { border-color: var(--brand-primary); }

  &--active {
    background: color-mix(in srgb, var(--brand-primary) 12%, var(--surface-1));
    border-color: var(--brand-primary);
    color: var(--brand-primary);
    font-weight: 700;
  }
}

/* ── Templates (jars step) ────────────────────────────────────────── */
.ob__jars-loading {
  display: flex;
  justify-content: center;
  padding: 32px;
}

.ob__templates {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ob__tpl {
  border: 1.5px solid var(--border-hairline, rgba(0,0,0,.12));
  border-radius: var(--radius-md, 12px);
  background: var(--surface-2);
  padding: 14px 16px;
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms, background 150ms;

  &:hover { border-color: var(--brand-primary); }

  &--active {
    border-color: var(--brand-primary);
    background: color-mix(in srgb, var(--brand-primary) 8%, var(--surface-1));
  }
}

.ob__tpl-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.ob__tpl-name {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  color: var(--fg-1);
}

.ob__tpl-desc {
  font-family: var(--font-body);
  font-size: 12.5px;
  color: var(--fg-3);
  margin: 0 0 10px;
}

.ob__tpl-jars {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.ob__tpl-jar {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;

  &--more { background: var(--surface-3); color: var(--fg-3); }
}

.ob__tpl-skip-hint {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--fg-3);
  text-align: center;
  margin: 4px 0 0;
}

/* ── Footer ───────────────────────────────────────────────────────── */
.ob__footer {
  flex-shrink: 0;
  border-top: 1px solid var(--border-hairline, rgba(0,0,0,.08));
  background: var(--surface-1);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.ob__footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* ── Shared ───────────────────────────────────────────────────────── */
.ob__cta { min-width: 200px; }

.ob__skip-link {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--fg-3);
  font-family: var(--font-body);
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover { color: var(--fg-2); }
}
</style>
