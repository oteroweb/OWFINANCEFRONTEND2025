<template>
  <div class="sas">
    <!-- ── Mis cuentas ─────────────────────────────────────────────────── -->
    <div class="sas__card">
      <div class="sas__section-head">
        <span class="sas__eyebrow">Mis cuentas</span>
        <span class="sas__count">{{ myAccounts.length }}</span>
      </div>
      <div class="sas__list">
        <div v-for="(a, i) in myAccounts" :key="a.id" class="sas__row" :class="{ 'sas__row--first': i === 0 }">
          <q-avatar size="36px" color="grey-3" text-color="grey-8">{{ a.name.charAt(0).toUpperCase() }}</q-avatar>
          <div class="sas__row-text">
            <div class="sas__row-name">{{ a.name }}</div>
            <div class="sas__label">{{ a.currencyCode || 'USD' }}</div>
          </div>
          <div class="sas__amount">{{ formatMoney(a.balance || 0, a.currencySymbol || '$') }}</div>
          <button class="sas__icon-btn" title="Compartir con mi grupo familiar" @click="emit('share', a.id)">
            <q-icon name="group_add" size="20px" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Compartidas conmigo ─────────────────────────────────────────── -->
    <div class="sas__card">
      <div class="sas__section-head">
        <span class="sas__eyebrow">Compartidas conmigo</span>
        <span class="sas__count">{{ shares.length }}</span>
      </div>
      <div class="sas__list">
        <p v-if="!loading && shares.length === 0" class="sas__label sas__empty">
          Nadie de tu grupo familiar te compartió una cuenta todavía.
        </p>
        <div v-for="(s, i) in shares" :key="s.id" class="sas__shared-item" :class="{ 'sas__row--first': i === 0 }">
          <div class="sas__row" style="cursor: pointer;" @click="toggleOpen(s.id)">
            <q-avatar size="36px" color="grey-3" text-color="grey-8">{{ s.name.charAt(0).toUpperCase() }}</q-avatar>
            <div class="sas__row-text">
              <div class="sas__row-name">{{ s.name }}</div>
              <div class="sas__owner-line">
                <q-avatar size="16px" color="grey-3" text-color="grey-8">{{ (s.owner?.name || '?').charAt(0).toUpperCase() }}</q-avatar>
                <span class="sas__label">Compartida por {{ s.owner?.name || 'desconocido' }}</span>
              </div>
            </div>
            <div class="sas__shared-meta">
              <div class="sas__amount">{{ formatMoney(s.balance, s.currency?.symbol || '$') }}</div>
              <span class="sas__perm-badge" :style="permBadgeStyle(s.permission)">
                <q-icon :name="owfPermission(s.permission).icon" size="13px" />{{ owfPermission(s.permission).badge }}
              </span>
            </div>
          </div>

          <div v-if="openId === s.id" class="sas__detail">
            <div v-if="s.permission === 'view_balance'" class="sas__lock-box">
              <q-icon name="lock" size="20px" color="grey-5" />
              <div class="sas__lock-text">
                <div class="sas__lock-title">De esta cuenta ves solo el saldo</div>
                <p class="sas__label sas__lock-desc">
                  {{ s.owner?.name || 'El dueño' }} te compartió el saldo, no los movimientos. Si necesitás ver el
                  detalle, pedile que cambie el nivel de acceso.
                </p>
              </div>
            </div>
            <div v-else class="sas__tx-box">
              <div v-if="txLoading" class="sas__label" style="padding: 6px 0;">Cargando movimientos…</div>
              <template v-else-if="txByAccount[s.id]?.length">
                <div v-for="t in txByAccount[s.id]" :key="t.id" class="sas__tx-row">
                  <span class="sas__tx-name">{{ t.description || t.provider || 'Movimiento' }}</span>
                  <span class="sas__label">{{ t.date }}</span>
                  <span class="sas__tx-amount" :class="t.amount < 0 ? '' : 'sas__tx-amount--income'">
                    {{ t.amount < 0 ? '-' : '+' }}{{ formatMoney(Math.abs(t.amount), s.currency?.symbol || '$') }}
                  </span>
                </div>
              </template>
              <div v-else class="sas__label" style="padding: 6px 0;">Todavía no hay movimientos en esta cuenta.</div>
              <div class="sas__tx-footer">
                <p class="sas__label" style="flex: 1; margin: 0;">
                  {{ s.permission === 'manage' ? 'Podés registrar y editar movimientos en esta cuenta.' : 'Ves todo el detalle, sin poder editar.' }}
                </p>
                <q-btn v-if="s.permission === 'manage'" size="sm" unelevated rounded color="primary" icon="add" label="Registrar movimiento" @click="emit('register', s.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { useFamilyGroupStore } from 'stores/familyGroup';
