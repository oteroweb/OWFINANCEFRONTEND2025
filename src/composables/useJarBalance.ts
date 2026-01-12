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
  balance: number;         // asignado - gastado + ajuste
  porcentaje_utilizado: number; // % of usage
  modo_refresco: 'acumulativo' | 'reinicio'; // Refresh mode
};

/**
 * Adjustment item in history
 */
export type JarAdjustment = {
  id: number;
  jar_id: number;
  monto: number;           // Amount (positive or negative)
  descripcion?: string;
  usuario_id: number;
  creado_en: string;       // ISO timestamp
  actualizado_en: string;
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
  async function cargarBalance() {
    if (!jarId) {
      state.value.error = 'Jar ID no disponible';
      return;
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      const res = await api.get<JarBalance>(
        `/jars/${jarId}/balance`
      );

      state.value.balance = res.data;
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
      const res = await api.get<JarAdjustment[]>(
        `/jars/${jarId}/adjustments`
      );

      state.value.adjustments = res.data || [];
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
  async function cargarTodo() {
    await Promise.all([cargarBalance(), cargarHistorial()]);
  }

  /**
   * Crea un nuevo ajuste
   * POST /jars/{jarId}/adjust (usuario identificado por token)
   *
   * @param ajuste - Objeto con monto y descripción opcional
   * @throws Error si falla la petición
   */
  async function crearAjuste(ajuste: {
    monto: number;
    descripcion?: string;
  }) {
    if (!jarId) {
      const msg = 'Jar ID no disponible';
      state.value.error = msg;
      throw new Error(msg);
    }

    // Validaciones
    if (!ajuste.monto || Number.isNaN(ajuste.monto)) {
      const msg = 'El monto debe ser un número válido';
      state.value.error = msg;
      throw new Error(msg);
    }

    if (ajuste.monto === 0) {
      const msg = 'El monto no puede ser cero';
      state.value.error = msg;
      throw new Error(msg);
    }

    // Si es decremento, validar que no exceda balance disponible
    if (ajuste.monto < 0 && state.value.balance) {
      const nuevoBalance = state.value.balance.balance + ajuste.monto;
      if (nuevoBalance < 0) {
        const msg = `No puedes restar ${Math.abs(ajuste.monto)}. Balance disponible: ${state.value.balance.balance}`;
        state.value.error = msg;
        throw new Error(msg);
      }
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      const res = await api.post<JarAdjustment>(
        `/jars/${jarId}/adjust`,
        {
          amount: ajuste.monto,
          reason: ajuste.descripcion || null,
        }
      );

      // Agregar nuevo ajuste al historial
      state.value.adjustments.push(res.data);

      // Actualizar balance local
      if (state.value.balance) {
        state.value.balance.ajuste += ajuste.monto;
        state.value.balance.balance =
          state.value.balance.asignado -
          state.value.balance.gastado +
          state.value.balance.ajuste;
        state.value.balance.porcentaje_utilizado = Math.min(
          100,
          Math.round(
            (state.value.balance.gastado / state.value.balance.asignado) * 100
          )
        );
      }

      return res.data;
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
