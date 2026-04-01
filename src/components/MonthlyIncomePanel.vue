<template>
  <q-card flat bordered class="monthly-income-panel">
    <q-card-section class="bg-primary text-white">
      <!-- Modo dual: Esperado vs Real -->
      <div class="income-dual-view">
        <!-- Columna 1: Ingreso Esperado -->
        <div class="income-column">
          <div class="text-overline">💰 Ingreso Esperado</div>
          <div class="text-h5 flex items-center q-gutter-sm">
            <template v-if="!editingExpectedIncome">
              {{ formatCurrency(expectedIncome) }}
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="edit"
                color="white"
                @click="startEditingExpectedIncome"
              >
                <q-tooltip>Editar ingreso esperado</q-tooltip>
              </q-btn>
            </template>
            <template v-else>
              <q-input
                v-model.number="newExpectedIncome"
                type="number"
                dense
                dark
                outlined
                class="expected-income-input"
                :prefix="auth.user?.currency?.symbol || '$'"
                :loading="savingExpectedIncome"
                @keyup.enter="saveExpectedIncome"
                @keyup.escape="cancelEditingExpectedIncome"
                autofocus
              >
                <template #append>
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="check"
                    color="positive"
                    @click="saveExpectedIncome"
                    :disable="savingExpectedIncome"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="close"
                    color="negative"
                    @click="cancelEditingExpectedIncome"
                    :disable="savingExpectedIncome"
                  />
                </template>
              </q-input>
            </template>
          </div>
          <div class="text-caption" v-if="expectedIncome === 0 && !editingExpectedIncome">
            <router-link to="/app/config" class="text-white text-bold">
              Configura aquí
            </router-link>
          </div>
        </div>

        <!-- Columna 2: Ingreso Real -->
        <div class="income-column">
          <div class="text-overline">
            📊 Ingreso Real
            <q-spinner v-if="calculatedIncomeLoading" size="12px" class="q-ml-xs" />
          </div>
          <div class="text-h5">
            {{ formatCurrency(calculatedIncome) }}
            <span v-if="expectedIncome > 0" class="text-body2">
              ({{ fulfillmentPercentage }}%)
            </span>
          </div>
          <div class="text-caption" :class="differenceClass">
            <template v-if="expectedIncome > 0">
              <q-icon :name="difference >= 0 ? 'trending_up' : 'trending_down'" size="14px" />
              {{ difference >= 0 ? '+' : '' }}{{ formatCurrency(difference) }}
            </template>
            <template v-else> Esperando transacciones... </template>
          </div>
        </div>

        <q-separator vertical dark class="income-separator" />

        <!-- Columna 3: Total Asignado -->
        <div class="income-column">
          <div class="text-overline">Total Asignado</div>
          <div class="text-h5">{{ formatCurrency(totalAssigned) }}</div>
          <div class="text-caption">
            <span v-if="useRealIncome"> {{ assignedPercentageReal }}% del real </span>
            <span v-else> {{ assignedPercentage }}% del esperado </span>
          </div>
        </div>

        <!-- Columna 4: Disponible -->
        <div class="income-column">
          <div class="text-overline">Disponible</div>
          <div class="text-h5" :class="availableClass">
            {{ formatCurrency(available) }}
          </div>
          <div class="text-caption">{{ availablePercentage }}% restante</div>
        </div>

        <!-- Toggle: usar ingreso esperado o real -->
        <div class="income-toggle">
          <q-toggle v-model="useRealIncome" size="sm" color="white" label="Usar ingreso real" dark>
            <q-tooltip>
              Cambiar entre ingreso esperado (planificado) o real (transacciones)
            </q-tooltip>
          </q-toggle>
        </div>
      </div>
    </q-card-section>

    <!-- Barra de progreso -->
    <q-linear-progress :value="assignedPercentage / 100" :color="progressColor" size="8px" />

    <!-- Alertas -->
    <q-card-section v-if="showWarnings" class="q-pa-sm">
      <q-banner v-if="expectedIncome === 0" class="bg-warning text-white" dense rounded>
        <template #avatar>
          <q-icon name="warning" />
        </template>
        Define tu ingreso mensual esperado para planificar asignaciones
      </q-banner>

      <q-banner
        v-else-if="fulfillmentStatus === 'critical'"
        class="bg-negative text-white"
        dense
        rounded
      >
        <template #avatar>
          <q-icon name="error" />
        </template>
        {{ statusMessage }}
      </q-banner>

      <q-banner
        v-else-if="fulfillmentStatus === 'warning'"
        class="bg-warning text-white"
        dense
        rounded
      >
        <template #avatar>
          <q-icon name="warning" />
        </template>
        {{ statusMessage }}
      </q-banner>

      <q-banner
        v-else-if="fulfillmentStatus === 'excellent' && difference > 0"
        class="bg-positive text-white"
        dense
        rounded
      >
        <template #avatar>
          <q-icon name="celebration" />
        </template>
        {{ statusMessage }}
      </q-banner>

      <q-banner v-else-if="available < 0" class="bg-negative text-white q-mt-sm" dense rounded>
        <template #avatar>
          <q-icon name="error" />
        </template>
        Has asignado más de tu ingreso ({{ formatCurrency(Math.abs(available)) }} de exceso)
      </q-banner>

      <q-banner
        v-else-if="available > activeIncome * 0.1"
        class="bg-info text-white q-mt-sm"
        dense
        rounded
      >
        <template #avatar>
          <q-icon name="info" />
        </template>
        Tienes {{ formatCurrency(available) }} sin asignar a ningún cántaro
      </q-banner>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useCalculatedIncome } from 'src/composables/useCalculatedIncome';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

