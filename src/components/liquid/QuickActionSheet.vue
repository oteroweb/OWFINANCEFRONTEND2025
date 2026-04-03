<template>
  <!-- Scrim -->
  <transition name="qs-fade">
    <div v-if="modelValue" class="qs-scrim" @click="onClose" />
  </transition>

  <!-- Bottom Sheet -->
  <transition name="qs-slide">
    <div v-if="modelValue" class="qs-sheet">
      <div class="qs-sheet__handle" />

      <!-- 2x3 Actions Grid -->
      <div class="qs-sheet__grid">
        <button
          v-for="action in actions"
          :key="action.id"
          class="qs-action"
          @click="onActionSelect(action.id)"
        >
          <div class="qs-action__icon" :style="{ background: action.bg }">
            <q-icon :name="action.icon" size="22px" :style="{ color: action.color }" />
          </div>
          <span>{{ action.label }}</span>
        </button>
      </div>

      <!-- AI Coach Button -->
      <button class="qs-ai-btn" @click="onClose">
        <q-icon name="psychology" size="22px" color="white" />
        <span>Hablar con Asesor IA</span>
      </button>
    </div>
  </transition>

  <!-- Nav Overlay with X -->
  <transition name="qs-slide">
    <div v-if="modelValue" class="qs-nav-overlay">
      <div class="qs-nav-overlay__tab">
        <q-icon name="home" size="22px" /><span>HOME</span>
      </div>
      <div class="qs-nav-overlay__tab">
        <q-icon name="receipt_long" size="22px" /><span>TRANS</span>
      </div>
      <button class="qs-nav-overlay__close" @click="onClose" aria-label="Cerrar">
        <q-icon name="close" size="28px" color="primary" />
      </button>
      <div class="qs-nav-overlay__tab">
        <q-icon name="savings" size="22px" /><span>JARS</span>
      </div>
      <div class="qs-nav-overlay__tab">
        <q-icon name="settings" size="22px" /><span>SETTINGS</span>
      </div>
    </div>
  </transition>

  <!-- /new template -->
</template>

<script setup lang="ts">
type ActionId = 'expense' | 'income' | 'transfer' | 'voice' | 'scan' | 'ai';

interface Action {
  id: ActionId;
  label: string;
  icon: string;
  bg: string;
  color: string;
}

interface Props {
  modelValue?: boolean;
}

withDefaults(defineProps<Props>(), { modelValue: false });

const emit = defineEmits<{
  'update:modelValue': [visible: boolean];
  'action-selected': [{ type: ActionId }];
}>();

const actions: Action[] = [
  { id: 'expense',  label: 'Gasto',      icon: 'outbound',          bg: 'rgba(239,68,68,0.12)',   color: '#EF4444' },
  { id: 'income',   label: 'Ingreso',    icon: 'transit_enterexit', bg: 'rgba(16,185,129,0.12)',  color: '#10B981' },
  { id: 'transfer', label: 'Transferir', icon: 'swap_horiz',        bg: 'rgba(139,92,246,0.12)',  color: '#8B5CF6' },
  { id: 'voice',    label: 'Voz',        icon: 'mic',               bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' },
  { id: 'scan',     label: 'Escanear',   icon: 'qr_code_scanner',   bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24' },
  { id: 'ai',       label: 'Auto IA',    icon: 'auto_awesome',      bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' },
];

function onActionSelect(id: ActionId) {
  emit('action-selected', { type: id });
  emit('update:modelValue', false);
}

function onClose() {
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
.qs-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 70;
}

.qs-sheet {
  position: fixed;
  bottom: 100px;
  left: 0;
  right: 0;
  z-index: 80;
  background: #1a1a2e;
  border-radius: 3rem 3rem 0 0;
  border-top: 1px solid #2d3449;
  padding: 16px 24px 24px;

  &__handle {
    width: 48px;
    height: 5px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
    margin: 0 auto 28px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
}

.qs-action {
  background: #222a3d;
  border: none;
  border-radius: 18px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Outfit', sans-serif;
  transition: transform 160ms ease-out, background 160ms ease-out;

  &:active {
    transform: scale(0.93);
    background: #2d3449;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.qs-ai-btn {
  width: 100%;
  height: 58px;
  background: linear-gradient(90deg, #8b5cf6 0%, #0ea5e9 100%);
  border: none;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  color: white;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
  transition: transform 160ms ease-out;

  &:active { transform: scale(0.97); }
}

.qs-nav-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
  height: 100px;
  background: rgba(10, 15, 30, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 16px 12px;

  &__tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: #475569;
    font-size: 9px;
    font-weight: 700;
    font-family: 'Outfit', sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__close {
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    background: #1e2a3d;
    border: 3px solid #0ea5e9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-top: -32px;
    box-shadow: 0 0 24px rgba(14, 165, 233, 0.35);
    transition: transform 160ms ease-out;

    &:active { transform: scale(0.91); }
  }
}

/* Transitions */
.qs-fade-enter-active { transition: opacity 200ms ease-out; }
.qs-fade-leave-active { transition: opacity 150ms ease-in; }
.qs-fade-enter-from, .qs-fade-leave-to { opacity: 0; }

.qs-slide-enter-active { transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1); }
.qs-slide-leave-active { transition: transform 200ms ease-in; }
.qs-slide-enter-from, .qs-slide-leave-to { transform: translateY(100%); }
</style>
