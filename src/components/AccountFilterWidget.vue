<template>
  <div ref="rootRef" class="af-root">
    <!-- Pill button -->
    <button
      :class="['af-pill', selectedIds.length > 0 && 'af-pill--active']"
      @click.stop="togglePanel"
    >
      <span class="material-icons af-icon">account_balance_wallet</span>
      <span>{{ pillLabel }}</span>
      <span v-if="selectedIds.length > 1" class="af-pill__badge">{{ selectedIds.length }}</span>
      <span class="material-icons af-icon af-icon--chevron">{{ open ? 'expand_less' : 'expand_more' }}</span>
    </button>

    <!-- Panel via Teleport to avoid overflow clipping -->
    <Teleport to="body">
      <div
        v-if="open"
        class="af-panel"
        :style="panelStyle"
        @click.stop
      >
        <!-- Header -->
        <div class="af-panel__header">
          <div class="af-panel__title-row">
            <span class="af-panel__title">Filtrar por cuenta</span>
            <button
              v-if="selectedIds.length"
              class="af-panel__clear"
              @click="emit('update:selected', [])"
            >
              Limpiar
            </button>
          </div>

          <!-- Smart segments -->
          <div class="af-segments">
            <button
              v-for="seg in segments"
              :key="seg.id"
              :class="['af-seg', activeSeg === seg.id && 'af-seg--on']"
              @click="applySeg(seg)"
            >
              {{ seg.label }}
            </button>
          </div>

          <!-- Search -->
          <div class="af-search">
            <span class="material-icons af-icon af-icon--search">search</span>
            <input
              v-model="query"
              class="af-search__input"
              placeholder="Buscar cuenta…"
            />
            <span
              v-if="query"
              class="material-icons af-icon af-icon--clear"
              @click="query = ''"
            >close</span>
          </div>
        </div>

        <!-- Account list -->
        <div class="af-list">
          <template v-for="group in filteredGroups" :key="group.name">
            <!-- Group header -->
            <div class="af-group-header" @click="toggleGroup(group.accounts)">
              <AfCheck :on="groupAllOn(group)" :partial="groupSomeOn(group) && !groupAllOn(group)" />
              <span class="af-group-header__name">{{ group.name }}</span>
              <span
                class="af-group-header__total"
                :class="{ 'af-neg': groupUSD(group) < 0 }"
              >
                {{ fmtUSD(groupUSD(group)) }}
              </span>
            </div>

            <!-- Account rows -->
            <div
              v-for="acct in group.accounts"
              :key="acct.id"
              :class="['af-row', isSelected(acct.id) && 'af-row--on']"
              @click="toggleAccount(acct.id)"
            >
              <AfCheck :on="isSelected(acct.id)" />

              <div
                class="af-row__badge"
                :style="{ background: acct.color || 'var(--brand-primary)' }"
              >
                <span class="material-icons af-icon af-icon--type">{{ typeIcon(acct) }}</span>
              </div>

              <div class="af-row__info">
                <div class="af-row__name">{{ acct.name }}</div>
                <div class="af-row__sub">
                  {{ acct.currency }}{{ acct.last4 ? ` · ····${acct.last4}` : '' }}
                  <span v-if="overrides[acct.id] !== undefined" class="af-row__adjusted">ajustado</span>
                </div>
              </div>

              <!-- Balance / editing / recalculating -->
              <template v-if="editId === acct.id">
                <div class="af-edit" @click.stop>
                  <div class="af-edit__input-wrap">
                    <span class="af-edit__sym">{{ currSym(acct.currency) }}</span>
                    <input
                      ref="editInputRef"
                      v-model="editVal"
                      type="number"
                      class="af-edit__input"
                      @keydown.enter="saveEdit(acct)"
                      @keydown.esc="editId = null"
                    />
                  </div>
                  <button class="af-edit__save" @click.stop="saveEdit(acct)" aria-label="Guardar saldo">
                    <span class="material-icons" style="font-size:17px">check</span>
                  </button>
                  <button class="af-edit__cancel" @click.stop="editId = null" aria-label="Cancelar">
                    <span class="material-icons" style="font-size:16px">close</span>
                  </button>
                </div>
              </template>
              <template v-else>
                <div class="af-row__bal">
                  <span v-if="recalcId === acct.id" class="af-row__recalc">
                    <span class="material-icons af-spin" style="font-size:15px">autorenew</span>
                    Recalculando…
                  </span>
                  <template v-else>
                    <span
                      class="af-row__bal-native"
                      :class="{ 'af-neg': balanceOf(acct) < 0 }"
                    >
                      {{ (balanceOf(acct) < 0 ? '−' : '') + fmtNative(balanceOf(acct), acct.currency) }}
                    </span>
                    <span v-if="acct.currency !== 'USD'" class="af-row__bal-usd">
                      ≈ {{ fmtUSD(toUSD(balanceOf(acct), acct.currency)) }}
                    </span>
                  </template>
                </div>

                <!-- Kebab -->
                <button
                  class="af-kebab"
                  :class="{ 'af-kebab--open': menuId === acct.id }"
                  @click.stop="menuId = menuId === acct.id ? null : acct.id"
                  aria-label="Opciones de cuenta"
                >
                  <span class="material-icons" style="font-size:18px">more_vert</span>
                </button>

                <!-- Kebab dropdown -->
                <div
                  v-if="menuId === acct.id"
                  class="af-menu"
                  @click.stop
                >
                  <button class="af-menu__item" @click.stop="openEdit(acct)">
                    <span class="material-icons af-menu__icon">tune</span>
                    Ajustar saldo
                  </button>
                  <button class="af-menu__item" @click.stop="doRecalc(acct)">
                    <span class="material-icons af-menu__icon">autorenew</span>
                    Recalcular saldo
                  </button>
                </div>
              </template>
            </div>
          </template>

          <div v-if="!filteredGroups.length" class="af-empty">
            No se encontraron cuentas
          </div>
        </div>

        <!-- Footer -->
        <div class="af-footer">
          <div class="af-footer__info">
            <span class="af-footer__count">
              {{ selectedIds.length === 0 ? 'Todas las cuentas' : `${selectedIds.length} cuenta${selectedIds.length !== 1 ? 's' : ''}` }}
            </span>
            <span
              v-if="selectedIds.length"
              class="af-footer__combined"
              :class="{ 'af-neg': combinedUSD < 0 }"
            >
              {{ fmtUSD(combinedUSD) }}
              <span class="af-footer__combined-label">combinado</span>
            </span>
          </div>
          <button class="af-footer__done" @click="open = false">Listo</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

