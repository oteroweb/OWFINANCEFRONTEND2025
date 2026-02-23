import { ref, computed } from 'vue';
import { api } from 'boot/axios';

/**
 * Balance structure returned by backend
 */
export type JarBalance = {
  id: number;
  jar_id: number;
  asignado: number;        // Total assigned from transactions
  gastado: number;         // Total spent
  ajuste: number;          // Manual adjustment
  retiros?: number;        // Withdrawals/usage
  transfers_in?: number;   // Transfers into jar
  transfers_out?: number;  // Transfers out of jar
  leverage_in?: number;    // Virtual leverage into jar
  leverage_out?: number;   // Virtual leverage out of jar
  saldo_anterior?: number; // Previous month balance (carry-over for accumulative)
  balance: number;         // asignado - gastado + ajuste
  porcentaje_utilizado: number; // % of usage
  modo_refresco: 'acumulativo' | 'reinicio'; // Refresh mode
  auto_transfer_applied?: {
    id: number;
    amount: number;
    from_jar_id: number;
    to_jar_id: number;
    date: string;
  } | null;
};

/**
 * Adjustment item in history
 */
export type JarAdjustment = {
  id: number;
  amount: number;           // Amount (positive or negative)
  type: string;             // Type of adjustment
  reason?: string;
  previous_available: number;
  new_available: number;
  date: string;             // Date string
  created_at: string;       // ISO timestamp
  adjusted_by?: string;     // User name who made adjustment
};

/**
 * State for a single jar's balance operations
 */
export type BalanceState = {
  balance: JarBalance | null;
  adjustments: JarAdjustment[];
  loading: boolean;
  error: string | null;
};

/**
 * useJarBalance composable
 *
 * Manages balance loading, adjustment creation, and history for a single jar.
 *
 * @param jarId - The jar ID to manage balance for
 * @returns Object with balance state and actions
 *
 * @example
 * const { balance, adjustments, loading, cargarBalance, crearAjuste, resetearAjuste } =
 *   useJarBalance(jar.id);
 *
 * await cargarBalance();
 * await crearAjuste({ monto: 100, descripcion: 'Transferencia externa' });
 */
