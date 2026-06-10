<template>
  <q-page class="showcase-page">
    <div class="showcase-wrap">
      <div class="showcase-head">
        <div>
          <p class="showcase-kicker">UI Playground</p>
          <h1 class="showcase-title">Selectores de Intervalo para Home</h1>
          <p class="showcase-subtitle">
            Comparativa de componentes minimalistas basados en el widget legacy.
          </p>
        </div>

        <q-btn
          no-caps
          unelevated
          color="primary"
          label="Volver al Home"
          icon="arrow_back"
          class="showcase-back"
          @click="router.push('/user/home')"
        />
      </div>

      <section class="showcase-card">
        <div class="showcase-card__head">
          <h2>1) Tabs Legacy Minimal</h2>
          <span>Recomendado</span>
        </div>
        <HomePeriodSelectorTabs
          v-model="tabsValue"
          :month-label="tabsLabel"
          @shift="shiftTabs"
        />
      </section>

      <section class="showcase-card">
        <div class="showcase-card__head">
          <h2>2) Chips Simple</h2>
          <span>Muy limpio</span>
        </div>
        <HomePeriodSelectorChips v-model="chipsValue" />
      </section>

      <section class="showcase-card">
        <div class="showcase-card__head">
          <h2>3) Compact Select</h2>
          <span>Ultra compacto</span>
        </div>
        <HomePeriodSelectorCompact v-model="compactValue" @shift="shiftCompact" />
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import HomePeriodSelectorTabs from 'src/components/home/periods/HomePeriodSelectorTabs.vue';
import HomePeriodSelectorChips from 'src/components/home/periods/HomePeriodSelectorChips.vue';
import HomePeriodSelectorCompact from 'src/components/home/periods/HomePeriodSelectorCompact.vue';
import type { HomeIntervalKey as TabsIntervalKey } from 'src/components/home/periods/HomePeriodSelectorTabs.vue';
import type { HomeIntervalKey as ChipsIntervalKey } from 'src/components/home/periods/HomePeriodSelectorChips.vue';
import type { HomeIntervalKey as CompactIntervalKey } from 'src/components/home/periods/HomePeriodSelectorCompact.vue';

defineOptions({ name: 'HomeComponentsShowcasePage' });

const router = useRouter();

const tabsValue = ref<TabsIntervalKey>('month');
const chipsValue = ref<ChipsIntervalKey>('month');
const compactValue = ref<CompactIntervalKey>('month');
const anchor = ref(new Date());

const tabsLabel = computed(() =>
  anchor.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
);

function shiftTabs(direction: -1 | 1) {
  const next = new Date(anchor.value);

  if (tabsValue.value === 'year') {
    next.setFullYear(next.getFullYear() + direction);
  } else if (tabsValue.value === 'week') {
    next.setDate(next.getDate() + (7 * direction));
  } else if (tabsValue.value === 'day') {
    next.setDate(next.getDate() + direction);
  } else if (tabsValue.value === 'fortnight') {
    next.setDate(next.getDate() + (14 * direction));
  } else {
    next.setMonth(next.getMonth() + direction);
  }

  anchor.value = next;
}

function shiftCompact(direction: -1 | 1) {
  const next = new Date(anchor.value);
  if (compactValue.value === 'year') {
    next.setFullYear(next.getFullYear() + direction);
  } else if (compactValue.value === 'week') {
    next.setDate(next.getDate() + (7 * direction));
  } else {
    next.setMonth(next.getMonth() + direction);
  }
  anchor.value = next;
}
</script>

<style scoped lang="scss">
.showcase-page {
  background: #f8fafc;
  min-height: 100vh;

  .body--dark & {
    background: #0f172a;
  }
}

.showcase-wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 18px 120px;
}

.showcase-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;

  @media (max-width: 760px) {
    flex-direction: column;
  }
}

.showcase-kicker {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  font-weight: 700;
  color: #64748b;
}

.showcase-title {
  margin: 0;
  font-family: 'Manrope', 'DM Sans', sans-serif;
  color: #0f172a;
  font-size: clamp(1.3rem, 2.5vw, 1.9rem);

  .body--dark & {
    color: #e2e8f0;
  }
}

.showcase-subtitle {
  margin: 8px 0 0;
  color: #64748b;

  .body--dark & {
    color: #94a3b8;
  }
}

.showcase-back {
  border-radius: 9999px;
}

.showcase-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 14px;

  .body--dark & {
    background: #1a1a2e;
    box-shadow: 0 10px 28px rgba(14, 165, 233, 0.15);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;

    h2 {
      margin: 0;
      font-size: 15px;
      color: #0f172a;

      .body--dark & {
        color: #e2e8f0;
      }
    }

    span {
      font-size: 11px;
      background: #f1f4f6;
      color: #64748b;
      padding: 4px 10px;
      border-radius: 9999px;
      font-weight: 700;

      .body--dark & {
        background: #222a3d;
        color: #94a3b8;
      }
    }
  }
}
</style>