/* ── Types ─────────────────────────────────────────────────────── */
export interface AfAccount {
  id: number;
  name: string;
  currency: string;
  balance: number;
  color?: string | null;
  folder?: string | null;
  last4?: string | null;
  account_type?: string | { name: string } | null;
}

export interface AfGroup {
  name: string;
  accounts: AfAccount[];
}

const props = defineProps<{
  selected: number[];
  accounts: AfAccount[];
  groups: AfGroup[];
  rates?: Record<string, number>; // currency code → units per USD (e.g. VES: 36, USD: 1)
}>();

const emit = defineEmits<{
  (e: 'update:selected', ids: number[]): void;
}>();

/* ── Internal state ─────────────────────────────────────────────── */
const rootRef = ref<HTMLElement | null>(null);
const open = ref(false);
const query = ref('');
const menuId = ref<number | null>(null);
const editId = ref<number | null>(null);
const editVal = ref('');
const recalcId = ref<number | null>(null);
const overrides = ref<Record<number, number>>({});
const panelPos = ref({ top: 0, left: 0, width: 0 });

/* ── Panel positioning ──────────────────────────────────────────── */
function updatePos() {
  if (!rootRef.value) return;
  const r = rootRef.value.getBoundingClientRect();
  panelPos.value = { top: r.bottom + 10, left: r.left, width: r.width };
}

function togglePanel() {
  if (!open.value) updatePos();
  open.value = !open.value;
}

const panelStyle = computed(() => ({
  top: `${panelPos.value.top}px`,
  left: `${panelPos.value.left}px`,
}));

/* ── Click-outside ──────────────────────────────────────────────── */
function onOutsideClick(e: MouseEvent) {
  const target = e.target as Node;
  if (rootRef.value && rootRef.value.contains(target)) return;
  // Also check if click is inside the teleported panel
  const panel = document.querySelector('.af-panel');
  if (panel && panel.contains(target)) return;
  open.value = false;
  menuId.value = null;
}

onMounted(() => {
  document.addEventListener('mousedown', onOutsideClick);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onOutsideClick);
});

/* ── Selection helpers ──────────────────────────────────────────── */
const selectedIds = computed(() => props.selected);

function isSelected(id: number): boolean {
  return props.selected.includes(id);
}

function toggleAccount(id: number) {
  if (editId.value !== null) return; // don't toggle while editing
  const cur = new Set(props.selected);
  if (cur.has(id)) { cur.delete(id); } else { cur.add(id); }
  emit('update:selected', Array.from(cur));
}