interface Props {
  totalAssigned: number;
  showWarnings?: boolean;
  autoRefresh?: boolean;
  month?: string; // Mes en formato YYYY-MM
}

const props = withDefaults(defineProps<Props>(), {
  showWarnings: true,
  autoRefresh: true,
});

// Emit para notificar al padre cuando se actualiza el ingreso
const emit = defineEmits<{
  incomeUpdated: [];
}>();

// Modelo para toggle de ingreso esperado/real
const useRealIncome = defineModel<boolean>('useRealIncome', { default: false });

const auth = useAuthStore();
const {
  loading: calculatedIncomeLoading,
  expectedIncome,
  calculatedIncome,
  difference,
  fulfillmentPercentage,
  fulfillmentStatus,
  statusMessage,
  fetchCalculatedIncome,
} = useCalculatedIncome();

// Estado para edición del ingreso esperado
const editingExpectedIncome = ref(false);
const newExpectedIncome = ref<number>(0);
const savingExpectedIncome = ref(false);

function startEditingExpectedIncome() {
  newExpectedIncome.value = expectedIncome.value;
  editingExpectedIncome.value = true;
}

function cancelEditingExpectedIncome() {
  editingExpectedIncome.value = false;
  newExpectedIncome.value = 0;
}

async function saveExpectedIncome() {
  if (savingExpectedIncome.value) return;

  if (!newExpectedIncome.value || newExpectedIncome.value <= 0) {
    Notify.create({
      type: 'negative',
      message: 'El ingreso esperado debe ser mayor a 0',
      position: 'top',
    });
    return;
  }

  savingExpectedIncome.value = true;

  try {
    const payload: { monthly_income: number; month?: string } = {
      monthly_income: newExpectedIncome.value,
    };

    // Enviar el mes si está disponible
    if (props.month) {
      payload.month = props.month;
    }

    console.log('[MonthlyIncomePanel] Saving income:', payload);

    const response = await api.put('/user/profile', payload);

    console.log('[MonthlyIncomePanel] Save response:', response.data);

    // Solo actualizar el store si estamos editando el mes actual
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!props.month || props.month === currentMonth) {
      if (auth.user) {
        auth.user.monthly_income = newExpectedIncome.value;
      }
    }

    // Refrescar los datos calculados para el mes específico
    await fetchCalculatedIncome(props.month);

    // Emitir evento para que el padre actualice sus datos
    emit('incomeUpdated');

    Notify.create({
      type: 'positive',
      message: 'Ingreso esperado actualizado correctamente',
      position: 'top',
    });

    editingExpectedIncome.value = false;
  } catch (error) {
    console.error('Error updating expected income:', error);
    Notify.create({
      type: 'negative',
      message: 'Error al actualizar el ingreso esperado',
      position: 'top',
    });
  } finally {
    savingExpectedIncome.value = false;
  }
}

