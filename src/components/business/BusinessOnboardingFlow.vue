<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="(v: boolean) => emit('update:modelValue', v)">
    <q-card class="bof">
      <div class="bof__progress">
        <span
          v-for="(_, i) in steps"
          :key="i"
          class="bof__bar"
          :style="i <= step ? { background: tint } : undefined"
        />
      </div>

      <div class="bof__body">
        <div class="bof__eyebrow">{{ business?.name ?? 'Tu empresa' }} · pregunta {{ step + 1 }} de {{ steps.length }}</div>
        <h3 class="bof__title">{{ current.title }}</h3>
        <p v-if="current.hint" class="bof__hint">{{ current.hint }}</p>

        <!-- Opciones (preguntas 1-4) -->
        <div v-if="current.options" class="bof__options" :class="{ 'bof__options--one': current.columns === 1 }">
          <button
            v-for="o in current.options"
            :key="o.id"
            type="button"
            class="bof__option"
            :class="{ 'bof__option--on': answers[current.key] === o.id }"
            :style="answers[current.key] === o.id ? { borderColor: tint } : undefined"
            @click="answers[current.key] = o.id"
          >
            <q-icon v-if="o.icon" :name="o.icon" size="20px" :style="answers[current.key] === o.id ? { color: tint } : undefined" />
            <span>{{ o.label }}</span>
          </button>
        </div>

        <!-- Meta del año (pregunta 5) -->
        <div v-else class="bof__goal">
          <q-input
            v-model="answers.goal"
            type="textarea"
            outlined
            autogrow
            :maxlength="500"
            counter
            placeholder="Ej: dejar de mezclar la plata del negocio con la mía y poder pagarme un sueldo fijo"
          />
          <span class="bof__hint">Se puede saltar y escribirlo después.</span>
        </div>

        <div v-if="current.key === 'staff' && hasStaff" class="bof__note">
          <q-icon name="schedule" size="18px" />
          <span>La gestión de empleados y pagos de nómina llega más adelante. Por ahora la empresa lleva cuentas, cántaros y movimientos.</span>
        </div>
      </div>

      <div class="bof__actions">
        <q-btn v-if="step > 0" flat rounded no-caps label="Atrás" @click="step -= 1" />
        <q-btn v-else flat rounded no-caps label="Ahora no" @click="close" />
        <q-space />
        <q-btn
          v-if="!isLast"
          unelevated
          rounded
          no-caps
          label="Siguiente"
          :disable="!ready"
          :style="{ background: tint, color: '#fff' }"
          @click="step += 1"
        />
        <q-btn
          v-else
          unelevated
          rounded
          no-caps
          label="Terminar"
          :loading="saving"
          :style="{ background: tint, color: '#fff' }"
          @click="finish"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useBusinessStore, businessErrorMessage, type Business } from 'stores/business';

defineOptions({ name: 'BusinessOnboardingFlow' });

const props = defineProps<{ modelValue: boolean; business: Business | null }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; done: [business: Business] }>();

const $q = useQuasar();
const store = useBusinessStore();

interface Option { id: string; label: string; icon?: string }
interface Step {
  key: 'sector' | 'revenue' | 'staff' | 'seasonal' | 'goal';
  title: string;
  hint: string | null;
  options?: Option[];
  columns?: 1 | 2;
}

const SECTORS: Option[] = [
  { id: 'retail', label: 'Comercio / tienda', icon: 'storefront' },
  { id: 'food', label: 'Comida y bebida', icon: 'restaurant' },
  { id: 'services', label: 'Servicios profesionales', icon: 'work' },
  { id: 'trades', label: 'Oficios y reparaciones', icon: 'handyman' },
  { id: 'wholesale', label: 'Distribución / mayoreo', icon: 'local_shipping' },
  { id: 'digital', label: 'Digital / software', icon: 'computer' },
  { id: 'health', label: 'Salud y bienestar', icon: 'medical_services' },
  { id: 'other', label: 'Otro', icon: 'category' },
];
const REVENUE: Option[] = [
  { id: 'under5', label: 'Menos de $5.000' },
  { id: '5to20', label: '$5.000 – $20.000' },
  { id: '20to50', label: '$20.000 – $50.000' },
  { id: 'over50', label: 'Más de $50.000' },
  { id: 'unknown', label: 'Todavía no sé' },
];
const STAFF: Option[] = [
  { id: 'solo', label: 'Solo yo' },
  { id: '2to5', label: '2 a 5' },
  { id: '6to20', label: '6 a 20' },
  { id: 'over20', label: 'Más de 20' },
];
const SEASONAL: Option[] = [
  { id: 'yes', label: 'Sí, cambia bastante según el mes' },
  { id: 'no', label: 'No, se mantiene parejo todo el año' },
  { id: 'unsure', label: 'No estoy seguro todavía' },
];

