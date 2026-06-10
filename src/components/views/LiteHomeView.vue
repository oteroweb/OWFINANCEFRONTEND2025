<template>
  <q-page class="lite-home">
    <div class="lite-home__content">

      <!-- Hero Balance Card -->
      <section class="balance-card">
        <div class="balance-card__header">
          <div>
            <p class="balance-card__label">BALANCE TOTAL</p>
            <h2 class="balance-card__amount">{{ formatBalance(globalBalance) }}</h2>
          </div>
          <div class="balance-card__currency-pill">USD</div>
        </div>
        <div class="balance-card__pills">
          <div class="balance-pill">
            <q-icon name="arrow_upward" size="14px" class="income-color" />
            <span>${{ incomeTotal.toLocaleString() }}</span>
          </div>
          <div class="balance-pill">
            <q-icon name="arrow_downward" size="14px" class="expense-color" />
            <span>${{ expenseTotal.toLocaleString() }}</span>
          </div>
        </div>
        <div class="balance-card__filters">
          <button
            v-for="f in filters"
            :key="f"
            class="balance-filter"
            :class="{ 'balance-filter--active': activeFilter === f }"
            @click="activeFilter = f"
          >{{ f }}</button>
        </div>
      </section>

      <!-- Mis Cántaros -->
      <section class="jars-section">
        <div class="section-header">
          <h3 class="section-title">Mis Cántaros</h3>
          <button class="section-link">Ver todos</button>
        </div>
        <div class="jars-grid">
          <div v-for="jar in jars" :key="jar.name" class="jar-card">
            <div class="jar-card__top">
              <div class="jar-card__icon-wrap" :style="{ background: jar.iconBg }">
                <q-icon :name="jar.icon" size="20px" :style="{ color: jar.iconColor }" />
              </div>
              <div class="jar-card__ring-wrap">
                <svg viewBox="0 0 36 36" class="jar-ring">
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" stroke-width="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="transparent"
                    :stroke="jar.ringColor" stroke-width="3"
                    stroke-linecap="round"
                    :stroke-dasharray="`${jar.progress * 0.88} 88`"
                    stroke-dashoffset="22"
                  />
                </svg>
              </div>
            </div>
            <p class="jar-card__name">{{ jar.name }}</p>
            <p class="jar-card__amount">{{ formatBalance(jar.amount) }}</p>
          </div>
        </div>
      </section>

      <!-- Últimos Movimientos -->
      <section class="tx-section">
        <h3 class="section-title" style="margin-bottom:16px">Últimos Movimientos</h3>
        <div class="tx-list">
          <div v-for="tx in transactions" :key="tx.id" class="tx-item">
            <div class="tx-item__icon">
              <q-icon :name="tx.icon" size="22px" style="color:#64748b" />
            </div>
            <div class="tx-item__info">
              <p class="tx-item__name">{{ tx.name }}</p>
              <p class="tx-item__date">{{ tx.date }}</p>
            </div>
            <p class="tx-item__amount" :class="tx.amount > 0 ? 'income-color' : 'expense-color'">
              {{ tx.amount > 0 ? '+' : '' }}{{ formatBalance(Math.abs(tx.amount)) }}
            </p>
          </div>
        </div>
      </section>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from 'stores/auth';
import { api } from 'boot/axios';

const auth = useAuthStore();
const globalBalance = ref(12450);
const incomeTotal = ref(3200);
const expenseTotal = ref(1850);
const activeFilter = ref('Mensual');
const filters = ['Mensual', 'Semanal', 'Anual'];

const jars = [
  { name: 'Vivienda',  amount: 4500, icon: 'home',          iconBg: 'rgba(14,165,233,0.1)',  iconColor: '#0EA5E9', ringColor: '#0EA5E9', progress: 77 },
  { name: 'Auto',      amount: 2800, icon: 'directions_car', iconBg: 'rgba(16,185,129,0.1)',  iconColor: '#10B981', ringColor: '#10B981', progress: 48 },
  { name: 'Viajes',    amount: 1200, icon: 'flight',         iconBg: 'rgba(251,191,36,0.1)',  iconColor: '#FBBF24', ringColor: '#FBBF24', progress: 30 },
  { name: 'Inversión', amount: 3950, icon: 'savings',        iconBg: 'rgba(139,92,246,0.1)',  iconColor: '#8B5CF6', ringColor: '#8B5CF6', progress: 89 },
];

const transactions = [
  { id: 1, name: 'Supermercado',  date: 'Hoy, 10:45 AM',      amount: -45.5, icon: 'shopping_cart' },
  { id: 2, name: 'Freelance',     date: 'Ayer, 03:20 PM',      amount: 800,   icon: 'work' },
  { id: 3, name: 'Almuerzo Sushi',date: '22 May, 01:15 PM',    amount: -32,   icon: 'restaurant' },
];

function formatBalance(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(amount);
}

onMounted(async () => {
  if (auth.user?.id) {
    try {
      const r = await api.get(`/user/${auth.user.id}/global-balance`);
      if (r.data?.success) globalBalance.value = r.data.data.global_balance;
    } catch { /* keep mock */ }
  }
});
</script>

<style lang="scss" scoped>
.lite-home {
  background: #f7f9fb;
  min-height: 100vh;

  &__content {
    max-width: 480px;
    margin: 0 auto;
    padding: 16px 24px 0;
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding-bottom: 140px;
  }
}

// Balance Hero Card
.balance-card {
  background: linear-gradient(135deg, #0ea5e9 0%, #006591 100%);
  border-radius: 2rem;
  padding: 28px;
  color: white;
  box-shadow: 0 20px 48px rgba(14, 165, 233, 0.22);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  &__label {
    color: rgba(255,255,255,0.8);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0 0 6px;
    font-family: 'Outfit', sans-serif;
  }

  &__amount {
    font-size: 36px;
    font-weight: 800;
    margin: 0;
    font-family: 'Outfit', sans-serif;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  &__currency-pill {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 9999px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    font-family: 'Outfit', sans-serif;
  }

  &__pills {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  &__filters {
    display: flex;
    gap: 8px;
  }
}

.balance-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
}

.balance-filter {
  padding: 5px 14px;
  border-radius: 9999px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  color: rgba(255,255,255,0.65);
  background: transparent;
  transition: all 150ms ease-out;

  &--active {
    background: white;
    color: #006591;
  }
}

// Section layout
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  font-family: 'Outfit', sans-serif;
}

.section-link {
  color: #0ea5e9;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
}

// Jars
.jars-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.jar-card {
  background: white;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 4px 24px rgba(15,23,42,0.05);

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  &__icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__ring-wrap {
    width: 34px;
    height: 34px;
  }

  &__name {
    font-size: 12px;
    color: #64748b;
    margin: 0 0 4px;
    font-family: 'Outfit', sans-serif;
  }

  &__amount {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    font-family: 'Outfit', sans-serif;
  }
}

.jar-ring {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

// Transactions
.tx-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tx-item {
  background: white;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(15,23,42,0.04);

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info { flex: 1; }

  &__name {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 2px;
    font-family: 'Outfit', sans-serif;
  }

  &__date {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
    font-family: 'Outfit', sans-serif;
  }

  &__amount {
    font-size: 15px;
    font-weight: 700;
    font-family: 'Outfit', sans-serif;
  }
}

.income-color { color: #10b981; }
.expense-color { color: #ef4444; }
</style>

