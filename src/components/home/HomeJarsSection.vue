<template>
  <div class="jars-section">
    <div class="jars-section__header">
      <div class="jars-section__head-main">
        <h3 class="jars-section__title">Mis Cántaros</h3>
        <p class="jars-section__summary">
          Disponibilidad:
          <strong>{{ props.isHidden ? `${props.currency}••••` : `${props.currency}${fmtAmount(props.totalAvailable)}` }}</strong>
          · {{ fmtPercent(props.availabilityPercent) }} disponible
        </p>
      </div>
      <button class="jars-section__link" @click="router.push('/user/jars')">Ver detalles</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="jars-section__grid">
      <div v-for="i in 4" :key="i" class="jar-skeleton" />
    </div>

    <!-- Empty -->
    <div v-else-if="!(jars && jars.length)" class="jars-section__empty">
      <q-icon name="savings" size="48px" color="grey-4" />
      <p>No tienes cántaros. ¡Crea el primero!</p>
      <button class="jars-section__link" @click="router.push('/user/jars')">Crear cántaro</button>
    </div>

    <!-- Grid -->
    <div v-else class="jars-section__grid">
      <div
        v-for="jar in displayJars"
        :key="jar.id"
        class="jar-card"
        @click="router.push(`/user/jars/${jar.id}`)"
        role="button"
        tabindex="0"
        @keydown.enter="router.push(`/user/jars/${jar.id}`)"
      >
        <!-- Circular SVG progress ring -->
        <div class="jar-card__ring-wrap">
          <svg class="jar-card__svg" viewBox="0 0 80 80">
            <circle class="jar-card__track" cx="40" cy="40" r="34" />
            <circle
              class="jar-card__progress"
              cx="40" cy="40" r="34"
              :style="ringStyle(jar.progress, jar.color)"
            />
          </svg>
          <div class="jar-card__icon-wrap">
            <q-icon name="savings" size="20px" :style="{ color: jar.color || '#0ea5e9' }" />
          </div>
        </div>

        <p class="jar-card__name">{{ jar.name }}</p>
        <p class="jar-card__amount">{{ isHidden ? `${currency}••••` : `${currency}${fmtAmount(jar.balance)}` }}</p>
      </div>

      <!-- Add card -->
      <div
        class="jar-card jar-card--add"
        @click="router.push('/user/jars')"
        role="button"
        tabindex="0"
        @keydown.enter="router.push('/user/jars')"
      >
        <q-icon name="add" size="28px" class="jar-card--add__icon" />
        <p class="jar-card--add__label">Crear Cántaro</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

interface Jar {
  id: number;
  name: string;
  balance: number;
  progress: number;
  color?: string;
}

interface Props {
  jars?: Jar[];
  isLoading?: boolean;
  currency?: string;
  isHidden?: boolean;
  totalAvailable?: number;
  availabilityPercent?: number;
}

const props = withDefaults(defineProps<Props>(), {
  jars: () => [],
  isLoading: false,
  currency: '$',
  isHidden: false,
  totalAvailable: 0,
  availabilityPercent: 0,
});

const router = useRouter();

// Show max 7 jars so there's always room for the "add" card
const displayJars = computed(() => (props.jars ?? []).slice(0, 7));

const CIRCUMFERENCE = 2 * Math.PI * 34; // ≈ 213.6

function ringStyle(progress: number, color?: string) {
  const clamped = Math.min(100, Math.max(0, progress ?? 0));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  return {
    strokeDasharray: `${CIRCUMFERENCE}`,
    strokeDashoffset: `${offset}`,
    stroke: color || '#0ea5e9',
  };
}

function fmtAmount(n: number) {
  return n.toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtPercent(n: number) {
  return `${Math.max(0, Math.min(100, Number(n || 0))).toFixed(0)}%`;
}
</script>

<style lang="scss" scoped>
.jars-section {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__head-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-family: 'Manrope', 'DM Sans', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;

    .body--dark & { color: #f1f5f9; }
  }

  &__link {
    background: none;
    border: none;
    color: #0ea5e9;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    padding: 4px 0;
    transition: opacity 160ms;

    &:hover { opacity: 0.7; text-decoration: underline; }
  }

  &__summary {
    margin: 0;
    font-size: 12px;
    color: #64748b;
    font-weight: 600;

    strong {
      color: #0f172a;
      font-weight: 800;
      font-family: 'Manrope', 'DM Sans', sans-serif;
    }

    .body--dark & {
      color: #94a3b8;

      strong {
        color: #f1f5f9;
      }
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 16px;
    color: #94a3b8;
    font-size: 14px;
    text-align: center;

    p { margin: 0; }
  }
}

.jar-skeleton {
  height: 180px;
  border-radius: 28px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease-in-out infinite;

  .body--dark & {
    background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
    background-size: 400% 100%;
  }
}

.jar-card {
  background: white;
  border-radius: 32px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  transition: all 200ms cubic-bezier(0.23, 1, 0.32, 1);
  min-height: 170px;
  justify-content: center;

  .body--dark & {
    background: #1e293b;
    border-color: #334155;
  }

  &:hover {
    border-color: rgba(14, 165, 233, 0.35);
    box-shadow: 0 8px 32px rgba(14, 165, 233, 0.12);
    transform: translateY(-2px);
  }

  &:active { transform: scale(0.97); }

  &__ring-wrap {
    position: relative;
    width: 72px;
    height: 72px;
    margin-bottom: 14px;
  }

  &__svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  &__track {
    fill: transparent;
    stroke: #f1f5f9;
    stroke-width: 5;

    .body--dark & { stroke: #334155; }
  }

  &__progress {
    fill: transparent;
    stroke-width: 5;
    stroke-linecap: round;
    transition: stroke-dashoffset 600ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  &__icon-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__name {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #94a3b8;
    margin: 0 0 6px;
  }

  &__amount {
    font-family: 'Manrope', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;

    .body--dark & { color: #f1f5f9; }
  }

  // Add card variant
  &--add {
    background: transparent;
    border: 2px dashed #e2e8f0;

    .body--dark & { border-color: #334155; }

    &:hover {
      border-color: #0ea5e9;
      transform: translateY(-2px);

      .jar-card--add__icon,
      .jar-card--add__label { color: #0ea5e9; }
    }

    &__icon { color: #cbd5e1; }

    &__label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #cbd5e1;
      margin: 6px 0 0;
    }
  }
}

@keyframes shimmer {
  0% { background-position: 400% 0; }
  100% { background-position: -400% 0; }
}
</style>
