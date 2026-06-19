<template>
  <Teleport to="body">
    <Transition name="enmenu">
      <div
        v-if="open"
        ref="menuRef"
        class="enmenu"
        role="dialog"
        aria-label="Menú de cuenta"
      >
        <!-- Profile header -->
        <div class="enmenu__profile">
          <div class="enmenu__avatar">{{ initial }}</div>
          <div class="enmenu__profile-info">
            <span class="enmenu__profile-name">{{ userName }}</span>
            <span class="enmenu__profile-email">{{ userEmail }}</span>
          </div>
        </div>

        <!-- Groups -->
        <div v-for="(group, gi) in MENU_GROUPS" :key="gi" class="enmenu__group">
          <div v-if="group.label" class="enmenu__group-label">{{ group.label }}</div>
          <button
            v-for="(item, ii) in group.items"
            :key="ii"
            class="enmenu__row"
            :class="{ 'enmenu__row--destructive': item.destructive }"
            @click="onItemClick(item)"
          >
            <span class="material-icons enmenu__row-icon">{{ item.icon }}</span>
            <div class="enmenu__row-body">
              <span>{{ item.label }}</span>
              <span v-if="item.hint" class="enmenu__row-hint">{{ item.hint }}</span>
            </div>
            <span v-if="!item.destructive" class="material-icons enmenu__row-chevron">chevron_right</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [value: boolean] }>();

const router  = useRouter();
const auth    = useAuthStore();
const menuRef = ref<HTMLElement | null>(null);

const userName  = computed(() => auth.user?.name  || 'Usuario');
const userEmail = computed(() => auth.user?.email || '');
const initial   = computed(() => userName.value.charAt(0).toUpperCase());

interface MenuItem {
  icon: string;
  label: string;
  hint?: string;
  route: string | null;
  destructive?: boolean;
}
interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Cuenta',
    items: [
      { icon: 'person',       label: 'Perfil',            route: '/user/profile' },
      { icon: 'insights',     label: 'Perfil financiero', route: '/user/financial-profile' },
      { icon: 'savings',      label: 'Cuentas',           route: '/user/accounts' },
      { icon: 'receipt_long', label: 'Exportar datos',    route: null },
    ],
  },
  {
    label: 'Preferencias',
    items: [
      { icon: 'settings',   label: 'Configuración', route: '/user/config' },
      { icon: 'visibility', label: 'Privacidad',    route: null },
    ],
  },
  {
    label: '',
    items: [
      { icon: 'logout', label: 'Cerrar sesión', route: null, destructive: true },
    ],
  },
];

function close() {
  emit('update:open', false);
}

function onItemClick(item: MenuItem) {
  if (item.destructive) {
    auth.logout();
    void router.push('/login');
    close();
    return;
  }
  if (item.route) {
    void router.push(item.route);
    close();
  }
}

function onClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    close();
  }
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
}

watch(() => props.open, (val) => {
  if (val) {
    setTimeout(() => {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('keydown', onKeydown);
    }, 0);
  } else {
    document.removeEventListener('mousedown', onClickOutside);
    document.removeEventListener('keydown', onKeydown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside);
  document.removeEventListener('keydown', onKeydown);
});
</script>

<style lang="scss" scoped>
.enmenu {
  position: fixed;
  top: 76px;
  right: 32px;
  width: 320px;
  background: var(--glass-bg, rgba(255, 255, 255, 0.96));
  backdrop-filter: var(--glass-blur, blur(16px));
  -webkit-backdrop-filter: var(--glass-blur, blur(16px));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover, 0 8px 40px rgba(0, 0, 0, 0.18));
  z-index: var(--z-popover, 200);
  overflow: hidden;

  .body--dark & {
    background: rgba(15, 23, 42, 0.96);
  }

  &__profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 18px 10px;
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
    flex-shrink: 0;
  }

  &__profile-info {
    display: flex;
    flex-direction: column;
  }

  &__profile-name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 14px;
    color: var(--fg-1);
  }

  &__profile-email {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--fg-2);
  }

  &__group {
    padding: 6px 8px;
  }

  &__group-label {
    padding: 8px 12px 4px;
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fg-2);
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
    transition: background var(--dur-base, 150ms);

    &:hover { background: var(--surface-2); }

    &--destructive {
      color: var(--expense-fg, #dc2626);

      .enmenu__row-icon { color: var(--expense, #ef4444); }
    }
  }

  &__row-icon {
    font-size: 18px;
    color: var(--fg-2);
    flex-shrink: 0;
  }

  &__row-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__row-hint {
    font-size: 11px;
    color: var(--fg-2);
    font-weight: 400;
  }

  &__row-chevron {
    font-size: 18px;
    color: var(--fg-3, var(--fg-2));
  }
}

.enmenu-enter-active,
.enmenu-leave-active {
  transition: opacity var(--dur-base, 150ms), transform var(--dur-base, 150ms);
}
.enmenu-enter-from,
.enmenu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
