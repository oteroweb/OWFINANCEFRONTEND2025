<template>
  <q-layout view="lHh Lpr lFf" class="bg-[#F8FAFC]">
    <!-- Pro sidebar indicator (placeholder) -->
    <q-drawer
      show-if-above
      :width="240"
      :breakpoint="768"
      bordered
      class="bg-[#1E3A8A] text-white"
    >
      <div class="flex flex-col h-full px-4 py-6">
        <div class="text-lg font-bold text-white mb-8 px-2">OWFinance Pro</div>
        <div class="text-xs text-[#DBEAFE] uppercase tracking-widest px-2 mb-2">Navigation</div>
        <div class="flex flex-col gap-1 text-[#DBEAFE] text-sm px-2">
          <span>Pro layout — sidebar coming soon</span>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="bg-[#F8FAFC]">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Pro layout — sidebar navigation placeholder
// Full implementation pending product design sign-off
</script>
