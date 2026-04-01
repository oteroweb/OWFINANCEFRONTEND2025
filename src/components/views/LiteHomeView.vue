<template>
  <q-page class="q-pa-md bg-slate-50 relative min-h-screen pb-20 overflow-x-hidden">
    <!-- Header -->
    <header class="flex items-center justify-between mb-8 animate-fade-in-down">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-800">Hola, {{ auth.user?.name?.split(' ')[0] || 'Usuario' }}</h1>
        <p class="text-sm font-medium text-slate-500">¿Qué haremos hoy?</p>
      </div>
      <q-avatar size="48px" class="shadow-lg border-2 border-white cursor-pointer" @click="$router.push('/app/config')">
        <img :src="avatarUrl" alt="Avatar">
      </q-avatar>
    </header>

    <!-- Draggable Grid for Widgets -->
    <VueDraggable
      v-model="widgets"
      item-key="id"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
      ghost-class="opacity-50"
      animation="200"
      handle=".drag-handle"
    >
      <template #item="{ element }">
        <div class="draggable-item">
          
          <!-- Balance Widget -->
          <GlassFluidCard v-if="element.type === 'balance'" ambient class="h-48 flex flex-col justify-between group">
            <div class="flex justify-between items-start w-full">
              <div class="flex items-center space-x-2 text-indigo-900/60 font-medium">
                <q-icon name="account_balance_wallet" size="20px" />
                <span>Balance Disponible</span>
              </div>
              <q-icon name="drag_indicator" class="drag-handle text-slate-400 cursor-grab hover:text-slate-600 transition-colors" size="24px" />
            </div>
            
            <div>
              <div class="text-4xl font-extrabold text-slate-800 tracking-tight">
                {{ formatCurrency(globalBalance) }}
              </div>
              <div class="text-sm font-medium text-teal-600 mt-1 flex items-center">
                <q-icon name="trending_up" class="mr-1" />
                +2.4% este mes
              </div>
            </div>
            
            <div class="flex space-x-2 mt-4">
              <SpringButton variant="primary" size="sm" class="flex-1" @click="$router.push('/app/transactions')">
                <q-icon name="add" class="mr-1" /> Ingreso
              </SpringButton>
              <SpringButton variant="secondary" size="sm" class="flex-1" @click="$router.push('/app/transactions')">
                <q-icon name="remove" class="mr-1" /> Gasto
              </SpringButton>
            </div>
          </GlassFluidCard>

          <!-- Chart Widget -->
          <GlassFluidCard v-else-if="element.type === 'chart'" class="group">
            <div class="flex justify-between items-center w-full mb-2">
              <div class="font-bold text-slate-700">Gastos Recientes</div>
              <q-icon name="drag_indicator" class="drag-handle text-slate-400 cursor-grab hover:text-slate-600 transition-colors" size="24px" />
            </div>
            <SimpleCssChart :data="chartData" />
          </GlassFluidCard>
          
          <!-- Quick Actions Widget -->
          <GlassFluidCard v-else-if="element.type === 'actions'" class="group">
            <div class="flex justify-between items-center w-full mb-4">
              <div class="font-bold text-slate-700">Accesos Rápidos</div>
              <q-icon name="drag_indicator" class="drag-handle text-slate-400 cursor-grab hover:text-slate-600 transition-colors" size="24px" />
            </div>
            <div class="grid grid-cols-4 gap-3">
              <div class="flex flex-col items-center justify-center space-y-2 cursor-pointer transition-transform active:scale-95" @click="$router.push('/app/jars')">
                <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <q-icon name="water_drop" size="24px" />
                </div>
                <span class="text-xs font-semibold text-slate-600">Cántaros</span>
              </div>
              <div class="flex flex-col items-center justify-center space-y-2 cursor-pointer transition-transform active:scale-95" @click="$router.push('/app/accounts')">
                <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                  <q-icon name="account_balance" size="24px" />
                </div>
                <span class="text-xs font-semibold text-slate-600">Cuentas</span>
              </div>
              <div class="flex flex-col items-center justify-center space-y-2 cursor-pointer transition-transform active:scale-95" @click="$router.push('/app/categories')">
                <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                  <q-icon name="category" size="24px" />
                </div>
                <span class="text-xs font-semibold text-slate-600">Categorías</span>
              </div>
              <div class="flex flex-col items-center justify-center space-y-2 cursor-pointer transition-transform active:scale-95" @click="$router.push('/app/expense-analysis')">
                <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <q-icon name="pie_chart" size="24px" />
                </div>
                <span class="text-xs font-semibold text-slate-600">Análisis</span>
              </div>
            </div>
          </GlassFluidCard>

        </div>
      </template>
    </VueDraggable>

    <!-- Global Floating Action Button -->
    <GlassFab 
      icon="add" 
      position="bottom-center" 
      color="primary" 
      size="lg" 
      @click="isPaletteOpen = true" 
    />

    <!-- Transaction Inputs bottom sheet -->
    <SwipeableBottomSheet v-model="isPaletteOpen">
      <TransactionPalette @submitted="onTransactionSubmitted" />
    </SwipeableBottomSheet>

  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from 'stores/auth';
import VueDraggable from 'vuedraggable';
import GlassFluidCard from 'components/ui/glass-fluid-card.vue';
import SpringButton from 'components/ui/spring-button.vue';
import SimpleCssChart from 'components/ui/simple-css-chart.vue';
import GlassFab from 'components/ui/glass-fab.vue';
import SwipeableBottomSheet from 'components/ui/swipeable-bottom-sheet.vue';
import TransactionPalette from 'components/transactions/TransactionPalette.vue';
import { defaultAvatarUrl } from 'pages/user/config';
import { api } from 'boot/axios';

const auth = useAuthStore();
const avatarUrl = ref(defaultAvatarUrl);

// Transaction Palette State
const isPaletteOpen = ref(false);

const onTransactionSubmitted = () => {
  isPaletteOpen.value = false;
  // In a real scenario, we would trigger a refresh of the globalBalance and charts here
};

// Widget configuration (can be saved to user settings in the future)
const widgets = ref([
  { id: 1, type: 'balance', order: 1 },
  { id: 2, type: 'actions', order: 2 },
  { id: 3, type: 'chart', order: 3 },
]);

// Mock data for initial render, usually fetched from API
const globalBalance = ref(0);
const chartData = ref([
  { label: 'Lun', value: 120 },
  { label: 'Mar', value: 65 },
  { label: 'Mié', value: 340 },
  { label: 'Jue', value: 210 },
  { label: 'Vie', value: 95 },
  { label: 'Sáb', value: 430 },
  { label: 'Dom', value: 15 },
]);

const formatCurrency = (val: number) => {
  return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

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

<style>
/* Utilities for animations */
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}
@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
