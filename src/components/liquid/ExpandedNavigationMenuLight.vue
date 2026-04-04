<template>
  <aside class="expanded-nav-menu expanded-nav-menu--light">
    <div class="expanded-nav-menu__header">
      <slot name="header">
        <q-avatar size="48px" class="q-mb-md" />
        <div class="expanded-nav-menu__user">Usuario</div>
      </slot>
    </div>
    <nav class="expanded-nav-menu__nav">
      <button v-for="item in items" :key="item.key" class="expanded-nav-menu__item" @click="$emit('select', item.key)">
        <q-icon :name="item.icon" size="22px" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{ items: { key: string; label: string; icon: string }[] }>();
</script>

<style scoped>
.expanded-nav-menu { width: 260px; background: #fff; color: #0b1326; border-radius: 2rem; box-shadow: 0 4px 24px rgba(14,165,233,0.08); padding: 2rem 1rem; }
.expanded-nav-menu__header { margin-bottom: 2rem; text-align: center; }
.expanded-nav-menu__user { font-weight: 700; font-size: 1.2rem; margin-top: 0.5rem; }
.expanded-nav-menu__nav { display: flex; flex-direction: column; gap: 1rem; }
.expanded-nav-menu__item { border: none; background: none; display: flex; align-items: center; gap: 1rem; font-size: 1.1rem; padding: 0.75rem 1rem; border-radius: 1rem; transition: background 0.2s; }
.expanded-nav-menu__item:hover { background: #f0f4fa; }
</style>
