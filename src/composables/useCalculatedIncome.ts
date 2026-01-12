import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';

/**
 * Composable para obtener y gestionar ingresos calculados del mes actual
 *
 * Este composable maneja:
 * - Ingreso esperado (monthly_income configurado por usuario)
 * - Ingreso real (calculado desde transacciones del mes)
 * - Diferencia entre esperado y real
 * - Porcentaje de cumplimiento
 */
export function useCalculatedIncome() {
  const auth = useAuthStore();

  const loading = ref(false);
  const error = ref<string | null>(null);
  const calculatedIncome = ref(0);
  const lastUpdated = ref<Date | null>(null);

  /**
   * Ingreso esperado (configurado manualmente por usuario)
   */
  const expectedIncome = computed(() => {
    return auth.user?.monthly_income || 0;
  });

  /**
   * Diferencia entre ingreso real y esperado
   * Positivo: ganó más de lo esperado
   * Negativo: ganó menos de lo esperado
   */
  const difference = computed(() => {
    return calculatedIncome.value - expectedIncome.value;
  });

  /**
   * Porcentaje de cumplimiento de ingreso esperado
   * 100% = cumplió exactamente
   * > 100% = superó expectativas
   * < 100% = no alcanzó expectativas
   */
  const fulfillmentPercentage = computed(() => {
    if (expectedIncome.value === 0) return 0;
    return Math.round((calculatedIncome.value / expectedIncome.value) * 100);
  });

  /**
   * Estado del cumplimiento
   */
  const fulfillmentStatus = computed<'excellent' | 'good' | 'warning' | 'critical'>(() => {
    const pct = fulfillmentPercentage.value;
    if (pct >= 100) return 'excellent';
    if (pct >= 90) return 'good';
    if (pct >= 70) return 'warning';
    return 'critical';
  });

  /**
   * Mensaje descriptivo del estado
   */
  const statusMessage = computed(() => {
    const pct = fulfillmentPercentage.value;
    const diff = Math.abs(difference.value);

    if (expectedIncome.value === 0) {
      return 'Configura tu ingreso mensual esperado';
    }

    if (pct >= 100) {
      return difference.value > 0
        ? `¡Superaste tu meta por $${diff.toFixed(2)}!`
        : '¡Alcanzaste tu meta exacta!';
    }

    if (pct >= 90) {
      return `Estás cerca de tu meta (faltan $${diff.toFixed(2)})`;
    }

    return `Faltan $${diff.toFixed(2)} para alcanzar tu meta`;
  });

  /**
   * Obtiene el ingreso calculado del backend
   * Endpoint: GET /api/v1/jars/income-summary
   */
  async function fetchCalculatedIncome() {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/jars/income-summary');
      const data = response.data;

      // El backend puede devolver data directo o data.data
      const summary = data.data || data;

      calculatedIncome.value = summary.calculated_income || 0;
      lastUpdated.value = new Date();

      return summary;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      error.value = err.response?.data?.message || 'Error al obtener ingresos calculados';
      console.error('Error fetching calculated income:', e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Refresca los datos (útil después de crear/editar transacciones)
   */
  async function refresh() {
    return fetchCalculatedIncome();
  }

  return {
    // Estado
    loading,
    error,
    lastUpdated,

    // Valores
    expectedIncome,
    calculatedIncome,
    difference,
    fulfillmentPercentage,
    fulfillmentStatus,
    statusMessage,

    // Métodos
    fetchCalculatedIncome,
    refresh,
  };
}
