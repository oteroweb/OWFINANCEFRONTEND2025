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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

defineOptions({ name: 'FinancialProfilePage' });

const router = useRouter();
const $q = useQuasar();

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
});

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
}
</style>
