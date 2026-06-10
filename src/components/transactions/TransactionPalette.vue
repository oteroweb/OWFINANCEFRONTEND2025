<template>
  <div class="transaction-palette">
    <!-- Action Tabs -->
    <div class="flex justify-between items-center bg-slate-100 p-1 rounded-2xl mb-6">
      <button 
        @click="activeMode = 'expense'"
        :class="['flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300', activeMode === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500']"
      >
        Gasto
      </button>
      <button 
        @click="activeMode = 'income'"
        :class="['flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300', activeMode === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500']"
      >
        Ingreso
      </button>
      <button 
        @click="activeMode = 'transfer'"
        :class="['flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300', activeMode === 'transfer' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500']"
      >
        Traspaso
      </button>
    </div>

    <!-- AMOUNT INPUT -->
    <div class="flex flex-col items-center justify-center mb-8">
      <span class="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Monto</span>
      <div class="flex items-center space-x-1">
        <span class="text-3xl font-bold text-slate-800" :class="activeMode === 'expense' ? 'text-red-600' : activeMode === 'income' ? 'text-emerald-600' : 'text-indigo-600'">$</span>
        <input 
          v-model="amount" 
          type="number" 
          step="0.01"
          placeholder="0.00" 
          class="text-5xl font-extrabold text-slate-800 bg-transparent border-none outline-none w-full text-center p-0 m-0 caret-indigo-500"
          style="max-width: 200px;" 
        />
      </div>
    </div>

    <!-- QUICK CATEGORIES (Expense/Income only) -->
    <div v-if="activeMode !== 'transfer'" class="mb-6">
      <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Categoría Rápida</div>
      <div class="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar">
        <button 
          v-for="cat in quickCategories" 
          :key="cat.id" 
          @click="selectedCategoryId = cat.id"
          :class="['flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300', selectedCategoryId === cat.id ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
        >
          <q-icon :name="cat.icon" size="24px" />
          <span class="text-[10px] font-semibold mt-1">{{ cat.label }}</span>
        </button>
      </div>
    </div>

    <!-- NOTES -->
    <div class="mb-8">
      <div class="w-full bg-slate-100 rounded-2xl p-4 flex items-center space-x-3 border border-transparent focus-within:border-indigo-300 transition-colors">
        <q-icon name="edit_note" size="24px" class="text-slate-400" />
        <input 
          v-model="notes" 
          type="text" 
          placeholder="¿En qué se usó?" 
          class="bg-transparent border-none outline-none w-full text-slate-700 font-medium placeholder:text-slate-400"
        />
      </div>
    </div>

    <!-- ACTION BUTTON -->
    <SpringButton 
      :variant="activeMode === 'expense' ? 'danger' : activeMode === 'income' ? 'success' : 'primary'"
      class="w-full py-4 rounded-2xl text-lg font-bold shadow-lg"
      @click="submitTransaction"
      :loading="isSubmitting"
    >
      Registrar {{ activeMode === 'expense' ? 'Gasto' : activeMode === 'income' ? 'Ingreso' : 'Traspaso' }}
    </SpringButton>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { Notify } from 'quasar';
import SpringButton from 'components/ui/spring-button.vue';

const emit = defineEmits(['submitted']);

const activeMode = ref<'expense' | 'income' | 'transfer'>('expense');
const amount = ref<string>('');
const notes = ref<string>('');
const selectedCategoryId = ref<number | null>(null);
const isSubmitting = ref(false);

const quickCategories = computed(() => {
  if (activeMode.value === 'expense') {
    return [
      { id: 1, label: 'Comida', icon: 'restaurant' },
      { id: 2, label: 'Transporte', icon: 'directions_car' },
      { id: 3, label: 'Compras', icon: 'shopping_bag' },
      { id: 4, label: 'Servicios', icon: 'bolt' },
    ];
  } else {
    return [
      { id: 5, label: 'Salario', icon: 'payments' },
      { id: 6, label: 'Inversión', icon: 'trending_up' },
      { id: 7, label: 'Regalo', icon: 'redeem' },
    ];
  }
});

const resetForm = () => {
  amount.value = '';
  notes.value = '';
  selectedCategoryId.value = null;
}

const submitTransaction = async () => {
  if (!amount.value || parseFloat(amount.value) <= 0) {
    Notify.create({ type: 'warning', message: 'Ingresa un monto válido.' });
    return;
  }
  
  if (activeMode.value !== 'transfer' && !selectedCategoryId.value) {
    Notify.create({ type: 'warning', message: 'Selecciona una categoría.' });
    return;
  }

  isSubmitting.value = true;
  
  try {
    // Standard OW Finance Transaction Format Payload
    const payload = {
      type: activeMode.value,
      amount: parseFloat(amount.value),
      description: notes.value || 'Registro rápido',
      category_id: selectedCategoryId.value,
      // Need account_id ideally, omitting for MVP defaults
    };

    await api.post('/transactions', payload);
    Notify.create({ type: 'positive', message: '¡Transacción registrada exitosamente!' });
    resetForm();
    emit('submitted');
  } catch (error) {
    console.error('Error enviando transacción:', error);
    Notify.create({ type: 'negative', message: 'Error registrando la operación.' });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Hidden scrollbar but keeps scrollability */
.custom-scrollbar::-webkit-scrollbar {
  display: none;
}
.custom-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
</style>
