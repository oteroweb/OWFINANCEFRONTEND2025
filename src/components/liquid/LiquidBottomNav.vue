<template>
  <nav class="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 rounded-t-[3rem] shadow-[0_-4px_24px_rgba(15,23,42,0.06)] flex justify-around items-center px-4 pb-6 pt-2 h-24">
    <!-- Left Items -->
    <a
      v-for="item in leftItems"
      :key="item.id"
      href="#"
      @click.prevent="navigateTo(item.to)"
      class="flex flex-col items-center justify-center rounded-full px-3 py-2 min-w-[48px] min-h-[48px] transition-all duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
      :class="isActive(item.to)
        ? 'bg-[#DBEAFE] text-[#1E3A8A]'
        : 'text-[#64748B] hover:text-[#1E3A8A]'"
    >
      <q-icon :name="isActive(item.to) ? item.iconActive : item.icon" size="24px" />
      <span class="text-[10px] uppercase tracking-wider font-bold font-inter mt-1">{{ item.label }}</span>
    </a>

    <!-- FAB Center -->
    <div class="relative -translate-y-8">
      <button
        @click="$emit('fabClick')"
        class="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-blue-200 active:scale-[0.97] transition-all duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
      >
        <q-icon name="add" size="32px" />
      </button>
    </div>

    <!-- Right Items -->
    <a
      v-for="item in rightItems"
      :key="item.id"
      href="#"
      @click.prevent="navigateTo(item.to)"
      class="flex flex-col items-center justify-center rounded-full px-3 py-2 min-w-[48px] min-h-[48px] transition-all duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
      :class="isActive(item.to)
        ? 'bg-[#DBEAFE] text-[#1E3A8A]'
        : 'text-[#64748B] hover:text-[#1E3A8A]'"
    >
      <q-icon :name="isActive(item.to) ? item.iconActive : item.icon" size="24px" />
      <span class="text-[10px] uppercase tracking-wider font-bold font-inter mt-1">{{ item.label }}</span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

defineEmits(['fabClick']);

const leftItems = [
  { id: 'home', label: 'Home', icon: 'solar:home-2-linear', iconActive: 'solar:home-2-bold-duotone', to: '/user/home' },
  { id: 'history', label: 'Transf.', icon: 'solar:history-linear', iconActive: 'solar:history-bold-duotone', to: '/user/transactions' }
];

const rightItems = [
  { id: 'cards', label: 'Jars', icon: 'solar:card-line-duotone', iconActive: 'solar:card-bold-duotone', to: '/user/accounts' },
  { id: 'profile', label: 'Perfil', icon: 'solar:user-linear', iconActive: 'solar:user-bold-duotone', to: '/user/config' }
];

const isActive = (path: string) => {
  return route.path.includes(path);
};

const navigateTo = (path: string) => {
  router.push(path).catch(() => {});
};
</script>

<style scoped>
/* Tailwind handles styling */
</style>
