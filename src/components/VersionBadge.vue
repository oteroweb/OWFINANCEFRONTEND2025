<template>
  <div class="version-badge">
    v{{ version }}
  </div>
</template>

<script setup lang="ts">
import { version } from '../../package.json';
</script>

<style scoped>
.version-badge {
  position: fixed;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  z-index: 9999;
  backdrop-filter: blur(4px);
  pointer-events: none;
  user-select: none;
}
</style>
