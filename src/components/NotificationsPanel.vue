<template>
  <!-- Desktop: popover anchored to bell -->
  <teleport to="body">
    <transition name="np-desktop">
      <div
        v-if="show && !isMobile"
        ref="panelRef"
        role="dialog"
        aria-label="Notificaciones"
        class="np-popover"
      >
        <NpHeader :unread-count="unreadCount" @mark-all="markAllRead" />
        <div class="np-list">
          <NpRow v-for="n in items" :key="n.id" :item="n" @read="readOne(n.id)" />
          <NpFooter @close="emit('close')" />
        </div>
      </div>
    </transition>

    <!-- Mobile: bottom-sheet overlay -->
    <transition name="np-sheet">
      <div
        v-if="show && isMobile"
        class="np-overlay"
        @click.self="emit('close')"
      >
        <div ref="panelRef" role="dialog" aria-label="Notificaciones" class="np-sheet">
          <div class="np-sheet__handle" />
          <NpHeader :unread-count="unreadCount" @mark-all="markAllRead" />
          <div class="np-list np-list--sheet">
            <NpRow v-for="n in items" :key="n.id" :item="n" @read="readOne(n.id)" />
            <NpFooter @close="emit('close')" :on-view-all="viewAll" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

defineOptions({ name: 'NotificationsPanel' });

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ close: [] }>();

const $q = useQuasar();
const router = useRouter();
const isMobile = computed(() => $q.screen.lt.md);
const panelRef = ref<HTMLElement | null>(null);

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
const SEED: Notif[] = [
  { id: 1, icon: 'credit_card',   tone: 'expense', title: 'Cuota Cashea por vencer',       body: 'iPhone 15 · $148.50 vence en 2 días.',              time: 'Hace 2 h',  unread: true  },
  { id: 2, icon: 'savings',       tone: 'info',    title: 'Dinero ocioso detectado',       body: 'Tienes $1,240 sin asignar a ningún cántaro hace 9 días.', time: 'Hace 5 h', unread: true  },
  { id: 3, icon: 'auto_awesome',  tone: 'income',  title: '¡Meta de sueño más cerca!',     body: 'Vacaciones Margarita llegó al 72% de tu objetivo.',   time: 'Ayer',      unread: false },
  { id: 4, icon: 'trending_up',   tone: 'warning', title: 'Cántaro Diversión al 90%',     body: 'Has usado $270 de $300 este mes.',                    time: 'Hace 2 d',  unread: false },
  { id: 5, icon: 'arrow_downward',tone: 'income',  title: 'Pago recibido',                 body: 'Banesco · +$820.00 acreditado a Cuenta principal.',   time: 'Hace 3 d',  unread: false },
  { id: 6, icon: 'receipt_long',  tone: 'info',    title: 'Tu resumen semanal está listo', body: 'Gastaste 8% menos que la semana pasada.',             time: 'Hace 4 d',  unread: false },
];

const items = ref<Notif[]>(SEED.map(n => ({ ...n })));

const unreadCount = computed(() => items.value.filter(n => n.unread).length);

function markAllRead() {
  items.value = items.value.map(n => ({ ...n, unread: false }));
}

function readOne(id: number) {
  const n = items.value.find(n => n.id === id);
  if (n) n.unread = false;
}

// Click-outside closes the panel
function handleClickOutside(e: MouseEvent) {
  if (!props.show) return;
  if (panelRef.value && !panelRef.value.contains(e.target as Node)) {
    emit('close');
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) emit('close');
}

