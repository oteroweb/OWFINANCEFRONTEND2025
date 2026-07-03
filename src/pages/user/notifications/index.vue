<template>
  <q-page class="notif-page" padding>
    <div class="notif-page__header">
      <div class="notif-page__eyebrow">Centro de mensajes</div>
      <h1 class="t-h1" style="margin: 6px 0 0">Notificaciones</h1>
    </div>

    <p v-if="!notifications.length" class="notif-page__empty">
      Sin notificaciones recientes
    </p>

    <div v-else class="notif-page__list">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="notif-item"
        :class="{ 'notif-item--unread': n.unread }"
        @click="markRead(n.id)"
      >
        <div class="notif-item__icon" :class="`notif-item__icon--${n.tone}`">
          <q-icon :name="n.icon" size="20px" />
        </div>
        <div class="notif-item__body">
          <div class="notif-item__title">{{ n.title }}</div>
          <div class="notif-item__text">{{ n.body }}</div>
          <div class="notif-item__time">{{ n.time }}</div>
        </div>
        <span v-if="n.unread" class="notif-item__dot" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({ name: 'NotificationsPage' });

type NotifTone = 'expense' | 'income' | 'warning' | 'info';

interface Notif {
  id: number;
  icon: string;
  tone: NotifTone;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

// OWF-177: conectar a /api/v1/notifications cuando el endpoint exista
const notifications = ref<Notif[]>([
  { id: 1, icon: 'credit_card',   tone: 'expense', title: 'Cuota Cashea por vencer',       body: 'iPhone 15 · $148.50 vence en 2 días.',                   time: 'Hace 2 h',  unread: true  },
  { id: 2, icon: 'savings',       tone: 'info',    title: 'Dinero ocioso detectado',       body: 'Tienes $1,240 sin asignar a ningún cántaro hace 9 días.', time: 'Hace 5 h',  unread: true  },
  { id: 3, icon: 'auto_awesome',  tone: 'income',  title: '¡Meta de sueño más cerca!',     body: 'Vacaciones Margarita llegó al 72% de tu objetivo.',        time: 'Ayer',      unread: false },
  { id: 4, icon: 'trending_up',   tone: 'warning', title: 'Cántaro Diversión al 90%',     body: 'Has usado $270 de $300 este mes.',                         time: 'Hace 2 d',  unread: false },
  { id: 5, icon: 'arrow_downward',tone: 'income',  title: 'Pago recibido',                 body: 'Banesco · +$820.00 acreditado a Cuenta principal.',        time: 'Hace 3 d',  unread: false },
  { id: 6, icon: 'receipt_long',  tone: 'info',    title: 'Tu resumen semanal está listo', body: 'Gastaste 8% menos que la semana pasada.',                  time: 'Hace 4 d',  unread: false },
]);

function markRead(id: number) {
  const n = notifications.value.find(x => x.id === id);
  if (n) n.unread = false;
}
</script>

<style scoped lang="scss">
.notif-page {
  max-width: 680px;
  margin: 0 auto;
}

.notif-page__header {
  margin-bottom: 24px;
}

.notif-page__eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--fg-3, #94a3b8);
}

.notif-page__empty {
  text-align: center;
  color: var(--fg-2, #64748b);
  padding: 48px 0;
  font-size: 14px;
}

.notif-page__list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  box-shadow: var(--shadow-card, 0 1px 4px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06));
  background: var(--surface-1, #fff);
}

.notif-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-hairline, #e2e8f0);
  cursor: pointer;
  transition: background 140ms;
  position: relative;

  &:last-child { border-bottom: none; }
  &:hover { background: var(--surface-2, #f8fafc); }
  &--unread { background: rgba(37, 99, 235, 0.045); }

  &__icon {
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md, 10px);
    display: flex;
    align-items: center;
    justify-content: center;

    &--expense { background: var(--expense-soft, rgba(239,68,68,.1));  color: var(--expense-fg, #ef4444); }
    &--income  { background: var(--income-soft,  rgba(16,185,129,.1)); color: var(--income-fg,  #10b981); }
    &--warning { background: var(--warning-soft, rgba(245,158,11,.1)); color: var(--warning-fg, #f59e0b); }
    &--info    { background: var(--surface-2, #f1f4f6);               color: var(--info, #3b82f6);       }
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
  }

  &__text {
    font-size: 12.5px;
    color: var(--fg-2, #64748b);
    line-height: 1.4;
  }

  &__time {
    font-size: 11px;
    color: var(--fg-3, #94a3b8);
    margin-top: 2px;
  }

  &__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: var(--info, #3b82f6);
    margin-top: 6px;
  }
}
</style>