export function useJarBalance(jarId: number | null | undefined) {
  // State
  const state = ref<BalanceState>({
    balance: null,
    adjustments: [],
    loading: false,
    error: null,
  });

  // Computed
  const balance = computed(() => state.value.balance);
  const adjustments = computed(() => state.value.adjustments);
  const loading = computed(() => state.value.loading);
  const error = computed(() => state.value.error);

  /**
   * Calcula porcentaje de balance utilizado
   */
  const porcentajeUtilizado = computed(() => {
    const bal = state.value.balance;
    if (!bal || bal.asignado === 0) return 0;
    return Math.min(100, Math.round((bal.gastado / bal.asignado) * 100));
  });

  /**
   * Determina estado visual del balance
   * - 'low': < 30% usado
   * - 'medium': 30-70% usado
   * - 'high': 70-90% usado
   * - 'full': >= 90% usado
   */
  const statusBalance = computed(() => {
    const pct = porcentajeUtilizado.value;
    if (pct >= 90) return 'full';
    if (pct >= 70) return 'high';
    if (pct >= 30) return 'medium';
    return 'low';
  });

  /**
   * Carga balance desde backend
   * GET /jars/{jarId}/balance (usuario identificado por token)
   */
  async function cargarBalance(date?: string) {
    if (!jarId) {
      state.value.error = 'Jar ID no disponible';
      return;
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      console.log('[useJarBalance] Fetching balance', { jarId, date });
      const res = await api.get<{
        status: string;
        code: number;
        data: {
          jar_id: number;
          jar_name: string;
          type: string;
          refresh_mode: string;
          allocated_amount: number;
          spent_amount: number;
          adjustment: number;
          withdrawals?: number;
            transfers_in?: number;
            transfers_out?: number;
            leverage_in?: number;
            leverage_out?: number;
            previous_month_balance?: number;
          available_balance: number;
            auto_transfer_applied?: {
              id: number;
              amount: number;
              from_jar_id: number;
              to_jar_id: number;
              date: string;
            } | null;
          period: {
            month: string;
            start: string;
            end: string;
          };
        };
      }>(`/jars/${jarId}/balance`, {
        params: date ? { date } : undefined,
      });

      // Transformar respuesta del backend al formato esperado
      const data = res.data?.data;
      if (!data || typeof data.jar_id !== 'number') {
        const msg = 'Respuesta de balance inválida';
        console.error('[useJarBalance] Invalid balance response', res.data);
        state.value.error = msg;
        throw new Error(msg);
      }
      state.value.balance = {
        id: data.jar_id,
        jar_id: data.jar_id,
        asignado: data.allocated_amount,
        gastado: data.spent_amount,
        ajuste: data.adjustment,
        retiros: data.withdrawals ?? 0,
        transfers_in: data.transfers_in ?? 0,
        transfers_out: data.transfers_out ?? 0,
        leverage_in: data.leverage_in ?? 0,
        leverage_out: data.leverage_out ?? 0,
        saldo_anterior: data.previous_month_balance ?? 0,
        balance: data.available_balance,
        auto_transfer_applied: data.auto_transfer_applied ?? null,
        porcentaje_utilizado: data.allocated_amount > 0
          ? Math.min(100, Math.round((data.spent_amount / data.allocated_amount) * 100))
          : 0,
        modo_refresco: data.refresh_mode === 'reset' ? 'reinicio' : 'acumulativo',
      };
      console.log('[useJarBalance] Balance loaded', state.value.balance);
    } catch (err) {
      console.error('Error cargando balance:', err);
      state.value.error = err instanceof Error ? err.message : 'Error desconocido';
      throw err;
    } finally {
      state.value.loading = false;
    }
  }

  /**
   * Carga historial de ajustes
   * GET /jars/{jarId}/adjustments (usuario identificado por token)
   */
  async function cargarHistorial() {
    if (!jarId) {
      state.value.error = 'Jar ID no disponible';
      return;
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      const res = await api.get<{ status: string; code: number; data: JarAdjustment[] }>(
        `/jars/${jarId}/adjustments`
      );

      state.value.adjustments = res.data.data || [];
    } catch (err) {
      console.error('Error cargando ajustes:', err);
      state.value.error = err instanceof Error ? err.message : 'Error desconocido';
      throw err;
    } finally {
      state.value.loading = false;
    }
  }

  /**
   * Carga balance e historial simultáneamente
   */
  async function cargarTodo(date?: string) {
    await Promise.all([cargarBalance(date), cargarHistorial()]);
  }

  /**
   * Crea un nuevo ajuste estableciendo el balance objetivo
   * POST /jars/{jarId}/adjust (usuario identificado por token)
   *
   * @param ajuste - Objeto con valorObjetivo (balance deseado) y descripción opcional
   * @throws Error si falla la petición
   */
  async function crearAjuste(ajuste: {
    valorObjetivo: number;
    descripcion?: string;
    date?: string;
  }) {
    if (!jarId) {
      const msg = 'Jar ID no disponible';
      state.value.error = msg;
      throw new Error(msg);
    }

    // Validaciones - valorObjetivo puede ser cualquier número incluido negativo
    if (ajuste.valorObjetivo === null || ajuste.valorObjetivo === undefined || Number.isNaN(ajuste.valorObjetivo)) {
      const msg = 'El balance objetivo debe ser un número válido';
      state.value.error = msg;
      throw new Error(msg);
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      const res = await api.post<{
        status: string;
        code: number;
        message: string;
        data: {
          jar_id: number;
          jar_name: string;
          adjustment: JarAdjustment;
        };
      }>(
        `/jars/${jarId}/adjust`,
        {
          target_balance: ajuste.valorObjetivo,
          reason: ajuste.descripcion || null,
          date: ajuste.date || null,
        }
      );

      const adjustment = res.data.data.adjustment;

      // Agregar nuevo ajuste al historial
      state.value.adjustments.push(adjustment);

      // Actualizar balance local al valor objetivo
      if (state.value.balance) {
        // Calcular el ajuste incremental que se aplicó
        const ajusteAplicado = ajuste.valorObjetivo - state.value.balance.balance;
        state.value.balance.ajuste += ajusteAplicado;
        state.value.balance.balance = ajuste.valorObjetivo;
        state.value.balance.porcentaje_utilizado = state.value.balance.asignado > 0
          ? Math.min(100, Math.round((state.value.balance.gastado / state.value.balance.asignado) * 100))
          : 0;
      }

      return adjustment;
    } catch (err) {
      console.error('Error creando ajuste:', err);
      state.value.error = err instanceof Error ? err.message : 'Error desconocido';
      throw err;
    } finally {
      state.value.loading = false;
    }
  }

  /**
   * Resetea el ajuste actual
   * POST /jars/{jarId}/reset-adjustment (usuario identificado por token)
   */
  async function resetearAjuste() {
    if (!jarId) {
      const msg = 'Jar ID no disponible';
      state.value.error = msg;
      throw new Error(msg);
    }

    if (!state.value.balance || state.value.balance.ajuste === 0) {
      const msg = 'No hay ajuste para resetear';
      state.value.error = msg;
      throw new Error(msg);
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      const res = await api.post<{ success: boolean; balance: JarBalance }>(
        `/jars/${jarId}/reset-adjustment`
      );

      if (res.data.balance) {
        state.value.balance = res.data.balance;
      }

      // Limpiar historial de ajustes (opcional, depende del backend)
      // state.value.adjustments = [];

      return res.data;
    } catch (err) {
      console.error('Error reseteando ajuste:', err);
      state.value.error = err instanceof Error ? err.message : 'Error desconocido';
      throw err;
    } finally {
      state.value.loading = false;
    }
  }

  /**
   * Limpia el estado local sin afectar el backend
   */
  function limpiar() {
    state.value = {
      balance: null,
      adjustments: [],
      loading: false,
      error: null,
    };
  }

  return {
    // State
    balance,
    adjustments,
    loading,
    error,

    // Computed
    porcentajeUtilizado,
    statusBalance,

    // Actions
    cargarBalance,
    cargarHistorial,
    cargarTodo,
    crearAjuste,
    resetearAjuste,
    limpiar,
  };
}