const name = computed(() => props.business?.name ?? 'la empresa');

const steps = computed<Step[]>(() => [
  { key: 'sector', title: `¿A qué se dedica ${name.value}?`, hint: 'Con esto armamos un reparto de cántaros que se parezca a tu negocio.', options: SECTORS, columns: 2 },
  { key: 'revenue', title: '¿Cuánto esperás facturar por mes?', hint: 'Una estimación alcanza. Sirve para dimensionar los cántaros, no para controlarte.', options: REVENUE, columns: 1 },
  { key: 'staff', title: '¿Cuánta gente trabaja en la empresa?', hint: null, options: STAFF, columns: 2 },
  { key: 'seasonal', title: '¿El negocio tiene temporadas?', hint: 'Meses claramente más flojos o más fuertes que el resto.', options: SEASONAL, columns: 1 },
  { key: 'goal', title: '¿Qué querés lograr este año?', hint: 'En tus palabras. Lo usa el asesor para entender qué es una buena noticia y qué no.' },
]);

const step = ref(0);
const saving = ref(false);
const answers = reactive<{ sector: string; revenue: string; staff: string; seasonal: string; goal: string }>({
  sector: '',
  revenue: '',
  staff: '',
  seasonal: '',
  goal: '',
});

const current = computed(() => steps.value[step.value]!);
const isLast = computed(() => step.value === steps.value.length - 1);
const tint = computed(() => props.business?.color ?? '#3B5BDB');
const hasStaff = computed(() => !!answers.staff && answers.staff !== 'solo');
// La meta (última pregunta) es opcional; el resto exige una respuesta.
const ready = computed(() => current.value.key === 'goal' || !!answers[current.value.key]);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      step.value = 0;
      answers.sector = '';
      answers.revenue = '';
      answers.staff = '';
      answers.seasonal = '';
      answers.goal = '';
    }
  },
);

function close() {
  emit('update:modelValue', false);
}

async function finish() {
  const b = props.business;
  if (!b) return;
  saving.value = true;
  try {
    // El backend espera los campos planos; "seasonal" es boolean (null si no sabe).
    const updated = await store.saveOnboarding(b.id, {
      sector: answers.sector || null,
      revenue: answers.revenue || null,
      staff: answers.staff || null,
      seasonal: answers.seasonal === 'yes' ? true : answers.seasonal === 'no' ? false : null,
      goal: answers.goal.trim() || null,
    });
    $q.notify({ type: 'positive', message: 'Empresa configurada' });
    emit('done', updated);
    close();
  } catch (e: unknown) {
    $q.notify({ type: 'negative', message: businessErrorMessage(e, 'No se pudo guardar la configuración') });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.bof {
  width: min(560px, 100%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;

  &__progress { display: flex; gap: 4px; padding: 14px 20px 0; }
  &__bar { flex: 1; height: 4px; border-radius: 2px; background: var(--surface-2); transition: background 200ms; }
  &__body { padding: 18px 22px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
  &__eyebrow { font-size: 11.5px; font-weight: 600; color: var(--fg-3); text-transform: uppercase; letter-spacing: 0.04em; }
  &__title { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: 19px; color: var(--fg-1); }
  &__hint { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--fg-2); }

  &__options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; &--one { grid-template-columns: 1fr; } }
  &__option {
    display: flex; align-items: center; gap: 10px; text-align: left; cursor: pointer;
    padding: 12px 14px; border-radius: 12px; background: transparent;
    border: 1px solid var(--border-hairline); color: var(--fg-1); font-size: 13.5px;
    &--on { background: var(--surface-2); font-weight: 600; }
  }
  &__goal { display: flex; flex-direction: column; gap: 7px; }
  &__note {
    display: flex; gap: 10px; padding: 13px 15px; border-radius: 12px; background: var(--surface-2);
    font-size: 12.5px; line-height: 1.55; color: var(--fg-2);
  }
  &__actions { display: flex; align-items: center; gap: 10px; padding: 14px 22px 18px; }
}
</style>
