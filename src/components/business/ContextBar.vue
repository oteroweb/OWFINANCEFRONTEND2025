<template>
  <div class="ctxbar" :style="{ '--ctx-tint': tint }" role="navigation" aria-label="Contabilidad activa">
    <button type="button" class="ctxbar__btn" :aria-label="`Contabilidad activa: ${activeName}. Cambiar`">
      <span class="ctxbar__dot" />
      <span class="ctxbar__name">{{ activeName }}</span>
      <span v-if="activeSub" class="ctxbar__sub">{{ activeSub }}</span>
      <span v-if="store.pendingInvites.length" class="ctxbar__badge">{{ store.pendingInvites.length }}</span>
      <q-icon name="expand_more" size="18px" />

      <q-menu anchor="bottom left" self="top left" :offset="[0, 6]" class="ctxbar__menu">
        <q-list style="min-width: 280px">
          <q-item-label header class="ctxbar__menu-header">Contabilidad</q-item-label>

          <q-item
            v-for="c in contexts"
            :key="c.key"
            v-close-popup
            clickable
            :active="c.key === store.activeContext"
            @click="select(c.key)"
          >
            <q-item-section avatar>
              <span class="ctxbar__swatch" :style="{ background: c.color }" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ c.name }}</q-item-label>
              <q-item-label caption>{{ c.caption }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="c.key === store.activeContext" side>
              <q-icon name="check" size="18px" :style="{ color: c.color }" />
            </q-item-section>
          </q-item>

          <template v-if="store.pendingInvites.length">
            <q-separator spaced />
            <q-item v-close-popup clickable @click="goManage">
              <q-item-section avatar>
                <q-icon name="mail" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ store.pendingInvites.length === 1 ? '1 invitación pendiente' : `${store.pendingInvites.length} invitaciones pendientes` }}
                </q-item-label>
                <q-item-label caption>Revisalas para aceptar o rechazar</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <q-separator spaced />
          <q-item v-close-popup clickable @click="showCreate = true">
            <q-item-section avatar><q-icon name="add_business" /></q-item-section>
            <q-item-section>Crear una empresa</q-item-section>
          </q-item>
          <q-item v-close-popup clickable @click="goManage">
            <q-item-section avatar><q-icon name="tune" /></q-item-section>
            <q-item-section>Gestionar empresas</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </button>

    <CreateBusinessModal v-model="showCreate" @created="onCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  useBusinessStore,
  businessRoleLabel,
  PERSONAL_COLOR,
  type Business,
} from 'stores/business';
import type { ActiveContext } from 'src/utils/businessContext';
import CreateBusinessModal from './CreateBusinessModal.vue';

defineOptions({ name: 'ContextBar' });

const router = useRouter();
const store = useBusinessStore();
const showCreate = ref(false);

const tint = computed(() => store.accentColor);
const activeName = computed(() => store.activeBusiness?.name ?? 'Personal');
const activeSub = computed(() => {
  const b = store.activeBusiness;
  if (!b) return '';
  return businessRoleLabel(b.my_role);
});

interface ContextOption {
  key: ActiveContext;
  name: string;
  caption: string;
  color: string;
}

const contexts = computed<ContextOption[]>(() => [
  { key: 'personal', name: 'Personal', caption: 'Tu contabilidad', color: PERSONAL_COLOR },
  ...store.activeBusinesses.map((b) => ({
    key: b.id as ActiveContext,
    name: b.name,
    caption: `${businessRoleLabel(b.my_role)} · ${b.mode === 'pro' ? 'Pro' : 'Lite'}`,
    color: b.color,
  })),
]);

function select(key: ActiveContext) {
  store.setContext(key);
}

function goManage() {
  void router.push('/user/businesses');
}

function onCreated(b: Business) {
  store.setContext(b.id);
}
</script>

<style scoped lang="scss">
.ctxbar {
  display: flex;
  align-items: center;
  padding: 4px 16px;
  min-height: 34px;
  background: color-mix(in srgb, var(--ctx-tint) 10%, var(--surface-1, #fff));
  border-bottom: 2px solid var(--ctx-tint);
  transition: background 200ms ease, border-color 200ms ease;

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-pill, 999px);
    color: var(--fg-1);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;

    &:hover { background: color-mix(in srgb, var(--ctx-tint) 14%, transparent); }
  }
  &__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--ctx-tint); flex-shrink: 0; }
  &__name { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__sub { font-weight: 500; font-size: 11.5px; color: var(--fg-2); }
  &__badge {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--warning, #f59e0b);
    color: #fff;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  &__swatch { width: 18px; height: 18px; border-radius: 6px; display: inline-block; }
}
</style>
