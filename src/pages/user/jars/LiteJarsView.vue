<template>
  <q-page class="lite-page">
    <div class="lite-page__container">
      <div>
        <span class="t-eyebrow">Cántaros</span>
        <h1 class="t-h1" style="margin: 6px 0 0">Tu dinero, repartido</h1>
      </div>

      <!-- Hero -->
      <div class="hero-card">
        <div class="hero-card__content">
          <div>
            <span class="t-eyebrow">Total en cántaros · USD</span>
            <span class="t-hero-amount">{{ isHidden ? '••••••' : formatMoney(totalJars) }}</span>
            <span class="t-body-sm">{{ activeJars.length }} cántaros activos</span>
          </div>
          <button class="add-btn" @click="goToJars">
            <q-icon name="add" size="18px" />
            <span>Nuevo cántaro</span>
          </button>
        </div>
      </div>

      <!-- Grid -->
      <div v-if="jarsLoading" class="skeleton-card">
        <div class="skeleton-line" style="width: 100%; height: 80px;" />
      </div>
      <div v-else-if="activeJars.length === 0" class="empty-card">
        <q-icon name="savings" size="32px" color="grey-5" />
        <p class="t-body">No tienes cántaros activos.</p>
        <button class="ghost-btn" @click="goToJars">Crear cántaro</button>
      </div>
      <div v-else class="jars-grid">
        <div
          v-for="jar in activeJars"
          :key="jar.id"
          class="jar-card"
          @click="goToJars"
        >
          <div class="jar-card__header">
            <span class="jar-card__dot" :style="{ background: jar.color || 'var(--info)' }" />
            <span class="t-label">{{ jar.name }}</span>
          </div>
          <span class="t-amount-md">{{ isHidden ? '••••••' : formatMoney(jar.balance) }}</span>
          <div class="jar-card__bar">
            <div
              class="jar-card__progress"
              :style="{ width: `${Math.min(100, jar.progress)}%`, background: jar.color || 'var(--info)' }"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';

defineOptions({ name: 'LiteJarsView' });

const router = useRouter();
const ui = useUiStore();
const isHidden = computed(() => ui.hideValues);

interface JarItem {
  id: number;
  name: string;
  balance: number;
  allocated: number;
  progress: number;
  color?: string;
}

const activeJars = ref<JarItem[]>([]);
const jarsLoading = ref(false);

const totalJars = computed(() => activeJars.value.reduce((sum, j) => sum + j.balance, 0));

function formatMoney(n: number): string {
  const abs = Math.abs(n);
  return `$ ${abs.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function goToJars() {
  void router.push('/user/jars');
}

async function loadJars() {
  jarsLoading.value = true;
  try {
    const jarsRes = await api.get('/jars', { params: { per_page: 100 } });
    const raw = jarsRes.data?.data;
    const jarsData: Record<string, unknown>[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? (raw.data as Record<string, unknown>[]) : [];
    const now = new Date();
    const balDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const results = await Promise.all(
      jarsData.map(async (jar): Promise<JarItem | null> => {
        try {
          const jarId = Number(jar.id);
          const balRes = await api.get(`/jars/${jarId}/balance`, { params: { date: balDate } });
          const bal = balRes.data?.data || {};
          const assigned = Number(bal.allocated_amount || 0);
          const balance = Number(bal.available_balance || 0);
          const progress = assigned > 0 ? Math.min(100, Math.round((assigned - balance) / assigned * 100)) : 0;
          return {
            id: jarId,
            name: typeof jar.name === 'string' ? jar.name : 'Cántaro',
            balance,
            allocated: assigned,
            progress,
            color: (jar.color as string) || 'var(--info)',
          };
        } catch { return null; }
      })
    );
    activeJars.value = results.filter((j): j is JarItem => j !== null && j !== undefined);
    const totalAllocated = activeJars.value.reduce((acc, jar) => acc + Math.max(0, jar.allocated), 0);
    const totalAvailable = activeJars.value.reduce((acc, jar) => acc + Math.max(0, jar.balance), 0);
    const availabilityPercent = totalAllocated > 0 ? (totalAvailable / totalAllocated) * 100 : 0;
    const usedPercent = totalAllocated > 0 ? 100 - availabilityPercent : 0;
    ui.setJarStatus({
      totalAllocated,
      totalAvailable,
      availabilityPercent: Math.max(0, Math.min(100, availabilityPercent)),
      usedPercent: Math.max(0, Math.min(100, usedPercent)),
      jarCount: activeJars.value.length,
    });
  } catch (err) {
    console.warn('[LiteJars] Jars error:', err);
  } finally {
    jarsLoading.value = false;
  }
}

onMounted(() => {
  void loadJars();
});
</script>

<style scoped lang="scss">
.lite-page {
  background: var(--bg-canvas);
  min-height: 100vh;

  &__container {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 24px 32px 140px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
}

.hero-card {
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-card);

  &__content {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;

    > div {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 0;
  cursor: pointer;
  border-radius: var(--radius-pill);
  background: var(--brand-primary);
  color: var(--fg-on-brand);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  transition: background var(--dur-base) var(--ease-out), transform 80ms ease;

  &:hover {
    background: var(--brand-primary-hover);
  }

  &:active {
    transform: scale(0.98);
  }
}

.jars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.jar-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: box-shadow var(--dur-base) var(--ease-out);

  &:hover {
    box-shadow: var(--shadow-hover);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__bar {
    height: 5px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
    margin-top: 10px;
  }

  &__progress {
    height: 100%;
    border-radius: 3px;
    transition: width var(--dur-slow) var(--ease-out);
  }
}

.empty-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  box-shadow: var(--shadow-card);
}

.ghost-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-primary);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: background var(--dur-base) var(--ease-out);

  &:hover {
    background: var(--brand-primary-soft);
  }
}

.skeleton-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.skeleton-line {
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s infinite;
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 768px) {
  .lite-page__container {
    padding: 16px 16px 120px;
    gap: 20px;
  }

  .hero-card {
    padding: 20px;

    &__content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }

  .jars-grid {
    grid-template-columns: 1fr;
  }
}
</style>
