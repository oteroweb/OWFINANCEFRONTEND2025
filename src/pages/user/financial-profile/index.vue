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
        <p class="t-body-sm fp-page__subtitle">
          El asesor IA usa esta información para personalizar sus consejos.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="fp-page__loading">
        <q-spinner color="primary" size="32px" />
      </div>

      <template v-else>
        <!-- Card 1: Quién soy -->
        <div class="fp-page__card">
          <div class="fp-page__card-title">
            <q-icon name="badge" size="20px" />
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
            <q-icon name="account_balance" size="20px" />
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
            <q-icon name="flag" size="20px" />
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

        <!-- Actions -->
        <div class="fp-page__actions">
          <q-btn flat label="Cancelar" @click="void router.push('/user/config')" />
          <q-btn unelevated color="primary" label="Guardar perfil" :loading="saving" @click="save" />
        </div>
      </template>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

defineOptions({ name: 'FinancialProfilePage' });

const router = useRouter();
const $q = useQuasar();

const loading = ref(true);
const saving = ref(false);

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
});

onMounted(async () => {
  try {
    const { data } = await api.get('/user/financial-profile');
    const d = data.data ?? data;
    form.value.occupation = d.occupation ?? null;
    form.value.income_range = d.income_range ?? null;
    form.value.living_situation = d.living_situation ?? null;
    form.value.debt_situation = d.debt_situation ?? null;
    form.value.emergency_fund = d.emergency_fund ?? null;
    form.value.money_relationship = d.money_relationship ?? null;
    form.value.main_goal = d.main_goal ?? null;
    form.value.dream = d.dream ?? '';
    form.value.emotional_keyword = d.emotional_keyword ?? null;
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cargar el perfil financiero' });
  } finally {
    loading.value = false;
  }
});

async function save() {
  saving.value = true;
  try {
    await api.put('/user/financial-profile', {
      ...form.value,
      onboarding_profile_completed: true,
    });
    $q.notify({ type: 'positive', message: 'Perfil financiero actualizado' });
    void void router.push('/user/config');
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
    border-radius: var(--radius-md);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 15px;
    color: var(--fg-1);
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
  }
}
</style>