function toggleGroup(accounts: AfAccount[]) {
  const ids = accounts.map((a) => a.id);
  const allOn = ids.every((i) => props.selected.includes(i));
  const cur = new Set(props.selected);
  ids.forEach((i) => (allOn ? cur.delete(i) : cur.add(i)));
  emit('update:selected', Array.from(cur));
}

function groupAllOn(group: AfGroup): boolean {
  return group.accounts.length > 0 && group.accounts.every((a) => isSelected(a.id));
}

function groupSomeOn(group: AfGroup): boolean {
  return group.accounts.some((a) => isSelected(a.id));
}

/* ── Balance overrides ──────────────────────────────────────────── */
function balanceOf(a: AfAccount): number {
  const ov = overrides.value[a.id];
  return ov !== undefined ? ov : a.balance;
}

function openEdit(a: AfAccount) {
  menuId.value = null;
  editId.value = a.id;
  editVal.value = String(balanceOf(a));
  // Focus input after render
  void nextTick(() => {
    const el = document.querySelector('.af-edit__input') as HTMLInputElement;
    el?.focus();
  });
}

function saveEdit(a: AfAccount) {
  const v = parseFloat(editVal.value);
  if (!isNaN(v)) {
    overrides.value = { ...overrides.value, [a.id]: v };
  }
  editId.value = null;
}

function doRecalc(a: AfAccount) {
  menuId.value = null;
  recalcId.value = a.id;
  setTimeout(() => {
    if (recalcId.value === a.id) recalcId.value = null;
  }, 950);
}

/* ── Smart segments ─────────────────────────────────────────────── */
interface Segment {
  id: string;
  label: string;
  test: ((a: AfAccount) => boolean) | null;
}

const segments: Segment[] = [
  { id: 'all',  label: 'Todas',     test: null },
  { id: 'usd',  label: 'Solo USD',  test: (a) => a.currency === 'USD' },
  { id: 'ves',  label: 'Solo VES',  test: (a) => a.currency === 'VES' },
  { id: 'debt', label: 'Con deuda', test: (a) => balanceOf(a) < 0 },
];

function applySeg(seg: Segment) {
  if (!seg.test) {
    emit('update:selected', []);
    return;
  }
  emit('update:selected', props.accounts.filter(seg.test).map((a) => a.id));
}

const activeSeg = computed<string | null>(() => {
  if (props.selected.length === 0) return 'all';
  for (const seg of segments) {
    if (!seg.test) continue;
    const ids = props.accounts.filter(seg.test).map((a) => a.id);
    if (ids.length === props.selected.length && ids.every((i) => props.selected.includes(i))) {
      return seg.id;
    }
  }
  return null;
});

/* ── Currency helpers ───────────────────────────────────────────── */
function rateOf(cur: string): number {
  if (!props.rates) return 1;
  const r = props.rates[cur];
  return typeof r === 'number' && r > 0 ? r : 1;
}

function toUSD(amount: number, cur: string): number {
  return amount / rateOf(cur);
}

function fmtNative(n: number, cur: string): string {
  const abs = Math.abs(n);
  if (cur === 'VES') return `Bs. ${abs.toLocaleString('es-VE', { maximumFractionDigits: 0 })}`;
  if (cur === 'EUR') return `€ ${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$ ${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtUSD(n: number): string {
  const neg = n < 0;
  return `${neg ? '−' : ''}$ ${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function currSym(cur: string): string {
  if (cur === 'VES') return 'Bs.';
  if (cur === 'EUR') return '€';
  return '$';
}

/* ── Pill label ─────────────────────────────────────────────────── */
const pillLabel = computed(() => {
  const n = props.selected.length;
  if (n === 0) return 'Todas las cuentas';
  if (n === 1) return props.accounts.find((a) => a.id === props.selected[0])?.name ?? 'Cuenta';
  return `${n} cuentas`;
});

/* ── Type icon ──────────────────────────────────────────────────── */
const TYPE_ICON: Record<string, string> = {
  bank: 'account_balance',
  cash: 'payments',
  card: 'credit_card',
  cashea: 'shopping_bag',
};

function typeIcon(a: AfAccount): string {
  const t = a.account_type;
  if (typeof t === 'string') return TYPE_ICON[t.toLowerCase()] ?? 'account_balance';
  if (t && typeof t === 'object' && 'name' in t) {
    return TYPE_ICON[(t as { name: string }).name.toLowerCase()] ?? 'account_balance';
  }
  return 'account_balance';
}

/* ── Filtered groups ────────────────────────────────────────────── */
const filteredGroups = computed<AfGroup[]>(() => {
  const q = query.value.trim().toLowerCase();
  return props.groups
    .map((g) => ({
      name: g.name,
      accounts: g.accounts.filter((a) => !q || a.name.toLowerCase().includes(q)),
    }))
    .filter((g) => g.accounts.length > 0);
});

/* ── Group totals ───────────────────────────────────────────────── */
function groupUSD(group: AfGroup): number {
  return group.accounts.reduce((s, a) => s + toUSD(balanceOf(a), a.currency), 0);
}

/* ── Combined USD (selected accounts only) ──────────────────────── */
const combinedUSD = computed(() =>
  props.accounts
    .filter((a) => isSelected(a.id))
    .reduce((s, a) => s + toUSD(balanceOf(a), a.currency), 0)
);

/* ── Close on Escape ────────────────────────────────────────────── */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    open.value = false;
    menuId.value = null;
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});

