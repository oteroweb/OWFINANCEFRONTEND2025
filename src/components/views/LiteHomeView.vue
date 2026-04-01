<template>
  <q-page class="liquid-home-page q-pb-xl">
    <!-- Hero Section: Account Balance -->
    <section class="hero-section q-px-xl q-pt-md">
      <LiquidBalanceCard
        label="Total Balance"
        name="Main Savings"
        :amount="globalBalance"
        :trend-value="2.4"
      />
    </section>

    <!-- Section 2: Your Jars (Horizontal Scroller) -->
    <section class="jars-section q-mt-xl">
      <div class="section-header q-px-xl q-mb-md row items-center justify-between">
        <span class="text-overline text-soft tracking-widest uppercase">Your Jars</span>
        <q-btn flat dense label="View All" color="primary-cyan" size="sm" class="text-editorial font-bold" />
      </div>
      
      <div class="jars-scroller hide-scrollbar row no-wrap q-gutter-x-md q-px-xl">
        <LiquidJarCard label="Taxes" amount="4,200" :progress="65" icon="solar:calculator-bold-duotone" />
        <LiquidJarCard label="Emergency" amount="12,500" :progress="80" icon="solar:shield-warning-bold-duotone" />
        <LiquidJarCard label="Vacation" amount="3,150" :progress="30" icon="solar:palmtree-bold-duotone" />
        <LiquidJarCard label="Investments" amount="5,000" :progress="45" icon="solar:chart-square-bold-duotone" />
      </div>
    </section>

    <!-- Section 3: Recent Activity (List) -->
    <section class="activity-section q-mt-xl q-pb-xl">
      <div class="section-header q-px-xl q-mb-md">
        <span class="text-overline text-soft tracking-widest uppercase">Recent Activity</span>
      </div>
      
      <div class="activity-list q-px-xl column q-gutter-y-sm">
        <LiquidTransactionItem
          label="Apple Store"
          amount="1,299.00"
          date="Dec 24, 2025"
          category="Technology"
          icon="solar:smartphone-2-bold-duotone"
          account="Visa Chrome"
        />
        <LiquidTransactionItem
          label="Salary Deposit"
          amount="5,200.00"
          date="Dec 20, 2025"
          category="Income"
          :is-income="true"
          icon="solar:wad-of-money-bold-duotone"
          account="Main Savings"
        />
        <LiquidTransactionItem
          label="Starbucks Coffee"
          amount="12.50"
          date="Dec 19, 2025"
          category="Food & Drink"
          icon="solar:cup-bold-duotone"
          account="Visa Chrome"
        />
        <LiquidTransactionItem
          label="Netflix Subscription"
          amount="15.99"
          date="Dec 15, 2025"
          category="Entertainment"
          icon="solar:videocamera-record-bold-duotone"
          account="Visa Chrome"
        />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from 'stores/auth';
import { api } from 'boot/axios';

// Liquid Components
import LiquidBalanceCard from 'components/liquid/LiquidBalanceCard.vue';
import LiquidJarCard from 'components/liquid/LiquidJarCard.vue';
import LiquidTransactionItem from 'components/liquid/LiquidTransactionItem.vue';

const auth = useAuthStore();
const globalBalance = ref(24850.00);

onMounted(async () => {
  if (auth.user?.id) {
    try {
      const response = await api.get(`/user/${auth.user.id}/global-balance`);
      if (response.data?.success) {
        globalBalance.value = response.data.data.global_balance;
      }
    } catch (e) {
      console.error('Error loading balance', e);
    }
  }
});
</script>

<style lang="scss" scoped>
.liquid-home-page {
  background: var(--bg-app);
  min-height: 100vh;
}

.text-soft { color: var(--text-soft); }
.text-primary-cyan { color: var(--primary-cyan); }
.tracking-widest { letter-spacing: 0.15em; }

.section-header {
  span {
    font-size: 0.65rem;
    font-weight: 700;
  }
}

.jars-scroller {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  & > * {
    scroll-snap-align: center;
  }
}

.text-editorial { font-family: 'Manrope', sans-serif !important; }
.font-bold { font-weight: 700; }
</style>
