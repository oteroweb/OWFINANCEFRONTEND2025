<template>
  <q-page class="fp-page">
    <div class="fp-page__container">

      <!-- Header -->
      <div class="fp-page__header">
        <button class="fp-page__back" @click="void router.push('/user/config')">
          <q-icon name="chevron_left" size="18px" />
          Configuración
        </button>
        <span class="t-eyebrow">Cuenta</span>
        <h1 class="t-h1">Mi perfil financiero</h1>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:6px">
          <p class="t-body-sm fp-page__subtitle" style="margin:0">
            El asesor IA usa esta información para personalizar sus consejos.
          </p>
          <span v-if="updatedDaysAgo !== null" style="display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--fg-3)">
            <q-icon name="history" size="14px" />
            Actualizado hace {{ updatedDaysAgo === 0 ? 'hoy' : `${updatedDaysAgo} día${updatedDaysAgo !== 1 ? 's' : ''}` }}
          </span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="fp-page__loading">
        <q-spinner color="primary" size="32px" />
      </div>

      <template v-else>
        <!-- Gamificación: anillo de completitud + nivel + insignias por sección -->
        <div class="fp-page__card fp-page__gam-card">
          <div class="fp-page__gam-top">
            <div class="fp-page__ring" :style="{ '--ring-color': completeness.level.color }">
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="38" fill="none" stroke="var(--surface-3)" stroke-width="8" />
                <circle cx="44" cy="44" r="38" fill="none" :stroke="completeness.level.color" stroke-width="8"
                  stroke-linecap="round" :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="ringOffset" transform="rotate(-90 44 44)"
                  style="transition: stroke-dashoffset 700ms ease, stroke 300ms" />
              </svg>
              <div class="fp-page__ring-label">
                <span class="fp-page__ring-pct">{{ completeness.pct }}%</span>
                <span class="fp-page__ring-sub">perfil</span>
              </div>
            </div>
            <div class="fp-page__gam-info">
              <span class="fp-page__level-badge" :style="{ color: completeness.level.color, background: completeness.level.soft }">
                <q-icon :name="completeness.level.icon" size="15px" />
                {{ completeness.level.label }}
                <span v-if="completeness.level.pro" class="fp-page__level-pro">PRO</span>
              </span>
              <p class="fp-page__gam-tip">{{ gamTip }}</p>
            </div>
          </div>

          <div class="fp-page__badges">
            <div v-for="sec in completeness.sections" :key="sec.id" class="fp-page__badge">
              <span class="fp-page__badge-icon" :class="{ 'fp-page__badge-icon--done': sec.complete }">
                <q-icon :name="sec.icon" size="19px" />
                <span v-if="sec.complete" class="fp-page__badge-check"><q-icon name="check" size="9px" /></span>
              </span>
              <span class="fp-page__badge-label" :class="{ 'fp-page__badge-label--done': sec.complete }">{{ sec.label }}</span>
            </div>
          </div>

          <button type="button" class="fp-page__reset-btn" @click="confirmReset = true">
            <q-icon name="refresh" size="16px" />
            Reiniciar mi perfil
          </button>
        </div>

        <!-- Card 1: Quién soy -->
        <div class="fp-page__card">
          <div class="fp-page__card-title">
            <span class="fp-page__card-icon"><q-icon name="badge" size="18px" /></span>
            Quién soy
          </div>
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label">Ocupación</div>
            <div class="fp-page__chips">
              <button v-for="o in OPTIONS.occupation" :key="o.value"
                class="fp-page__chip" :class="{ 'fp-page__chip--active': form.occupation === o.value }"
                @click="form.occupation = form.occupation === o.value ? null : o.value">
                {{ o.label }}
              </button>
            </div>
          </div>
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label">Rango de ingresos mensuales</div>
            <div class="fp-page__chips">
              <button v-for="o in OPTIONS.income_range" :key="o.value"
                class="fp-page__chip" :class="{ 'fp-page__chip--active': form.income_range === o.value }"
                @click="form.income_range = form.income_range === o.value ? null : o.value">
                {{ o.label }}
              </button>
            </div>
          </div>
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label">Situación de vivienda</div>
            <div class="fp-page__chips">
              <button v-for="o in OPTIONS.living_situation" :key="o.value"
                class="fp-page__chip" :class="{ 'fp-page__chip--active': form.living_situation === o.value }"
                @click="form.living_situation = form.living_situation === o.value ? null : o.value">
                {{ o.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Card 2: Situación financiera -->
        <div class="fp-page__card">
          <div class="fp-page__card-title">
            <span class="fp-page__card-icon"><q-icon name="account_balance" size="18px" /></span>
            Situación financiera
          </div>
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label">Deudas actuales</div>
            <div class="fp-page__chips">
              <button v-for="o in OPTIONS.debt_situation" :key="o.value"
                class="fp-page__chip" :class="{ 'fp-page__chip--active': form.debt_situation === o.value }"
                @click="form.debt_situation = form.debt_situation === o.value ? null : o.value">
                {{ o.label }}
              </button>
            </div>
          </div>
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label">Fondo de emergencia</div>
            <div class="fp-page__chips">
              <button v-for="o in OPTIONS.emergency_fund" :key="o.value"
                class="fp-page__chip" :class="{ 'fp-page__chip--active': form.emergency_fund === o.value }"
                @click="form.emergency_fund = form.emergency_fund === o.value ? null : o.value">
                {{ o.label }}
              </button>
            </div>
          </div>
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label">Mi relación con el dinero</div>
            <div class="fp-page__chips">
              <button v-for="o in OPTIONS.money_relationship" :key="o.value"
                class="fp-page__chip" :class="{ 'fp-page__chip--active': form.money_relationship === o.value }"
                @click="form.money_relationship = form.money_relationship === o.value ? null : o.value">
                {{ o.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Card 3: Metas y sueños -->
        <div class="fp-page__card">
          <div class="fp-page__card-title">
            <span class="fp-page__card-icon"><q-icon name="flag" size="18px" /></span>
            Metas y sueños
          </div>
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label">Meta principal ahora mismo</div>
            <div class="fp-page__chips">
              <button v-for="o in OPTIONS.main_goal" :key="o.value"
                class="fp-page__chip" :class="{ 'fp-page__chip--active': form.main_goal === o.value }"
                @click="form.main_goal = form.main_goal === o.value ? null : o.value">
                {{ o.label }}
              </button>
            </div>
          </div>
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label-row">
              <span>Sueño a largo plazo</span>
              <span class="fp-page__char-count" :class="{ 'fp-page__char-count--warn': (form.dream?.length ?? 0) > 450 }">
                {{ form.dream?.length ?? 0 }}/500
              </span>
            </div>
            <q-input v-model="form.dream" type="textarea" outlined dense autogrow
              placeholder="Ej: Tener un negocio que funcione solo y comprar casa propia…"
              :maxlength="500" class="fp-page__textarea" />
          </div>
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label">¿Cómo quieres sentirte con tu dinero?</div>
            <div class="fp-page__chips">
              <button v-for="o in OPTIONS.emotional_keyword" :key="o.value"
                class="fp-page__chip" :class="{ 'fp-page__chip--active': form.emotional_keyword === o.value }"
                @click="form.emotional_keyword = form.emotional_keyword === o.value ? null : o.value">
                {{ o.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Card 4: Mis cántaros -->
        <div class="fp-page__card">
          <div class="fp-page__card-title">
            <span class="fp-page__card-icon"><q-icon name="savings" size="18px" /></span>
            Mis cántaros
          </div>

          <!-- Selector de plantilla -->
          <div class="fp-page__chip-group">
            <div class="fp-page__chip-label">Esquema</div>
            <div v-if="loadingTemplates" class="fp-page__tpl-loading">
              <q-spinner color="primary" size="20px" />
            </div>
            <div v-else class="fp-page__tpl-scroll">
              <button v-for="tpl in jarTemplates" :key="tpl.slug"
                class="fp-page__tpl-card"
                :class="{ 'fp-page__tpl-card--active': form.templateSlug === tpl.slug }"
                @click="pickTemplate(tpl.slug)">
                <div class="fp-page__tpl-header">
                  <span class="fp-page__tpl-name">{{ tpl.name }}</span>
                  <q-icon v-if="form.templateSlug === tpl.slug" name="check_circle" size="18px" color="primary" />
                </div>
                <!-- mini barra segmentada -->
                <div class="fp-page__mini-bar">
                  <div v-for="(s, si) in tpl.jars" :key="si"
                    class="fp-page__mini-bar-seg"
                    :style="{ width: s.percent + '%', background: s.color }" />
                </div>
                <div class="fp-page__tpl-badges">
                  <span class="fp-page__tpl-badge">{{ tpl.jars?.length ?? 0 }} cántaros</span>
                  <span v-if="tpl.recommended" class="fp-page__tpl-badge fp-page__tpl-badge--green">Recomendada</span>
                  <span v-if="tpl.featured" class="fp-page__tpl-badge fp-page__tpl-badge--amber">★ Popular</span>
                </div>
                <span class="fp-page__tpl-desc">{{ tpl.for_who }}</span>
              </button>
            </div>
          </div>

          <div class="fp-page__divider" />

          <!-- Tabla editable de cántaros -->
          <div class="fp-page__chip-group">
            <div class="fp-page__jars-header">
              <span class="fp-page__chip-label">{{ form.jars.length }} cántaros</span>
              <span class="fp-page__jars-total" :class="{ 'fp-page__jars-total--over': jarsTotal > 100, 'fp-page__jars-total--ok': jarsTotal === 100 }">
                <q-icon v-if="jarsTotal > 100" name="error" size="15px" />
                Suma {{ jarsTotal }}%
              </span>
            </div>

            <div v-for="(jar, ji) in form.jars" :key="jar._key" class="fp-page__jar-row">
              <div class="fp-page__jar-row-top">
                <span class="fp-page__jar-color" :style="{ background: jar.color }" />
                <input v-model="jar.name" placeholder="Nombre del cántaro" class="fp-page__jar-input fp-page__jar-input--name" />
                <div class="fp-page__jar-pct-wrap">
                  <input v-model.number="jar.percent" type="number" min="0" max="100" class="fp-page__jar-input fp-page__jar-input--pct" />
                  <span class="fp-page__jar-pct-sym">%</span>
                </div>
                <button class="fp-page__jar-del" @click="removeJar(ji)" title="Eliminar">
                  <q-icon name="delete" size="18px" />
                </button>
              </div>
              <textarea v-model="jar.description" placeholder="Propósito: ¿para qué es este cántaro?" rows="1"
                class="fp-page__jar-desc" />
            </div>

            <button class="fp-page__jar-add" @click="addJar">
              <q-icon name="add" size="17px" />
              Agregar cántaro
            </button>

            <div v-if="jarsTotal > 100" class="fp-page__jars-error">
              <q-icon name="error" size="17px" />
              Los porcentajes suman más de 100%. Ajusta antes de guardar.
            </div>
          </div>
        </div>

        <!-- Card 5: Avanzado (Pro) -->
        <div class="fp-page__card" :class="{ 'fp-page__card--locked': !isPro }">
          <div class="fp-page__card-title">
            <span class="fp-page__card-icon" :style="isPro ? {} : { background: 'var(--income-fg)', color: '#fff' }">
              <q-icon name="workspace_premium" size="18px" />
            </span>
            Avanzado
            <span v-if="!isPro" class="fp-page__pro-tag">PRO</span>
          </div>

          <template v-if="isPro">
            <div class="fp-page__chip-group">
              <div class="fp-page__chip-label">¿Tu ingreso es estable o variable?</div>
              <div class="fp-page__chips">
                <button v-for="o in OPTIONS.income_detail" :key="o.value"
                  class="fp-page__chip" :class="{ 'fp-page__chip--active': advanced.income_detail === o.value }"
                  @click="advanced.income_detail = advanced.income_detail === o.value ? null : o.value">
                  {{ o.label }}
                </button>
              </div>
            </div>
            <div class="fp-page__chip-group">
              <div class="fp-page__chip-label">Ante invertir, ¿qué prefieres?</div>
              <div class="fp-page__chips">
                <button v-for="o in OPTIONS.risk_tolerance" :key="o.value"
                  class="fp-page__chip" :class="{ 'fp-page__chip--active': advanced.risk_tolerance === o.value }"
                  @click="advanced.risk_tolerance = advanced.risk_tolerance === o.value ? null : o.value">
                  {{ o.label }}
                </button>
              </div>
            </div>
            <div class="fp-page__chip-group">
              <div class="fp-page__chip-label">¿En qué plazo piensas tus metas?</div>
              <div class="fp-page__chips">
                <button v-for="o in OPTIONS.time_horizon" :key="o.value"
                  class="fp-page__chip" :class="{ 'fp-page__chip--active': advanced.time_horizon === o.value }"
                  @click="advanced.time_horizon = advanced.time_horizon === o.value ? null : o.value">
                  {{ o.label }}
                </button>
              </div>
            </div>
            <div class="fp-page__chip-group">
              <div class="fp-page__chip-label">¿Qué pesa más hoy?</div>
              <div class="fp-page__chips">
                <button v-for="o in OPTIONS.goal_priority" :key="o.value"
                  class="fp-page__chip" :class="{ 'fp-page__chip--active': advanced.goal_priority === o.value }"
                  @click="advanced.goal_priority = advanced.goal_priority === o.value ? null : o.value">
                  {{ o.label }}
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <p class="fp-page__locked-copy">
              Detalle de ingresos, riesgo, horizonte y prioridades para una estrategia a tu medida.
            </p>
            <q-btn unelevated color="primary" label="Disponible en plan Pro" icon="lock_open"
              class="fp-page__locked-cta" @click="void router.push('/user/config')" />
          </template>
        </div>

        <!-- Confirm reset onboarding dialog -->
        <q-dialog v-model="confirmReset" persistent>
          <q-card style="min-width: 320px; max-width: 420px">
            <q-card-section class="row items-center gap-3">
              <div class="fp-page__confirm-icon">
                <q-icon name="refresh" size="20px" color="warning" />
              </div>
              <div>
                <div class="fp-page__confirm-title">¿Reiniciar tu perfil?</div>
                <div class="fp-page__confirm-sub">
                  Volverás a recorrer el onboarding desde cero la próxima vez que entres. Tus datos actuales no se borran hasta que lo completes de nuevo.
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn unelevated color="negative" label="Reiniciar" @click="resetProfile" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Confirm template replace dialog -->
        <q-dialog v-model="confirmTplDialog" persistent>
          <q-card style="min-width: 340px; max-width: 420px">
            <q-card-section class="row items-center gap-3">
              <div class="fp-page__confirm-icon">
                <q-icon name="swap_horiz" size="20px" color="warning" />
              </div>
              <div>
                <div class="fp-page__confirm-title">¿Reemplazar tus cántaros?</div>
                <div class="fp-page__confirm-sub">
                  Cambiarás al esquema <strong>{{ pendingTemplate?.name }}</strong>
                  ({{ pendingTemplate?.jars?.length ?? 0 }} cántaros)
                </div>
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="fp-page__mini-bar" style="height:12px">
                <div v-for="(s, si) in pendingTemplate?.jars" :key="si"
                  class="fp-page__mini-bar-seg"
                  :style="{ width: s.percent + '%', background: s.color }" />
              </div>
              <p class="fp-page__confirm-note">
                Tus cántaros con transacciones se conservan; los porcentajes se reajustan a la nueva plantilla.
              </p>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn unelevated color="primary" label="Reemplazar" @click="confirmTemplate" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Actions -->
        <div class="fp-page__actions">
          <q-btn flat label="Cancelar" @click="void router.push('/user/config')" />
          <q-btn unelevated color="primary" label="Guardar perfil" :loading="saving" @click="save"
            :disable="jarsTotal > 100" />
        </div>
      </template>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'stores/auth';

defineOptions({ name: 'FinancialProfilePage' });

const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

const isPro = computed(() => (auth.settings?.layout_mode ?? auth.user?.layout_mode) === 'pro');
const confirmReset = ref(false);

const loading = ref(true);
const saving = ref(false);
const updatedDaysAgo = ref<number | null>(null);
const loadingTemplates = ref(true);
const jarTemplates = ref<JarTemplate[]>([]);
const confirmTplDialog = ref(false);
const pendingTemplate = ref<JarTemplate | null>(null);

interface JarTemplateSegment {
  name: string;
  percent: number;
  color: string;
}
interface JarTemplate {
  slug: string;
  name: string;
  for_who: string;
  recommended?: boolean;
  featured?: boolean;
  jars: JarTemplateSegment[];
}
interface EditableJar {
  _key: string;
  id?: number;
  name: string;
  percent: number;
  color: string;
  description: string;
}

const jarsTotal = computed(() =>
  form.value.jars.reduce((s, j) => s + (Number(j.percent) || 0), 0)
);

// ── Gamificación (OWF-358) — mismo concepto de niveles que el onboarding:
// basico/completo/avanzado, con pesos por campo (rediseno/onboarding/gamification.jsx) ──
const ONB_LEVELS = [
  { id: 'basico', label: 'Básico', color: 'var(--info)', soft: 'var(--info-soft, rgba(59,130,246,.12))', icon: 'eco' },
  { id: 'completo', label: 'Completo', color: 'var(--brand-primary)', soft: 'var(--brand-primary-soft, rgba(99,102,241,.12))', icon: 'verified' },
  { id: 'avanzado', label: 'Avanzado', color: 'var(--income-fg)', soft: 'var(--income-soft, rgba(22,163,74,.12))', icon: 'workspace_premium', pro: true },
];
const ONB_WEIGHTS: Record<string, number> = {
  occupation: 12.5, income_range: 12.5, main_goal: 12.5, templateSlug: 12.5,
  debt_situation: 10, emergency_fund: 9, money_relationship: 9, living_situation: 9, dream: 9, emotional_keyword: 4,
};
const ADVANCED_FIELDS = ['income_detail', 'risk_tolerance', 'time_horizon', 'goal_priority'] as const;
const filled = (v: unknown) => v !== null && v !== undefined && v !== '';

const completeness = computed(() => {
  let pct = 0;
  for (const [field, weight] of Object.entries(ONB_WEIGHTS)) {
    if (filled((form.value as Record<string, unknown>)[field])) pct += weight;
  }
  pct = Math.round(pct);

  const standardDone = Object.keys(ONB_WEIGHTS).every(f => filled((form.value as Record<string, unknown>)[f]));
  const advDone = isPro.value && ADVANCED_FIELDS.every(f => filled(advanced.value[f]));

  let levelId: 'basico' | 'completo' | 'avanzado' = 'basico';
  if (standardDone && advDone) levelId = 'avanzado';
  else if (standardDone) levelId = 'completo';

  const levelIndex = ONB_LEVELS.findIndex(l => l.id === levelId);
  const level = ONB_LEVELS[levelIndex] ?? ONB_LEVELS[0]!;

  const sections = [
    { id: 'you', label: 'Quién eres', icon: 'person', fields: ['occupation', 'income_range', 'living_situation'] },
    { id: 'situation', label: 'Tu situación', icon: 'account_balance', fields: ['debt_situation', 'emergency_fund', 'money_relationship'] },
    { id: 'goals', label: 'Tus metas', icon: 'flag', fields: ['main_goal', 'dream', 'emotional_keyword'] },
    { id: 'jars', label: 'Tus cántaros', icon: 'savings', fields: ['templateSlug'] },
  ].map(s => {
    const done = s.fields.filter(f => filled((form.value as Record<string, unknown>)[f])).length;
    return { ...s, done, total: s.fields.length, complete: done === s.fields.length };
  });

  return { pct, level, levelId, levelIndex, standardDone, advDone, sections };
});

const ringCircumference = 2 * Math.PI * 38;
const ringOffset = computed(() => ringCircumference * (1 - Math.max(0, Math.min(100, completeness.value.pct)) / 100));

const gamTip = computed(() => {
  const c = completeness.value;
  if (c.levelId === 'basico') return 'Completa tu situación financiera para pasar de consejos generales a consejos a tu medida.';
  if (c.levelId === 'completo' && !isPro.value) return 'Con Pro desbloqueas el nivel Avanzado: proyecciones y estrategia personalizada.';
  if (c.levelId === 'completo') return 'Completa el bloque Avanzado para desbloquear el nivel máximo.';
  return 'Tu perfil está al máximo. El asesor ya trabaja con toda tu información.';
});

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
    { value: '<500', label: 'Menos de $500' },
    { value: '500-1500', label: '$500 – $1.500' },
    { value: '1500-4000', label: '$1.500 – $4.000' },
    { value: '>4000', label: 'Más de $4.000' },
  ],
  living_situation: [
    { value: 'solo', label: 'Solo/a' },
    { value: 'pareja', label: 'En pareja' },
    { value: 'familia', label: 'Con familia' },
    { value: 'roommates', label: 'Compartido' },
  ],
  debt_situation: [
    { value: 'none', label: 'Sin deudas' },
    { value: 'credit_card', label: 'Tarjeta de crédito' },
    { value: 'personal_loan', label: 'Préstamo personal' },
    { value: 'mortgage', label: 'Hipoteca' },
    { value: 'multiple', label: 'Varias deudas' },
  ],
  emergency_fund: [
    { value: 'none', label: 'Sin fondo' },
    { value: '<3m', label: 'Menos de 3 meses' },
    { value: '3-6m', label: '3–6 meses' },
    { value: '>6m', label: 'Más de 6 meses' },
  ],
  money_relationship: [
    { value: 'want_improve', label: 'Quiero mejorar' },
    { value: 'organized', label: 'Organizado/a' },
    { value: 'hard_to_save', label: 'Me cuesta ahorrar' },
    { value: 'day_to_day', label: 'Vivo al día' },
  ],
  main_goal: [
    { value: 'debt_free', label: 'Salir de deudas' },
    { value: 'emergency_fund', label: 'Fondo de emergencia' },
    { value: 'saving_goal', label: 'Meta de ahorro' },
    { value: 'invest', label: 'Empezar a invertir' },
    { value: 'survive', label: 'Llegar a fin de mes' },
  ],
  emotional_keyword: [
    { value: 'tranquilo', label: 'Tranquilo/a' },
    { value: 'libre', label: 'Libre' },
    { value: 'seguro', label: 'Seguro/a' },
    { value: 'control', label: 'En control' },
    { value: 'prospero', label: 'Próspero/a' },
  ],
  // OWF-359 — campos avanzados (solo Pro)
  income_detail: [
    { value: 'estable', label: 'Estable' },
    { value: 'variable', label: 'Variable' },
    { value: 'mixto', label: 'Mixto' },
  ],
  risk_tolerance: [
    { value: 'conservador', label: 'Proteger' },
    { value: 'equilibrado', label: 'Equilibrar' },
    { value: 'agresivo', label: 'Crecer' },
  ],
  time_horizon: [
    { value: 'corto', label: 'Corto plazo' },
    { value: 'medio', label: 'Mediano plazo' },
    { value: 'largo', label: 'Largo plazo' },
  ],
  goal_priority: [
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'crecimiento', label: 'Crecimiento' },
    { value: 'experiencias', label: 'Experiencias' },
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
  templateSlug: null as string | null,
  jars: [] as EditableJar[],
});

// OWF-359 — campos avanzados Pro. El backend aún no expone columnas para
// income_detail/risk_tolerance/time_horizon/goal_priority (ver
// UserFinancialProfileController::PROFILE_FIELDS), así que por ahora se
// persisten localmente por usuario. Cuando el backend agregue soporte,
// reemplazar advancedStorageKey/load/save por la llamada API real.
const advanced = ref({
  income_detail: null as string | null,
  risk_tolerance: null as string | null,
  time_horizon: null as string | null,
  goal_priority: null as string | null,
});

function advancedStorageKey(): string | null {
  const uid = auth.user?.id;
  return uid ? `owf_advanced_profile_${uid}` : null;
}

function loadAdvanced() {
  const key = advancedStorageKey();
  if (!key) return;
  try {
    const raw = localStorage.getItem(key);
    if (raw) Object.assign(advanced.value, JSON.parse(raw));
  } catch { /* noop */ }
}

function saveAdvanced() {
  const key = advancedStorageKey();
  if (!key) return;
  try { localStorage.setItem(key, JSON.stringify(advanced.value)); } catch { /* noop */ }
}

function makeKey() {
  return Math.random().toString(36).slice(2);
}

onMounted(async () => {
  const [profileRes, templatesRes, jarsRes] = await Promise.allSettled([
    api.get('/user/financial-profile'),
    api.get('/jar-templates'),
    api.get('/jars'),
  ]);

  if (profileRes.status === 'fulfilled') {
    const d = profileRes.value.data.data ?? profileRes.value.data;
    form.value.occupation = d.occupation ?? null;
    form.value.income_range = d.income_range ?? null;
    form.value.living_situation = d.living_situation ?? null;
    form.value.debt_situation = d.debt_situation ?? null;
    form.value.emergency_fund = d.emergency_fund ?? null;
    form.value.money_relationship = d.money_relationship ?? null;
    form.value.main_goal = d.main_goal ?? null;
    form.value.dream = d.dream ?? '';
    form.value.emotional_keyword = d.emotional_keyword ?? null;
    if (d.updated_at) {
      const diff = Math.floor((Date.now() - new Date(d.updated_at as string).getTime()) / 86400000);
      updatedDaysAgo.value = diff;
    }
  } else {
    $q.notify({ type: 'negative', message: 'No se pudo cargar el perfil financiero' });
  }

  if (templatesRes.status === 'fulfilled') {
    const raw = templatesRes.value.data.data ?? templatesRes.value.data;
    jarTemplates.value = (Array.isArray(raw) ? raw : []).map((t: Record<string, unknown>) => ({
      slug: t.slug as string,
      name: t.name as string,
      for_who: (t.for_who ?? t.forWho ?? '') as string,
      recommended: !!(t.recommended),
      featured: !!(t.featured),
      jars: (Array.isArray(t.jars) ? t.jars : []) as JarTemplateSegment[],
    }));
  }
  loadingTemplates.value = false;

  if (jarsRes.status === 'fulfilled') {
    const raw = jarsRes.value.data.data ?? jarsRes.value.data;
    const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
    form.value.jars = list.map((j: Record<string, unknown>) => ({
      _key: makeKey(),
      id: j.id as number,
      name: (j.name ?? '') as string,
      percent: Number(j.percent ?? 0),
      color: (j.color ?? '#64748B') as string,
      description: (j.description ?? '') as string,
    }));
  }

  loading.value = false;
  loadAdvanced();
});

watch(advanced, saveAdvanced, { deep: true });

async function resetProfile() {
  confirmReset.value = false;
  try {
    await auth.updateSettings({ has_seen_onboarding: false });
    $q.notify({ type: 'positive', message: 'Perfil reiniciado. El onboarding se abrirá de nuevo.' });
    void router.push('/user/home');
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo reiniciar el perfil' });
  }
}

function pickTemplate(slug: string) {
  if (slug === form.value.templateSlug) return;
  const tpl = jarTemplates.value.find(t => t.slug === slug) ?? null;
  if (form.value.jars.length > 0) {
    pendingTemplate.value = tpl;
    confirmTplDialog.value = true;
  } else {
    applyTemplate(tpl, slug);
  }
}

function applyTemplate(tpl: JarTemplate | null, slug: string) {
  form.value.templateSlug = slug;
  if (tpl) {
    form.value.jars = tpl.jars.map(s => ({
      _key: makeKey(),
      name: s.name,
      percent: s.percent,
      color: s.color,
      description: '',
    }));
  }
}

function confirmTemplate() {
  if (!pendingTemplate.value) return;
  applyTemplate(pendingTemplate.value, pendingTemplate.value.slug);
  pendingTemplate.value = null;
  confirmTplDialog.value = false;
}

function addJar() {
  form.value.jars.push({ _key: makeKey(), name: '', percent: 0, color: '#64748B', description: '' });
}

function removeJar(index: number) {
  form.value.jars.splice(index, 1);
}

async function save() {
  if (jarsTotal.value > 100) {
    $q.notify({ type: 'warning', message: 'Los porcentajes de los cántaros suman más de 100%' });
    return;
  }
  saving.value = true;
  try {
    const [profileSave] = await Promise.allSettled([
      api.put('/user/financial-profile', {
        occupation: form.value.occupation,
        income_range: form.value.income_range,
        living_situation: form.value.living_situation,
        debt_situation: form.value.debt_situation,
        emergency_fund: form.value.emergency_fund,
        money_relationship: form.value.money_relationship,
        main_goal: form.value.main_goal,
        dream: form.value.dream,
        emotional_keyword: form.value.emotional_keyword,
        onboarding_profile_completed: true,
        // OWF-359 — el backend aún no persiste estos 4 campos (no están en
        // UserFinancialProfileController::PROFILE_FIELDS); se envían igual
        // por si se agrega soporte, pero hoy Laravel los descarta en el
        // validate(). La fuente de verdad real es localStorage (ver saveAdvanced()).
        income_detail: advanced.value.income_detail,
        risk_tolerance: advanced.value.risk_tolerance,
        time_horizon: advanced.value.time_horizon,
        goal_priority: advanced.value.goal_priority,
      }),
      form.value.jars.length > 0
        ? api.post('/jars/bulk-sync', { jars: form.value.jars.map(j => ({
            id: j.id ?? null,
            name: j.name,
            percent: j.percent,
            color: j.color,
            description: j.description,
          })) })
        : Promise.resolve(),
    ]);
    if (profileSave.status === 'rejected') throw profileSave.reason;
    saveAdvanced();
    $q.notify({ type: 'positive', message: 'Perfil financiero actualizado' });
    void router.push('/user/config');
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al guardar';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.fp-page {
  padding: 0;

  &__container {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 20px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 2px;
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
    font-size: 12.5px;
    font-weight: 600;
    padding: 2px 0;
    margin-bottom: 6px;
  }

  &__subtitle {
    color: var(--fg-2);
    margin-top: 6px;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 40px;
  }

  &__card {
    background: var(--surface-1);
    border: 1px solid var(--border-hairline, rgba(0,0,0,.08));
    border-radius: var(--radius-xl, var(--radius-md));
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 17px;
    color: var(--fg-1);
  }

  &__card-icon {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--brand-primary-soft, #EEF2FF);
    color: var(--brand-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__chip-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__chip-label {
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--fg-2);
  }

  &__chip-label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--fg-2);
  }

  &__char-count {
    font-size: 11px;
    color: var(--fg-3);
    font-weight: 400;

    &--warn { color: var(--expense-fg, #ef4444); }
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
    border-radius: var(--radius-pill, 999px);
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

  &__textarea {
    font-family: var(--font-body);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    position: sticky;
    bottom: 16px;
    filter: drop-shadow(var(--shadow-float, 0 4px 16px rgba(0,0,0,.12)));
  }

  &__tpl-loading {
    display: flex;
    padding: 16px 0;
  }

  &__tpl-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 6px;
    scrollbar-width: thin;
  }

  &__tpl-card {
    flex: 0 0 auto;
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 14px;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border-hairline, rgba(0,0,0,.12));
    background: var(--surface-1);
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;

    &:hover { border-color: var(--brand-primary); }

    &--active {
      border-color: var(--brand-primary);
      background: var(--brand-primary-soft, #EEF2FF);
    }
  }

  &__tpl-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__tpl-name {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 700;
    color: var(--fg-1);
  }

  &__tpl-badges {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }

  &__tpl-badge {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    color: var(--fg-2);
    background: var(--surface-2);
    padding: 2px 8px;
    border-radius: 999px;

    &--green {
      color: var(--income-fg, #16a34a);
      background: var(--income-soft, #dcfce7);
    }

    &--amber {
      color: var(--warning, #d97706);
      background: var(--warning-soft, #fef3c7);
    }
  }

  &__tpl-desc {
    font-family: var(--font-body);
    font-size: 11.5px;
    color: var(--fg-2);
    line-height: 1.4;
  }

  &__mini-bar {
    display: flex;
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    background: var(--surface-3);
  }

  &__mini-bar-seg {
    height: 100%;
    transition: width 0.2s;
  }

  &__divider {
    height: 1px;
    background: var(--border-hairline, rgba(0,0,0,.08));
  }

  &__jars-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__jars-total {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-money);
    font-size: 13px;
    font-weight: 700;
    color: var(--fg-2);

    &--over { color: var(--expense-fg, #ef4444); }
    &--ok   { color: var(--income-fg, #16a34a); }
  }

  &__jar-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 11px;
    border-radius: var(--radius-md);
    background: var(--surface-2, #f8fafc);
    border: 1px solid var(--border-hairline, rgba(0,0,0,.07));
    margin-bottom: 8px;
  }

  &__jar-row-top {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__jar-color {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  &__jar-input {
    border: 1.5px solid var(--border-hairline, rgba(0,0,0,.12));
    background: var(--surface-1);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--fg-1);
    padding: 8px 11px;
    outline: none;
    transition: border-color 0.15s;

    &:focus { border-color: var(--brand-primary); }

    &--name { flex: 1; min-width: 0; }
    &--pct  { width: 48px; font-family: var(--font-money); font-weight: 700; font-size: 14px; text-align: right; }
  }

  &__jar-pct-wrap {
    display: flex;
    align-items: center;
    gap: 3px;
    border: 1.5px solid var(--border-hairline, rgba(0,0,0,.12));
    background: var(--surface-1);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    flex-shrink: 0;
  }

  &__jar-pct-sym {
    font-family: var(--font-money);
    font-size: 13px;
    color: var(--fg-3);
  }

  &__jar-del {
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--fg-3);
    padding: 4px;
    border-radius: 6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;

    &:hover { color: var(--expense-fg, #ef4444); }
  }

  &__jar-desc {
    width: 100%;
    border: 1.5px solid var(--border-hairline, rgba(0,0,0,.12));
    background: var(--surface-1);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 12.5px;
    color: var(--fg-1);
    padding: 8px 11px;
    outline: none;
    resize: vertical;
    min-height: 36px;
    line-height: 1.4;
    box-sizing: border-box;

    &:focus { border-color: var(--brand-primary); }
  }

  &__jar-add {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px dashed var(--border-hairline, rgba(0,0,0,.2));
    background: transparent;
    cursor: pointer;
    color: var(--brand-primary);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    padding: 9px 14px;
    border-radius: var(--radius-pill);
    margin-top: 4px;

    &:hover { border-color: var(--brand-primary); }
  }

  &__jars-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 13px;
    border-radius: var(--radius-sm);
    background: var(--expense-soft, #fee2e2);
    font-family: var(--font-body);
    font-size: 12.5px;
    color: var(--expense-fg, #dc2626);
    margin-top: 8px;
  }

  &__confirm-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: var(--warning-soft, #fef3c7);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__confirm-title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 16px;
    color: var(--fg-1);
  }

  &__confirm-sub {
    font-family: var(--font-body);
    font-size: 12.5px;
    color: var(--fg-2);
    margin-top: 2px;
  }

  &__confirm-note {
    font-family: var(--font-body);
    font-size: 12.5px;
    color: var(--fg-2);
    margin: 12px 0 0;
    line-height: 1.5;
  }

  // ── Gamificación (OWF-358) ──
  &__gam-card {
    gap: 16px;
  }

  &__gam-top {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__ring {
    position: relative;
    width: 88px;
    height: 88px;
    flex-shrink: 0;
  }

  &__ring-label {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__ring-pct {
    font-family: var(--font-money);
    font-weight: 700;
    font-size: 19px;
    color: var(--fg-1);
    line-height: 1;
  }

  &__ring-sub {
    font-family: var(--font-body);
    font-size: 9px;
    color: var(--fg-3);
    margin-top: 2px;
  }

  &__gam-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__level-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    align-self: flex-start;
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 999px;
  }

  &__level-pro {
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.04em;
    background: var(--income-fg);
    color: #fff;
    padding: 1px 4px;
    border-radius: 4px;
  }

  &__gam-tip {
    font-family: var(--font-body);
    font-size: 12.5px;
    color: var(--fg-2);
    line-height: 1.45;
    margin: 0;
  }

  &__badges {
    display: flex;
    gap: 8px;
  }

  &__badge {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  &__badge-icon {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-2);
    color: var(--fg-3);
    transition: all 0.2s ease;

    &--done {
      background: var(--brand-primary);
      color: #fff;
    }
  }

  &__badge-check {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 15px;
    height: 15px;
    border-radius: 8px;
    background: var(--income-fg);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border: 2px solid var(--surface-1);
  }

  &__badge-label {
    font-family: var(--font-body);
    font-size: 10px;
    font-weight: 600;
    color: var(--fg-3);
    text-align: center;
    line-height: 1.15;

    &--done { color: var(--fg-1); }
  }

  &__reset-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    align-self: flex-start;
    border: 1px solid var(--border-hairline, rgba(0,0,0,.12));
    background: transparent;
    cursor: pointer;
    color: var(--fg-2);
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: var(--radius-pill, 999px);

    &:hover { border-color: var(--expense-fg, #ef4444); color: var(--expense-fg, #ef4444); }
  }

  // ── Sección avanzada Pro (OWF-359) ──
  &__card--locked {
    background: var(--income-soft, rgba(22,163,74,.08));
    border-color: var(--income-fg, #16a34a);
  }

  &__pro-tag {
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.04em;
    background: var(--income-fg, #16a34a);
    color: #fff;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: auto;
  }

  &__locked-copy {
    font-family: var(--font-body);
    font-size: 12.5px;
    color: var(--fg-2);
    line-height: 1.5;
    margin: 0;
  }

  &__locked-cta {
    align-self: flex-start;
  }
}
</style>