/* ── Close menu when panel closes ───────────────────────────────── */
watch(open, (v) => {
  if (!v) {
    menuId.value = null;
    editId.value = null;
  }
});
</script>

<!-- AfCheck sub-component (inline) -->
<script lang="ts">
import { defineComponent, h } from 'vue';

export const AfCheck = defineComponent({
  name: 'AfCheck',
  props: {
    on: { type: Boolean, default: false },
    partial: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h(
        'span',
        {
          class: [
            'af-check',
            props.on && 'af-check--on',
            props.partial && !props.on && 'af-check--partial',
          ],
        },
        props.on
          ? [h('span', { class: 'material-icons', style: 'font-size:15px;color:#fff' }, 'check')]
          : props.partial
          ? [h('span', { class: 'af-check__dash' })]
          : []
      );
  },
});
</script>

<style scoped>
/* ── Keyframe for spinner ── */
@keyframes af-spin {
  to { transform: rotate(360deg); }
}
.af-spin {
  animation: af-spin 0.8s linear infinite;
}

/* ── Root ── */
.af-root {
  position: relative;
  display: inline-block;
}

/* ── Pill ── */
.af-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: var(--radius-pill);
  border: none;
  cursor: pointer;
  font-family: var(--font-body, inherit);
  font-size: 13px;
  font-weight: 600;
  background: var(--surface-2);
  color: var(--fg-1);
  transition: background 0.15s, color 0.15s;
}

.af-pill--active {
  background: var(--brand-primary);
  color: #fff;
}

.af-pill:hover:not(.af-pill--active) {
  filter: brightness(0.96);
}

.af-pill__badge {
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-pill);
  min-width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  font-size: 11px;
  font-family: var(--font-money, var(--font-body, inherit));
  padding: 0 5px;
}

.af-icon {
  font-size: 18px;
}
.af-icon--chevron {
  opacity: 0.7;
}
.af-icon--search,
.af-icon--clear {
  font-size: 17px;
  color: var(--fg-3);
  flex-shrink: 0;
}
.af-icon--clear {
  font-size: 16px;
  cursor: pointer;
}
.af-icon--type {
  font-size: 17px;
  color: #fff;
}

/* ── Panel ── */
.af-panel {
  position: fixed;
  z-index: 2000;
  width: 360px;
  max-width: 90vw;
  max-height: min(70vh, 560px);
  display: flex;
  flex-direction: column;
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-hairline);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}

/* ── Panel header ── */
.af-panel__header {
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border-hairline);
  flex-shrink: 0;
}

.af-panel__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.af-panel__title {
  font-family: var(--font-display, var(--font-body, inherit));
  font-weight: 700;
  font-size: 15px;
  color: var(--fg-1);
}

.af-panel__clear {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--brand-primary);
  font-family: var(--font-body, inherit);
  font-size: 12.5px;
  font-weight: 600;
  padding: 0;
}

/* ── Segments ── */
.af-segments {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.af-seg {
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  color: var(--fg-2);
  font-family: var(--font-body, inherit);
  font-size: 12px;
  font-weight: 500;
  transition: background 0.12s, color 0.12s;
}

.af-seg--on {
  background: color-mix(in srgb, var(--brand-primary) 14%, var(--surface-1));
  color: var(--brand-primary);
  font-weight: 700;
}

/* ── Search ── */
.af-search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  background: var(--surface-2);
  border-radius: var(--radius-pill);
}

.af-search__input {
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  min-width: 0;
  font-family: var(--font-body, inherit);
  font-size: 13px;
  color: var(--fg-1);
}

/* ── List ── */
.af-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 8px;
}

/* ── Group header ── */
.af-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background 0.1s;
}

