<template>
  <transition name="backdrop" @enter="onEnter" @leave="onLeave">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 transition-opacity"
      @click="onBackdropClick"
    />
  </transition>

  <transition name="slide-up">
    <div
      v-if="modelValue"
      class="fixed bottom-0 left-0 right-0 w-full bg-white rounded-t-3xl shadow-2xl z-50 pb-safe"
      style="height: 50vh; backdrop-filter: blur(8px)"
    >
      <!-- Drag Handle -->
      <div class="flex justify-center pt-3 pb-4">
        <div class="w-12 h-1 bg-slate-300 rounded-full" />
      </div>

      <!-- Title -->
      <h2 class="text-xl font-bold text-slate-900 px-6 mb-6">Agregar Rápidamente</h2>

      <!-- Actions Grid 2x2 -->
      <div class="grid grid-cols-2 gap-4 px-6 mb-8">
        <button
          v-for="action in actions"
          :key="action.type"
          class="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition hover:scale-105 active:scale-95"
          :class="`bg-${action.color}-50 text-${action.color}-600 hover:bg-${action.color}-100`"
          @click="onActionSelect(action.type)"
        >
          <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="`bg-${action.color}-600 text-white`">
            <q-icon :name="action.icon" size="24px" />
          </div>
          <span class="text-sm font-semibold text-center">{{ action.label }}</span>
        </button>
      </div>

      <!-- Cancel Button -->
      <div class="px-6 pb-6">
        <button
          class="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
          @click="onCancel"
        >
          Cancelar
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type ActionType = 'income' | 'expense' | 'transfer' | 'jar'

interface QuickActionSheetProps {
  modelValue?: boolean
  isLoading?: boolean
}

interface Action {
  type: ActionType
  label: string
  icon: string
  color: string
}

const props = withDefaults(defineProps<QuickActionSheetProps>(), {
  modelValue: false,
  isLoading: false,
})

const emit = defineEmits<{
  'update:modelValue': [visible: boolean]
  'action-selected': [{ type: ActionType }]
}>()

const actions: Action[] = [
  {
    type: 'income',
    label: 'Income',
    icon: 'add_circle',
    color: 'green',
  },
  {
    type: 'expense',
    label: 'Expense',
    icon: 'remove_circle',
    color: 'red',
  },
  {
    type: 'transfer',
    label: 'Transfer',
    icon: 'compare_arrows',
    color: 'blue',
  },
  {
    type: 'jar',
    label: 'Jar',
    icon: 'savings',
    color: 'amber',
  },
]

/**
 * Handle backdrop click - close sheet
 */
function onBackdropClick() {
  emit('update:modelValue', false)
}

/**
 * Handle action selection
 */
function onActionSelect(type: ActionType) {
  emit('action-selected', { type })
  emit('update:modelValue', false)
}

/**
 * Handle cancel button
 */
function onCancel() {
  emit('update:modelValue', false)
}

/**
 * Transition enter hook
 */
function onEnter() {
  // Animation handled by CSS
}

/**
 * Transition leave hook
 */
function onLeave() {
  // Animation handled by CSS
}
</script>

<style lang="scss" scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 300ms ease-in-out;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