import { owfPermission, owfPermTint } from 'src/utils/familyPermissions';

defineOptions({ name: 'SharedAccountsSection' });

interface MyAccountLite {
  id: number;
  name: string;
  balance?: number;
  currencyCode?: string;
  currencySymbol?: string;
}

defineProps<{
  myAccounts: MyAccountLite[];
}>();

const emit = defineEmits<{
  (e: 'share', accountId: number): void;
  (e: 'register', accountId: number): void;
}>();

const store = useFamilyGroupStore();
const loading = ref(false);
const shares = computed(() => store.sharedWithMe);

const openId = ref<number | null>(null);
const txLoading = ref(false);
interface SharedTx { id: number; description?: string; provider?: string; date: string; amount: number }
const txByAccount = ref<Record<number, SharedTx[]>>({});

function formatMoney(v: number, symbol: string) {
  return `${symbol}${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function permBadgeStyle(permission: string | null) {
  const p = owfPermission(permission);
  const tint = owfPermTint(p.weight, true);
  return { background: tint.background, color: tint.color };
}

async function toggleOpen(accountId: number) {
  if (openId.value === accountId) {
    openId.value = null;
    return;
  }
  openId.value = accountId;
  const share = store.sharedWithMe.find((s) => s.id === accountId);
  if (!share || share.permission === 'view_balance' || txByAccount.value[accountId]) return;

  txLoading.value = true;
  try {
    const res = await api.get('/transactions', { params: { payment_account_ids: String(accountId), per_page: 5 } });
    type RawTx = { id: number; description?: string; provider?: string; date?: string; created_at?: string; amount?: string | number };
    const dat = res.data?.data;
    const rawList: RawTx[] = Array.isArray(dat) ? dat : Array.isArray(dat?.data) ? dat.data : [];
    txByAccount.value = {
      ...txByAccount.value,
      [accountId]: rawList.map((t) => ({
        id: t.id,
        description: t.description ?? '',
        provider: t.provider ?? '',
        date: (t.date || t.created_at || '').slice(0, 10),
        amount: Number(t.amount || 0),
      })),
    };
  } catch {
    txByAccount.value = { ...txByAccount.value, [accountId]: [] };
  } finally {
    txLoading.value = false;
  }
}

async function reload() {
  loading.value = true;
  try {
    await store.fetchSharedWithMe();
  } finally {
    loading.value = false;
  }
}

void reload();
</script>

<style scoped>
.sas { display: flex; flex-direction: column; gap: 16px; max-width: 660px; }
.sas__card { background: var(--surface-1); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 22px; }
.sas__section-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.sas__eyebrow { font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--fg-3); }
.sas__count { font-family: var(--font-money); font-size: 11px; color: var(--fg-3); }
.sas__list { display: flex; flex-direction: column; }
.sas__label { font-family: var(--font-body); font-size: 13px; color: var(--fg-2); }
.sas__empty { font-size: 12.5px; padding: 6px 0 2px; }

.sas__row { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-top: 1px solid var(--border-hairline); }
.sas__row--first { border-top: none; }
.sas__row-text { flex: 1; min-width: 0; }
.sas__row-name { font-family: var(--font-body); font-weight: 600; font-size: 14.5px; color: var(--fg-1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sas__amount { font-family: var(--font-money); font-size: 14px; font-weight: 600; color: var(--fg-1); font-variant-numeric: tabular-nums; }
.sas__icon-btn { border: 0; background: transparent; cursor: pointer; color: var(--fg-3); display: flex; padding: 4px; }

.sas__owner-line { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
.sas__shared-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
.sas__perm-badge {
  display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-body); font-size: 11px; font-weight: 600;
  padding: 3px 9px; border-radius: var(--radius-pill);
}

.sas__detail { padding: 2px 0 16px; }
.sas__lock-box { display: flex; gap: 12px; padding: 16px; border-radius: var(--radius-lg); background: var(--surface-2); }
.sas__lock-text { min-width: 0; }
.sas__lock-title { font-family: var(--font-body); font-weight: 600; font-size: 13.5px; color: var(--fg-1); }
.sas__lock-desc { font-size: 12.5px; line-height: 1.5; margin-top: 5px; }

.sas__tx-box { padding: 16px; border-radius: var(--radius-lg); background: var(--surface-2); display: flex; flex-direction: column; gap: 10px; }
.sas__tx-row { display: flex; align-items: center; gap: 10px; }
.sas__tx-name { flex: 1; font-family: var(--font-body); font-size: 13.5px; color: var(--fg-1); }
.sas__tx-amount { font-family: var(--font-money); font-size: 13px; font-weight: 600; color: var(--fg-1); }
.sas__tx-amount--income { color: var(--income-fg); }
.sas__tx-footer { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
</style>
