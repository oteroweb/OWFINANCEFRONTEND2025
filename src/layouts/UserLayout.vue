<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="topbar">
        <!-- Perfil -->
        <div class="profile-mini row items-center no-wrap q-gutter-sm">
          <q-avatar size="34px" class="bg-white text-primary">
            <img :src="avatarUrl" alt="avatar" />
          </q-avatar>
          <div class="user-line ellipsis">
            <span class="name text-weight-medium">{{ auth.user?.name || 'Usuario' }}</span>
            <span class="sep">•</span>
            <span class="email">{{ auth.user?.email }}</span>
            <span v-if="defaultCurrencyCode" class="currency-chip">{{ defaultCurrencyCode }}</span>
          </div>
        </div>

        <!-- Menú retirado de la izquierda -->

        <q-space />

        <!-- Menú (derecha) + Logout -->
        <div class="actions">
          <div class="menu-row">
            <q-btn
              v-for="link in menuLinks"
              :key="link.to"
              dense
              no-caps
              flat
              :to="link.to"
              :icon="link.icon"
              :label="link.title"
              class="menu-btn"
            />
          </div>
          <q-btn flat round dense icon="logout" @click="handleLogout" />
        </div>
      </q-toolbar>
      <!-- Moneda por defecto + tasas actuales del usuario -->
      <div class="bg-primary text-white q-px-md q-pb-sm q-pt-xs rates-strip">
        <div class="row items-center q-gutter-xs no-wrap scroll-x">
          <q-chip dense color="white" text-color="primary" class="text-weight-medium">
            {{ defaultCurrencyCode || 'USD' }}
          </q-chip>
          <template v-for="r in currentRates" :key="r.code">
            <q-chip dense color="white" text-color="primary" class="rate-chip-item">
              {{ r.code }}: {{ r.rateLabel }}
              <q-badge v-if="r.is_official" color="teal" class="q-ml-xs">oficial</q-badge>
            </q-chip>
          </template>
        </div>
      </div>
      <!-- Barra de periodos global -->
      <div class="bg-white text-dark">
        <PeriodFilterBar />
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <TransactionCreateDialog />
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { userMenuLinks, defaultAvatarUrl } from 'src/pages/user/config';
import { TransactionCreateDialog } from 'components';
import { PeriodFilterBar } from 'components/models';
import { useUiStore } from 'stores/ui';
import { useQuasar } from 'quasar';
import { useUserRates } from 'src/composables/useUserRates';
const auth = useAuthStore();
const avatarUrl = computed(() => defaultAvatarUrl);
const { defaultCurrencyCode, currentRates } = useUserRates();
const menuLinks = userMenuLinks;
const ui = useUiStore();
const $q = useQuasar();
const router = useRouter();

// (widgets removed for now; leave hooks ready if needed later)
async function handleLogout() {
  // 1) Mostrar modal con botón OK y, al confirmarlo, proceder a cerrar sesión
  try {
    await new Promise<void>((resolve) => {
      $q.dialog({
        title: 'Cerrando sesión',
        message: 'Tu sesión se cerrará ahora.',
        ok: { label: 'OK', color: 'primary' },
        persistent: true,
      }).onOk(() => resolve());
    });
  } catch {
    /* ignore dialog errors */
  }

  // 2) Mostrar overlay de carga mientras se ejecuta el logout y la navegación
  try {
    $q.loading.show({ message: 'Cerrando sesión…' });
  } catch {
    /* ignore loading errors */
  }
  // Cerrar diálogos que puedan disparar watchers (como el de transacciones)
  try {
    ui.closeNewTransactionDialog();
  } catch {
    /* ignore dialog close errors */
  }
  try {
    auth.logout();
    await router.replace('/login');
  } catch {
    try {
      $q.notify({ type: 'negative', message: 'No se pudo redirigir al login' });
    } catch {
      /* ignore notify errors */
    }
  } finally {
    try {
      $q.loading.hide();
    } catch {
      /* ignore loading errors */
    }
  }
}

// Nueva transacción se invocará desde vistas específicas o accesos dedicados
// Moneda por defecto global disponible en defaultCurrencyCode
</script>

<style scoped>
/* topbar actions spacing handled inline */
/* Top single toolbar */
.topbar {
  min-height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.profile-mini {
  max-width: 420px;
}
.user-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.user-line .name,
.user-line .email {
  white-space: nowrap;
}
.user-line .email {
  opacity: 0.9;
  font-size: 12px;
}
.user-line .sep {
  opacity: 0.6;
}
.currency-chip {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.5px;
  font-weight: 600;
  backdrop-filter: saturate(180%) blur(4px);
}
.rates-strip .q-chip {
  height: 22px;
}
.scroll-x {
  overflow-x: auto;
}
.rate-chip-item {
  white-space: nowrap;
}
.actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.menu-scroll {
  height: 42px;
  max-width: 100%;
}
.menu-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 8px;
}
.menu-btn :deep(.q-btn__content) {
  gap: 6px;
}
@media (max-width: 599px) {
  .profile-mini {
    max-width: 260px;
  }
  .menu-scroll {
    height: 38px;
  }
}
</style>
