<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300" @click="closeSheet"></div>
    </transition>

    <transition name="slide-up">
      <div
        v-if="modelValue"
        class="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col overflow-hidden transition-transform duration-300 ease-out"
        :class="{ 'pointer-events-none': isDragging }"
      >
        <!-- Drag Handle Indicator -->
        <div class="w-full flex justify-center pt-3 pb-2 cursor-grab touch-pan-y" @mousedown="startDrag" @touchstart="startDrag">
          <div class="w-12 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        <!-- Content Payload -->
        <div class="flex-1 overflow-y-auto w-full p-4 pb-10">
          <slot></slot>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue']);

// Stub for drag logic, keeping it simple without third-party libs
const isDragging = ref(false);

const closeSheet = () => {
  emit('update:modelValue', false);
};

// Simple touch drag physics stub
let startY = 0;
const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true;
  startY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY;
};

const stopDrag = () => {
  isDragging.value = false;
};

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;
  const currentY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY;
  const delta = currentY - startY;

  // Simple heuristic to close if swiped down far enough
  if (delta > 100) {
    isDragging.value = false;
    closeSheet();
  }
};

onMounted(() => {
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('touchmove', onDrag);
});

onUnmounted(() => {
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchend', stopDrag);
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('touchmove', onDrag);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}
.slide-up-leave-active {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); /* Faster out */
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
