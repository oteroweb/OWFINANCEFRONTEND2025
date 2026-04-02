<template>
  <header class="bg-[#F8FAFC] flex justify-between items-center w-full px-6 py-4 fixed top-0 z-40 h-16">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-[#DBEAFE] flex-shrink-0">
        <img alt="Profile" class="w-full h-full object-cover" :src="userAvatar" />
      </div>
      <h1 class="text-xl font-bold font-headline text-[#1E3A8A]">{{ greeting }}</h1>
    </div>
    <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#DBEAFE] transition-colors duration-200">
      <span class="material-symbols-outlined text-[#1E3A8A]">notifications</span>
    </button>
  </header>
</template>

<script setup lang="ts">
interface Props {
  greeting?: string;
  userAvatar?: string;
}

const props = withDefaults(defineProps<Props>(), {
  greeting: 'Hola, José!',
  userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5aK-_Y-htTIqAx-T9Gl2fDO7OAifgry5RH__ztH9yBW9Hl5_8LUwXHMFzdentNHQ2yHxiUNjRnWTRTHxbI99lZ7RCjwCEK0ECc5xLbZgE6xmNiK5tmBHHpWluIcISCf1iJvmBFO0iufZ-PmwzLxJyhmP4UOC2N98gIaBa0kueIOJ4WCSsJSIdcEzB6pnhl5HPIBkIzrsib5y0oNX619K9AeH73W6vPiKV1Pnzhhti93N9vP3MrGLITZW9jMWXHAW8GWdLMNS13nM'
});
</script>

<style lang="scss" scoped>
/* Tailwind handles styling */
</style>
