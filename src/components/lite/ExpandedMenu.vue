<template>
  <transition name="menu-fade">
    <div
      v-if="modelValue"
      ref="menuRef"
      class="expanded-menu"
      role="dialog"
      aria-label="Menú de cuenta"
    >
      <div class="expanded-menu__header">
        <div class="expanded-menu__avatar">
          <span v-if="!user?.avatar">{{ initials }}</span>
          <img v-else :src="user.avatar" :alt="user?.name || 'U'" />
        </div>
        <div class="expanded-menu__user">
          <span class="expanded-menu__name">{{ user?.name || 'Usuario' }}</span>
          <span class="expanded-menu__email">{{ user?.email || '' }}</span>
        </div>
      </div>

      <div
        v-for="(group, gi) in menuGroups"
        :key="gi"
        class="expanded-menu__group"
      >
        <div v-if="group.label" class="expanded-menu__group-label">{{ group.label }}</div>
        <button
          v-for="(item, ii) in group.items"
          :key="ii"
          class="expanded-menu__row"
          :class="{ 'expanded-menu__row--destructive': item.destructive }"
          @click="onItemClick(item)"
        >
          <q-icon :name="item.icon" size="18px" />
          <div class="expanded-menu__row-content">
            <span>{{ item.label }}</span>
            <span v-if="item.hint" class="expanded-menu__hint">{{ item.hint }}</span>
          </div>
          <q-icon v-if="!item.destructive" name="chevron_right" size="18px" class="expanded-menu__arrow" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface MenuItem {
  icon: string;
  label: string;
  hint?: string;
  destructive?: boolean;
  action?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface User {
  name?: string;
  email?: string;
  avatar?: string | null;
}

const props = defineProps<{
  modelValue: boolean;
  user?: User;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'navigate': [to: string];
  'logout': [];
}>();

const menuRef = ref<HTMLElement | null>(null);

const initials = computed(() => {
  const name = props.user?.name || '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const menuGroups: MenuGroup[] = [
  {
    label: 'Cuenta',
    items: [
      { icon: 'person', label: 'Perfil', action: '/user/config' },
      { icon: 'savings', label: 'Métodos de pago', hint: '3 tarjetas · 1 banco', action: '/user/accounts' },
      { icon: 'notifications', label: 'Notificaciones', hint: 'Activas · resumen semanal', action: '/user/config' },
    ],
  },
  {
    label: 'Preferencias',
    items: [
      { icon: 'settings', label: 'Ajustes de app', action: '/user/config' },
      { icon: 'visibility', label: 'Privacidad y visibilidad', action: '/user/config' },
      { icon: 'receipt_long', label: 'Exportar datos', action: '/user/transactions' },
    ],
  },
  {
    label: '',
    items: [
      { icon: 'logout', label: 'Cerrar sesión', destructive: true, action: 'logout' },
    ],
  },
];

function onItemClick(item: MenuItem) {
  if (item.action === 'logout') {
    emit('logout');
  } else if (item.action) {
    emit('navigate', item.action);
  }
  emit('update:modelValue', false);
}

// Cerrar al hacer click fuera o presionar Escape
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') emit('update:modelValue', false);
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
        emit('update:modelValue', false);
      }
    };
    document.addEventListener('keydown', onKey);
    setTimeout(() => document.addEventListener('mousedown', onClick), 0);

    const cleanup = () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };

    // Cleanup cuando se cierre
    watch(() => props.modelValue, (v) => {
      if (!v) cleanup();
    }, { once: true });
  }
);
</script>

<style scoped lang="scss">
.expanded-menu {
  position: absolute;
  top: 76px;
  right: 32px;
  width: 320px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  z-index: var(--z-popover);
  overflow: hidden;
  animation: menuFadeIn var(--dur-base) var(--ease-out);

  @keyframes menuFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  &__header {
    padding: 18px 18px 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-pill);
    background: var(--brand-primary);
    color: var(--fg-on-brand);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 16px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__user {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 14px;
    color: var(--fg-1);
  }

  &__email {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--fg-2);
  }

  &__group {
    padding: 6px 8px;

    &-label {
      padding: 8px 12px 4px;
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--fg-2);
    }
  }

  &__row {
    width: 100%;
    border: 0;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg-1);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    transition: background var(--dur-base) var(--ease-out);

    &:hover {
      background: var(--surface-2);
    }

    &--destructive {
      color: var(--expense-fg);

      .q-icon {
        color: var(--expense);
      }
    }
  }

  &__row-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__hint {
    font-size: 11px;
    color: var(--fg-2);
    font-weight: 400;
  }

  &__arrow {
    color: var(--fg-3);
  }
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .expanded-menu {
    right: 16px;
    width: calc(100vw - 32px);
    max-width: 320px;
  }
}
</style>
