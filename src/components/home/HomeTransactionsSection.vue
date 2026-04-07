<template>
  <div class="txns-section">
    <div class="txns-section__header">
      <h3 class="txns-section__title">Últimos Movimientos</h3>
      <button class="txns-section__link" @click="router.push('/user/transactions')">
        Historial completo
      </button>
    </div>

    <div class="txns-card">
      <!-- Loading skeletons -->
      <template v-if="isLoading">
        <div v-for="i in 7" :key="i" class="txn-skeleton" />
      </template>

      <!-- Empty state -->
      <template v-else-if="!(transactions && transactions.length)">
        <div class="txns-card__empty">
          <q-icon name="receipt_long" size="40px" color="grey-4" />
          <p>No hay transacciones recientes</p>
        </div>
      </template>

      <!-- Transaction rows -->
      <template v-else>
        <div
          v-for="(tx, idx) in (transactions ?? [])"
          :key="tx.id"
          class="txn-row"
          :class="{ 'txn-row--last': idx === (transactions?.length ?? 1) - 1 && (totalPages ?? 1) <= 1 }"
          role="button"
          tabindex="0"
          @click="router.push('/user/transactions')"
          @keydown.enter="router.push(`/user/transactions`)"
        >
          <div class="txn-row__left">
            <div class="txn-row__icon-box" :class="tx.isIncome ? 'txn-row__icon-box--income' : 'txn-row__icon-box--expense'">
              <q-icon :name="tx.isIncome ? 'arrow_downward' : 'receipt_long'" size="20px" />
            </div>
            <div class="txn-row__info">
              <p class="txn-row__name">{{ tx.name }}</p>
              <p class="txn-row__meta">{{ tx.date }}<span v-if="tx.category"> • {{ tx.category }}</span></p>
            </div>
          </div>

          <div class="txn-row__right">
            <p class="txn-row__amount" :class="tx.isIncome ? 'txn-row__amount--income' : 'txn-row__amount--expense'">
              {{ tx.isIncome ? '+' : '-' }}{{ currency }}{{ tx.amount }}
            </p>
            <p v-if="tx.account" class="txn-row__account">{{ tx.account }}</p>
          </div>
        </div>
      </template>

      <!-- Pagination bar -->
      <div v-if="!isLoading && (totalPages ?? 1) > 1" class="txns-pager">
        <button
          class="txns-pager__btn"
          :disabled="(currentPage ?? 1) <= 1"
          aria-label="Página anterior"
          @click="emit('page-change', (currentPage ?? 1) - 1)"
        >
          <q-icon name="chevron_left" size="18px" />
        </button>

        <span class="txns-pager__info">
          {{ currentPage ?? 1 }} / {{ totalPages ?? 1 }}
        </span>

        <button
          class="txns-pager__btn"
          :disabled="(currentPage ?? 1) >= (totalPages ?? 1)"
          aria-label="Página siguiente"
          @click="emit('page-change', (currentPage ?? 1) + 1)"
        >
          <q-icon name="chevron_right" size="18px" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

interface Transaction {
  id: number;
  name: string;
  amount: string;
  date: string;
  category: string;
  isIncome: boolean;
  account?: string;
}

interface Props {
  transactions?: Transaction[];
  isLoading?: boolean;
  currency?: string;
  currentPage?: number;
  totalPages?: number;
}

withDefaults(defineProps<Props>(), {
  transactions: () => [],
  isLoading: false,
  currency: '$',
  currentPage: 1,
  totalPages: 1,
});

const emit = defineEmits<{ 'page-change': [page: number] }>();

const router = useRouter();
</script>

<style lang="scss" scoped>
.txns-section {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
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
}

.txns-card {
  background: white;
  border-radius: 32px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);

  .body--dark & {
    background: #1e293b;
    border-color: #334155;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 48px 24px;
    color: #94a3b8;
    font-size: 14px;
    text-align: center;

    p { margin: 0; }
  }
}

.txn-skeleton {
  height: 72px;
  margin: 0;
  background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-bottom: 1px solid #f8fafc;

  &:last-child { border-bottom: none; }

  .body--dark & {
    background: linear-gradient(90deg, #1e293b 25%, #263448 50%, #1e293b 75%);
    background-size: 400% 100%;
    border-bottom-color: #334155;
  }
}

.txn-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: background 160ms ease;

  .body--dark & {
    border-bottom-color: rgba(51, 65, 85, 0.5);
  }

  &:hover { background: #f8fafc; .body--dark & { background: rgba(51, 65, 85, 0.3); } }

  &--last { border-bottom: none; }

  &__left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__icon-box {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--income {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    &--expense {
      background: rgba(239, 68, 68, 0.08);
      color: #ef4444;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;

    .body--dark & { color: #f1f5f9; }
  }

  &__meta {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
  }

  &__right {
    text-align: right;
    flex-shrink: 0;
  }

  &__amount {
    font-family: 'Manrope', sans-serif;
    font-size: 15px;
    font-weight: 700;
    margin: 0;

    &--income { color: #10b981; }
    &--expense { color: #ef4444; }
  }

  &__account {
    font-size: 11px;
    color: #94a3b8;
    margin: 2px 0 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

@keyframes shimmer {
  0% { background-position: 400% 0; }
  100% { background-position: -400% 0; }
}

.txns-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 24px;
  border-top: 1px solid #f1f5f9;

  .body--dark & { border-top-color: #1e293b; }

  &__btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    color: #1e3a8a;
    transition: all 150ms ease;

    .body--dark & {
      background: #1e293b;
      border-color: #334155;
      color: #93c5fd;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: #1e3a8a;
      color: white;
      border-color: #1e3a8a;
    }
  }

  &__info {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    min-width: 48px;
    text-align: center;

    .body--dark & { color: #94a3b8; }
  }
}
</style>
