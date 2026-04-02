<template>
  <!-- Overlay backdrop -->
  <Teleport to="body">
    <Transition name="sheet-fade">
      <div v-if="modelValue" class="sheet-backdrop" @click="$emit('update:modelValue', false)" />
    </Transition>

    <Transition name="sheet-slide">
      <div v-if="modelValue" class="sheet-container">
        <!-- Handle bar -->
        <div class="sheet-handle" />

        <!-- Title -->
        <h3 class="sheet-title">Acción rápida</h3>

        <!-- Actions grid -->
        <div class="sheet-actions">
          <button
            v-for="action in actions"
            :key="action.id"
            class="action-btn"
            @click="handleAction(action)"
          >
            <div class="action-icon-wrap" :style="{ background: action.bgColor }">
              <q-icon :name="action.icon" size="28px" :style="{ color: action.iconColor }" />
            </div>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>

        <!-- Close button -->
        <button class="sheet-close" @click="$emit('update:modelValue', false)">
          <q-icon name="close" size="20px" />
          Cancelar
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'action'])

const router = useRouter()

const actions = [
  {
    id: 'expense',
    label: 'Gasto',
    icon: 'remove_circle_outline',
    iconColor: '#EF4444',
    bgColor: 'rgba(239,68,68,0.10)',
    route: '/app/transactions/new?type=expense'
  },
  {
    id: 'income',
    label: 'Ingreso',
    icon: 'add_circle_outline',
    iconColor: '#10B981',
    bgColor: 'rgba(16,185,129,0.10)',
    route: '/app/transactions/new?type=income'
  },
  {
    id: 'transfer',
    label: 'Transferencia',
    icon: 'swap_horiz',
    iconColor: '#1E3A8A',
    bgColor: 'rgba(30,58,138,0.10)',
    route: '/app/transactions/new?type=transfer'
  },
  {
    id: 'import',
    label: 'Importar',
    icon: 'upload_file',
    iconColor: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.10)',
    route: '/app/transactions/import'
  }
]

const handleAction = (action: typeof actions[0]) => {
  emit('update:modelValue', false)
  emit('action', action.id)
  router.push(action.route).catch(() => {})
}
</script>

<style scoped>
/* Backdrop */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 100;
}

/* Sheet container */
.sheet-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 101;
  background: rgba(255, 255, 255, 0.96);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 32px 32px 0 0;
  padding: 12px 24px 40px;
  box-shadow: 0 -8px 40px rgba(15, 23, 42, 0.12);
}

/* Handle */
.sheet-handle {
  width: 40px;
  height: 4px;
  background: #E2E8F0;
  border-radius: 9999px;
  margin: 0 auto 20px;
}

/* Title */
.sheet-title {
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
  text-align: center;
  margin: 0 0 24px;
  letter-spacing: -0.01em;
}

/* Actions grid */
.sheet-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

/* Action button */
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 16px;
  transition: all 220ms cubic-bezier(0.23, 1, 0.32, 1);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
  text-align: center;
  letter-spacing: 0.01em;
}

/* Close button */
.sheet-close {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  background: transparent;
  color: #64748B;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 220ms cubic-bezier(0.23, 1, 0.32, 1);
}

.sheet-close:active {
  background: #F1F5F9;
  transform: scale(0.98);
}

/* Transitions */
.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 220ms cubic-bezier(0.23, 1, 0.32, 1);
}
.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}

.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 280ms cubic-bezier(0.23, 1, 0.32, 1);
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}
</style>