/**
 * Ingreso activo (según toggle)
 */
const activeIncome = computed(() => {
  return useRealIncome.value ? calculatedIncome.value : expectedIncome.value;
});

const available = computed(() => activeIncome.value - props.totalAssigned);

const assignedPercentage = computed(() => {
  if (expectedIncome.value === 0) return 0;
  return Math.round((props.totalAssigned / expectedIncome.value) * 100);
});

const assignedPercentageReal = computed(() => {
  if (calculatedIncome.value === 0) return 0;
  return Math.round((props.totalAssigned / calculatedIncome.value) * 100);
});

const availablePercentage = computed(() => {
  if (activeIncome.value === 0) return 100;
  return Math.max(0, 100 - Math.round((props.totalAssigned / activeIncome.value) * 100));
});

const availableClass = computed(() => {
  if (available.value < 0) return 'text-negative';
  if (available.value === 0) return 'text-positive';
  return 'text-white';
});

const differenceClass = computed(() => {
  if (difference.value > 0) return 'text-positive';
  if (difference.value < 0) return 'text-negative';
  return '';
});

const progressColor = computed(() => {
  const pct = useRealIncome.value ? assignedPercentageReal.value : assignedPercentage.value;
  if (pct > 100) return 'negative';
  if (pct === 100) return 'positive';
  if (pct >= 80) return 'warning';
  return 'primary';
});

function formatCurrency(amount: number): string {
  const symbol = auth.user?.currency?.symbol || '$';
  const align = auth.user?.currency?.align || 'left';
  const formatted = Math.abs(amount).toFixed(2);

  if (align === 'right') {
    return `${formatted}${symbol}`;
  }
  return `${symbol}${formatted}`;
}

// Cargar ingresos calculados al montar
onMounted(() => {
  if (props.autoRefresh) {
    void fetchCalculatedIncome(props.month);
  }
});

// Exponer método de refresh para el componente padre
defineExpose({
  refresh: fetchCalculatedIncome,
});

// Watch para refrescar cuando cambie el mes
watch(
  () => props.month,
  (newMonth) => {
    if (props.autoRefresh) {
      console.log('[MonthlyIncomePanel] Month changed to:', newMonth);
      void fetchCalculatedIncome(newMonth);
    }
  }
);

// Watch para refrescar cuando cambie el usuario
watch(
  () => auth.user?.id,
  () => {
    if (props.autoRefresh) {
      void fetchCalculatedIncome(props.month);
    }
  }
);
</script>

<style scoped lang="scss">
.monthly-income-panel {
  margin-bottom: 1rem;

  .text-overline {
    opacity: 0.8;
    font-size: 0.7rem;
  }
}

.income-dual-view {
  display: grid;
  grid-template-columns: 1fr 1fr auto 1fr 1fr auto;
  gap: 1rem;
  align-items: center;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    .income-separator {
      display: none;
    }

    .income-toggle {
      grid-column: 1 / -1;
      justify-self: center;
      margin-top: 0.5rem;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;

    .income-column {
      text-align: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);

      &:last-of-type {
        border-bottom: none;
      }
    }
  }
}

.income-column {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.income-separator {
  height: 60px;
  margin: 0 0.5rem;
}

.income-toggle {
  grid-column: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.75rem;
}

.expected-income-input {
  max-width: 200px;

  :deep(.q-field__control) {
    height: 40px;
  }

  :deep(.q-field__native) {
    color: white;
    font-size: 1.25rem;
    font-weight: 500;
  }
}
</style>