watch(() => props.show, (v) => {
  if (v) {
    items.value = SEED.map(n => ({ ...n }));
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    document.addEventListener('keydown', handleEscape);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});

function viewAll() {
  emit('close');
  void router.push('/user/notifications');
}
</script>

<!-- Sub-components as script-setup compatible inline (no separate files needed) -->
<script lang="ts">
import { defineComponent as dc, h, ref as sRef } from 'vue';

const TONES: Record<string, { fg: string; bg: string }> = {
  expense: { fg: 'var(--expense-fg)', bg: 'var(--expense-soft)' },
  income:  { fg: 'var(--income-fg)',  bg: 'var(--income-soft)'  },
  warning: { fg: 'var(--warning-fg)', bg: 'var(--warning-soft)' },
  info:    { fg: 'var(--info)',       bg: 'var(--surface-2)'    },
};

export const NpHeader = dc({
  name: 'NpHeader',
  props: { unreadCount: Number },
  emits: ['markAll'],
  setup(props, { emit }) {
    return () => h('div', { class: 'np-header' }, [
      h('div', { class: 'np-header__left' }, [
        h('span', { class: 'np-header__title' }, 'Notificaciones'),
        props.unreadCount
          ? h('span', { class: 'np-header__badge' }, `${props.unreadCount} sin leer`)
          : null,
      ]),
      props.unreadCount
        ? h('button', { class: 'np-header__mark-btn', onClick: () => emit('markAll') }, 'Marcar todas')
        : null,
    ]);
  },
});

export const NpRow = dc({
  name: 'NpRow',
  props: { item: Object as () => { id: number; icon: string; tone: string; title: string; body: string; time: string; unread: boolean } },
  emits: ['read'],
  setup(props, { emit }) {
    const hover = sRef(false);
    return () => {
      const n = props.item!;
      const tone = TONES[n.tone] ?? TONES['info']!;
      return h('button', {
        class: ['np-row', { 'np-row--unread': n.unread, 'np-row--hover': hover.value }],
        onMouseenter: () => { hover.value = true; },
        onMouseleave: () => { hover.value = false; },
        onClick: () => emit('read'),
      }, [
        h('span', { class: 'np-row__icon', style: { background: tone.bg, color: tone.fg } },
          h('span', { class: 'material-icons' }, n.icon)
        ),
        h('div', { class: 'np-row__body' }, [
          h('span', { class: 'np-row__title' }, n.title),
          h('span', { class: 'np-row__text' }, n.body),
          h('span', { class: 'np-row__time' }, n.time),
        ]),
        n.unread ? h('span', { class: 'np-row__dot' }) : null,
      ]);
    };
  },
});

export const NpFooter = dc({
  name: 'NpFooter',
  props: { onViewAll: Function as unknown as () => (() => void) | undefined },
  emits: ['close'],
  setup(props, { emit }) {
    const hover = sRef(false);
    return () => h('button', {
      class: ['np-footer-btn', { 'np-footer-btn--hover': hover.value }],
      onMouseenter: () => { hover.value = true; },
      onMouseleave: () => { hover.value = false; },
      onClick: () => { emit('close'); if (props.onViewAll) props.onViewAll(); },
    }, ['Ver todas las notificaciones', h('span', { class: 'material-icons', style: { fontSize: '18px' } }, 'chevron_right')]);
  },
});

export default {};
</script>

<style scoped lang="scss">
// ── Desktop popover ──
.np-popover {
  position: fixed;
  top: 68px;
  right: 28px;
  width: 380px;
  max-height: 540px;
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover, 0 8px 40px rgba(0,0,0,.22));
  border: 1px solid var(--border-hairline);
  z-index: 4000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// ── Mobile overlay ──
.np-overlay {
  position: fixed;
  inset: 0;
  z-index: 4000;
  background: rgba(10,14,28,.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.np-sheet {
  width: 100%;
  max-height: 88vh;
  background: var(--surface-1);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -10px 40px rgba(0,0,0,.28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom);

  &__handle {
    width: 38px; height: 4px;
    border-radius: 999px;
    background: var(--border-hairline);
    margin: 10px auto 6px;
    flex-shrink: 0;
  }
}

// ── Scrollable list ──
.np-list {
  overflow-y: auto;
  flex: 1;
  &--sheet { max-height: 70vh; }
}

// ── Transitions ──
.np-desktop-enter-active { animation: npRise 180ms var(--ease-out); }
.np-desktop-leave-active { animation: npRise 140ms var(--ease-out) reverse; }
@keyframes npRise {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.np-sheet-enter-active .np-sheet { animation: npSlide 220ms var(--ease-out); }
.np-sheet-leave-active .np-sheet { animation: npSlide 160ms var(--ease-out) reverse; }
@keyframes npSlide {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
</style>

<style lang="scss">
// Non-scoped for render-function components
.np-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border-hairline);
  flex-shrink: 0;

  &__left { display: flex; align-items: baseline; gap: 8px; }

  &__title {
    font-family: var(--font-display, sans-serif);
    font-weight: 700; font-size: 17px; color: var(--fg-1);
  }

  &__badge {
    font-family: var(--font-body);
    font-size: 12px; font-weight: 600; color: var(--brand-primary);
  }

  &__mark-btn {
    border: 0; background: transparent; cursor: pointer;
    font-family: var(--font-body); font-size: 12.5px; font-weight: 600;
    color: var(--brand-primary); padding: 0;
  }
}

.np-row {
  width: 100%; border: 0; cursor: pointer; text-align: left;
  display: flex; gap: 12px; align-items: flex-start;
  padding: 13px 18px;
  background: transparent;
  border-bottom: 1px solid var(--border-hairline);
  transition: background var(--dur-base, 160ms) var(--ease-out, ease);
  position: relative;

  &--unread { background: rgba(37,99,235,.045); }
  &--hover { background: var(--surface-2) !important; }

  &__icon {
    flex-shrink: 0; width: 38px; height: 38px;
    border-radius: var(--radius-md, 10px);
    display: inline-flex; align-items: center; justify-content: center;

    .material-icons { font-size: 20px; }
  }

  &__body {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 2px;
  }

  &__title {
    font-family: var(--font-body);
    font-size: 13.5px; color: var(--fg-1);
    font-weight: 700;
  }

  &__text {
    font-family: var(--font-body);
    font-size: 12.5px; color: var(--fg-2); line-height: 1.4;
  }

  &__time {
    font-family: var(--font-body);
    font-size: 11px; color: var(--fg-3); margin-top: 2px;
  }

  &__dot {
    flex-shrink: 0; width: 8px; height: 8px;
    border-radius: 4px; background: var(--info);
    margin-top: 6px;
  }
}

.np-footer-btn {
  width: 100%; border: 0; cursor: pointer;
  padding: 14px 18px; background: transparent;
  font-family: var(--font-body);
  font-size: 13px; font-weight: 600; color: var(--fg-2);
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: background var(--dur-base, 160ms) var(--ease-out, ease);

  &--hover { background: var(--surface-2); }
}
</style>
