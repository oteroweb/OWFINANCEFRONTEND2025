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

export const useJarsStore = defineStore('jars', {
  state: () => ({
    jars: [] as JarLite[],
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
  },
  actions: {
    setJars(arr: JarLite[]) {
      this.jars = Array.isArray(arr) ? arr.slice() : [];
    },
  },
});
