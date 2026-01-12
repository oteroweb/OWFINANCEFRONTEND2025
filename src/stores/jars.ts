import { defineStore } from 'pinia';

export type JarLite = {
  uid: string;
  name: string;
  type: 'percent' | 'fixed';
  percent?: number | undefined;
  fixedAmount?: number | undefined;
  color?: string | undefined;
  active?: boolean;
};

/**
 * Balance information for a jar
 * Returned from balance endpoints
 */
export type JarBalanceInfo = {
  id?: number;
  jar_id: number;
  asignado: number;        // Total assigned from transactions
  gastado: number;         // Total spent
  ajuste: number;          // Manual adjustment
  balance: number;         // asignado - gastado + ajuste
  porcentaje_utilizado: number; // % of usage
  modo_refresco?: 'acumulativo' | 'reinicio'; // Refresh mode
};

/**
 * Adjustment record in history
 */
export type JarAdjustmentRecord = {
  id: number;
  jar_id: number;
  monto: number;           // Amount (positive or negative)
  descripcion?: string;
  usuario_id: number;
  creado_en: string;       // ISO timestamp
  actualizado_en: string;
};

export const useJarsStore = defineStore('jars', {
  state: () => ({
    jars: [] as JarLite[],
    // Balance info keyed by jar ID
    balances: {} as Record<number, JarBalanceInfo>,
    // Adjustment history keyed by jar ID
    adjustments: {} as Record<number, JarAdjustmentRecord[]>,
    // Loading states
    loadingBalance: {} as Record<number, boolean>,
    balanceErrors: {} as Record<number, string | null>,
  }),
  getters: {
    totalPercentage(state): number {
      const sum = state.jars
        .filter((j) => j.type === 'percent' && (j.active ?? true))
        .reduce((acc, j) => acc + (Number(j.percent) || 0), 0);
      return Math.round(sum * 100) / 100;
    },
    hasFixedJar(state): boolean {
      return state.jars.some((j) => j.type === 'fixed' && (j.active ?? true));
    },
    activeJars(state): JarLite[] {
      return state.jars.filter((j) => j.active ?? true);
    },
    /**
     * Get balance for a specific jar
     */
    getJarBalance: (state) => (jarId: number) => {
      return state.balances[jarId] || null;
    },
    /**
     * Get adjustments for a specific jar
     */
    getJarAdjustments: (state) => (jarId: number) => {
      return state.adjustments[jarId] || [];
    },
    /**
     * Get total balance across all jars
     */
    totalBalance(state): number {
      return Object.values(state.balances).reduce((sum, b) => sum + (b.balance || 0), 0);
    },
    /**
     * Get total spent across all jars
     */
    totalSpent(state): number {
      return Object.values(state.balances).reduce((sum, b) => sum + (b.gastado || 0), 0);
    },
    /**
     * Get total assigned across all jars
     */
    totalAssigned(state): number {
      return Object.values(state.balances).reduce((sum, b) => sum + (b.asignado || 0), 0);
    },
  },
  actions: {
    setJars(arr: JarLite[]) {
      this.jars = Array.isArray(arr) ? arr.slice() : [];
    },
    /**
     * Set balance information for a jar
     */
    setJarBalance(jarId: number, balance: JarBalanceInfo) {
      this.balances[jarId] = balance;
      this.balanceErrors[jarId] = null;
    },
    /**
     * Set adjustment history for a jar
     */
    setJarAdjustments(jarId: number, adjustments: JarAdjustmentRecord[]) {
      this.adjustments[jarId] = adjustments;
    },
    /**
     * Add a single adjustment to the history
     */
    addJarAdjustment(jarId: number, adjustment: JarAdjustmentRecord) {
      if (!this.adjustments[jarId]) {
        this.adjustments[jarId] = [];
      }
      this.adjustments[jarId].push(adjustment);
    },
    /**
     * Update balance after adjustment
     */
    updateJarBalanceAfterAdjustment(jarId: number, monto: number) {
      const balance = this.balances[jarId];
      if (balance) {
        balance.ajuste += monto;
        balance.balance = balance.asignado - balance.gastado + balance.ajuste;
        balance.porcentaje_utilizado = Math.min(
          100,
          Math.round((balance.gastado / balance.asignado) * 100)
        );
      }
    },
    /**
     * Reset adjustment for a jar
     */
    resetJarAdjustment(jarId: number) {
      const balance = this.balances[jarId];
      if (balance) {
        balance.ajuste = 0;
        balance.balance = balance.asignado - balance.gastado;
        balance.porcentaje_utilizado = Math.min(
          100,
          Math.round((balance.gastado / balance.asignado) * 100)
        );
      }
    },
    /**
     * Set loading state for a jar
     */
    setLoadingBalance(jarId: number, loading: boolean) {
      this.loadingBalance[jarId] = loading;
    },
    /**
     * Set error for a jar balance
     */
    setBalanceError(jarId: number, error: string | null) {
      this.balanceErrors[jarId] = error;
    },
    /**
     * Clear all balance data
     */
    clearBalances() {
      this.balances = {};
      this.adjustments = {};
      this.loadingBalance = {};
      this.balanceErrors = {};
    },
  },
});