.af-group-header:hover {
  background: var(--surface-2);
}

.af-group-header__name {
  flex: 1;
  font-family: var(--font-body, inherit);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.af-group-header__total {
  font-family: var(--font-money, var(--font-body, inherit));
  font-size: 11.5px;
  font-weight: 600;
  color: var(--fg-2);
  font-variant-numeric: tabular-nums;
}

/* ── Account row ── */
.af-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 10px;
  cursor: pointer;
  border-radius: var(--radius-md);
  background: transparent;
  transition: background 0.1s;
}

.af-row:hover:not(.af-row--on) {
  background: var(--surface-2);
}

.af-row--on {
  background: color-mix(in srgb, var(--brand-primary) 8%, var(--surface-1));
}

.af-row__badge {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.af-row__info {
  flex: 1;
  min-width: 0;
}

.af-row__name {
  font-family: var(--font-body, inherit);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--fg-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.af-row__sub {
  font-family: var(--font-body, inherit);
  font-size: 11px;
  color: var(--fg-3);
}

.af-row__adjusted {
  color: var(--brand-primary);
  font-weight: 600;
}

/* ── Balance ── */
.af-row__bal {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  min-width: 64px;
}

.af-row__bal-native {
  font-family: var(--font-money, var(--font-body, inherit));
  font-size: 13px;
  font-weight: 700;
  color: var(--fg-1);
  font-variant-numeric: tabular-nums;
}

.af-row__bal-usd {
  font-family: var(--font-body, inherit);
  font-size: 10.5px;
  color: var(--fg-3);
  font-variant-numeric: tabular-nums;
}

.af-row__recalc {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-body, inherit);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--brand-primary);
}

/* ── Negative color ── */
.af-neg,
.af-row__bal-native.af-neg {
  color: var(--expense-fg, #e34040) !important;
}

/* ── Inline edit ── */
.af-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.af-edit__input-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
}

.af-edit__sym {
  font-family: var(--font-money, var(--font-body, inherit));
  font-size: 12px;
  color: var(--fg-3);
}

.af-edit__input {
  border: none;
  outline: none;
  background: transparent;
  width: 84px;
  font-family: var(--font-money, var(--font-body, inherit));
  font-size: 13px;
  color: var(--fg-1);
  font-variant-numeric: tabular-nums;
}

.af-edit__save {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--brand-primary);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.af-edit__cancel {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  color: var(--fg-2);
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

/* ── Kebab ── */
.af-kebab {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--fg-3);
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: background 0.1s;
}

.af-kebab:hover,
.af-kebab--open {
  background: var(--surface-3, var(--surface-2));
}

/* ── Kebab menu ── */
.af-menu {
  position: absolute;
  top: calc(100% - 4px);
  right: 8px;
  z-index: 90;
  min-width: 180px;
  background: var(--surface-1);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.2);
  padding: 5px;
}

.af-menu__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-body, inherit);
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-1);
  transition: background 0.1s;
}

.af-menu__item:hover {
  background: var(--surface-2);
}

.af-menu__icon {
  font-size: 17px;
  color: var(--fg-3);
}

/* ── Empty state ── */
.af-empty {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--fg-3);
}

/* ── Footer ── */
.af-footer {
  padding: 12px 18px;
  border-top: 1px solid var(--border-hairline);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.af-footer__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.af-footer__count {
  font-family: var(--font-body, inherit);
  font-size: 11px;
  color: var(--fg-3);
}

.af-footer__combined {
  font-family: var(--font-money, var(--font-body, inherit));
  font-size: 14px;
  font-weight: 700;
  color: var(--fg-1);
  font-variant-numeric: tabular-nums;
}

.af-footer__combined-label {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--fg-3);
}

.af-footer__done {
  border: none;
  cursor: pointer;
  padding: 9px 20px;
  border-radius: var(--radius-pill);
  background: var(--brand-primary);
  color: #fff;
  font-family: var(--font-body, inherit);
  font-size: 13px;
  font-weight: 600;
}

/* ── AfCheck (used as component + scoped styles leak through :deep) ── */
:deep(.af-check) {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
  border-radius: 6px;
  display: grid;
  place-items: center;
  border: 1.5px solid var(--border-strong, var(--fg-3));
  background: transparent;
  transition: all 120ms;
}

:deep(.af-check--on),
:deep(.af-check--partial) {
  border-color: var(--brand-primary);
  background: var(--brand-primary);
}

:deep(.af-check__dash) {
  width: 9px;
  height: 2px;
  border-radius: 2px;
  background: #fff;
}
</style>
