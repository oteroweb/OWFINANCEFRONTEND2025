<template>
  <q-card
    flat
    :class="[
      'q-pa-sm',
      'no-borders-card',
      'ow-accounts-widget',
      { 'ow-accounts-widget--collapsed': collapsed },
    ]"
    data-ow="accounts-widget"
  >
    <div class="row items-center justify-between q-mb-sm" data-ow="toolbar">
      <div class="row items-center q-gutter-xs">
        <q-btn
          dense
          flat
          round
          size="sm"
          :icon="collapsed ? 'chevron_right' : 'expand_more'"
          aria-label="Toggle cuentas"
          @click="collapsed = !collapsed"
        />
        <div class="text-subtitle2">Mis cuentas</div>
        <q-badge v-if="collapsed" color="primary" outline class="q-ml-xs">
          {{ ticked.length ? ticked.length + ' / ' + allCount : allCount }}
        </q-badge>
      </div>
      <div class="row items-center q-gutter-xs" data-ow="toolbar-actions" v-show="!collapsed">
        <q-checkbox
          size="sm"
          :model-value="ticked.length > 0 && ticked.length === allCount"
          @update:model-value="(v) => (v ? selectAllAccounts() : clearSelection())"
          data-ow="select-all-toggle"
        />
        <q-btn
          dense
          flat
          size="sm"
          icon="select_all"
          @click="selectAllAccounts"
          :disable="!hasAccounts"
          data-ow="select-all-btn"
        >
          <q-tooltip>Seleccionar todas</q-tooltip>
        </q-btn>
        <q-btn
          dense
          flat
          size="sm"
          icon="clear"
          @click="clearSelection"
          :disable="!ticked.length"
          data-ow="clear-filter-btn"
        >
          <q-tooltip>Quitar filtro</q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-skeleton v-if="loading && !collapsed" type="text" :thickness="8" class="q-mb-sm" />
    <transition name="fade">
      <!-- Wrap all conditional content in a single root element to satisfy <transition> requirement -->
      <div v-if="!collapsed && !loading" class="ow-accounts-widget__content" data-ow="content">
        <q-list dense class="no-borders-list" data-ow="view-all-list">
          <q-item
            clickable
            v-ripple
            @click="selectAllAccounts"
            class="q-py-xs"
            data-ow="view-all-item"
          >
            <q-item-section>
              <span class="text-primary">Ver todas mis cuentas</span>
            </q-item-section>
          </q-item>
        </q-list>
        <div
          v-for="section in sections"
          :key="'sec-' + section.id"
          class="q-mt-sm ow-accounts-widget__section"
          :data-ow-section-id="String(section.id)"
        >
          <div
            class="section-header bg-primary text-white q-px-sm q-py-xs"
            data-ow="section-header"
            :data-ow-section-id="String(section.id)"
          >
            <q-icon name="folder" size="16px" class="q-mr-sm" />
            <span class="text-caption text-weight-medium">{{ section.label }}</span>
          </div>
          <q-list
            class="no-border-top no-borders-list"
            data-ow="section-accounts"
            :data-ow-section-id="String(section.id)"
          >
            <q-item
              v-for="acc in section.accounts"
              :key="'acc-' + acc.id"
              clickable
              v-ripple
              dense
              class="acc-row ow-accounts-widget__account-row"
              @click="toggleTick(acc.id)"
              data-ow="account-item"
              :data-ow-account-id="String(acc.id)"
            >
              <q-item-section avatar class="ow-accounts-widget__icon">
                <q-icon name="account_balance" size="20px" data-ow="account-icon" />
              </q-item-section>
              <q-item-section class="min-w-0 ow-accounts-widget__label" data-ow="account-label">
                <div class="ellipsis ow-accounts-widget__label-text">
                  {{ acc.label }}
                  <span v-if="acc.balance !== undefined && acc.balance !== null">
                    ({{ formatBalance(acc) }})
                  </span>
                </div>
              </q-item-section>
              <q-item-section side top data-ow="account-side">
                <div class="row items-center q-gutter-xs" data-ow="account-side-row">
                  <!-- Acciones de cuenta -->
                  <q-btn dense flat round icon="more_vert" @click.stop>
                    <q-menu anchor="bottom right" self="top right">
                      <q-list dense>
                        <q-item clickable v-close-popup @click.stop="openAdjustDialog(acc.id, acc)">
                          <q-item-section>Ajustar saldo</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click.stop="recalcBalance(acc.id)">
                          <q-item-section>Recalcular saldo</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                  <!-- Selector -->
                  <q-checkbox
                    size="sm"
                    :model-value="isTicked(acc.id)"
                    @update:model-value="(v) => setTick(acc.id, v)"
                    @click.stop
                    data-ow="account-checkbox"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </transition>
  </q-card>
  <!-- Dialogo ajustar saldo -->
  <q-dialog v-model="showAdjust">
    <q-card style="min-width: 340px">
      <q-card-section class="text-h6">Ajustar saldo</q-card-section>
      <q-card-section>
        <div class="text-caption q-mb-xs">Cuenta: {{ adjustAccountLabel }}</div>
        <q-input
          v-model="adjustNewBalance"
          label="Nuevo saldo"
          type="number"
          step="0.01"
          dense
          filled
        />
        <div class="q-mt-sm">
          <q-checkbox
            v-model="includeInBalanceAdjust"
            label="Generar transacción de ajuste"
            dense
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup :disable="adjusting" />
        <q-btn color="primary" label="Guardar" :loading="adjusting" @click="submitAdjust" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';
import { useTransactionsStore } from 'stores/transactions';

type Node = {
  id: string | number;
  label: string;
  type: 'folder' | 'account';
  children?: Node[];
  balance?: number | undefined;
  currencyCode?: string | undefined;
  currencySymbol?: string | undefined;
};
type RemoteNode = {
  id: string | number;
  label?: string;
  name?: string;
  type: 'folder' | 'account';
  children?: RemoteNode[];
};
type FolderRaw = {
  id: string | number;
  name?: string;
  label?: string;
  parent_id?: string | number | null;
  children?: FolderRaw[];
};
const nodes = ref<Node[]>([]);
const loading = ref(false);
const auth = useAuthStore();
const ticked = ref<Array<string | number>>([]);
const hasAccounts = computed(() => allAccountIds.value.length > 0);
const allCount = computed(() => allAccountIds.value.length);
const txStore = useTransactionsStore();
const $q = useQuasar();
// Estado colapsado del widget (podría persistirse en localStorage si se desea)
const collapsed = ref(false);

type AccountItem = {
  id: string | number;
  label: string;
  balance?: number | undefined;
  currencyCode?: string | undefined;
  currencySymbol?: string | undefined;
};
type Section = {
  id: string | number;
  label: string;
  accounts: AccountItem[];
};

const allAccountIds = computed(() => {
  const ids: Array<string | number> = [];
  const collect = (ns: Node[]) => {
    for (const n of ns) {
      if (n.type === 'account') ids.push(n.id);
      if (n.children?.length) collect(n.children);
    }
  };
  collect(nodes.value);
  return ids;
});

const sections = computed<Section[]>(() => buildSections(nodes.value));

function buildSections(root: Node[]): Section[] {
  const sections: Section[] = [];
  const topFolders = root.filter((n) => n.type === 'folder');
  for (const f of topFolders) {
    const accounts = gatherAccounts(f);
    sections.push({ id: f.id, label: String(f.label || ''), accounts });
  }
  const looseAccounts = root.filter((n) => n.type === 'account');
  if (looseAccounts.length) {
    sections.unshift({
      id: 'otros',
      label: 'Mis cuentas',
      accounts: looseAccounts.map((a) => toAccountItem(a)),
    });
  }
  return sections;
}

function gatherAccounts(folder: Node): AccountItem[] {
  const accs: AccountItem[] = [];
  const walk = (n: Node) => {
    if (n.type === 'account') accs.push(toAccountItem(n));
    n.children?.forEach(walk);
  };
  walk(folder);
  return accs;
}

function toAccountItem(n: Node): AccountItem {
  return {
    id: n.id,
    label: n.label,
    balance: n.balance,
    currencyCode: n.currencyCode,
    currencySymbol: n.currencySymbol,
  };
}

onMounted(async () => {
  // initialize from store (no URL coupling)
  ticked.value = (txStore.selectedAccountIds || []).map((v: unknown) =>
    typeof v === 'string' || typeof v === 'number' ? v : String(v)
  );
  await loadTree();

  const handler = () => {
    // fire and forget refresh (no await inside listener to avoid Promise lint)
    void loadTree();
  };
  window.addEventListener('ow:transactions:changed', handler);
  onUnmounted(() => {
    window.removeEventListener('ow:transactions:changed', handler);
  });
});

// No URL sync

async function loadTree() {
  loading.value = true;
  try {
    // Try consolidated tree endpoint
    try {
      const r = await api.get('/accounts/tree', { params: { user_id: auth.user?.id } });
      const raw: RemoteNode[] = (r.data?.data?.nodes as RemoteNode[]) || [];
      if (Array.isArray(raw) && raw.length) {
        // Also fetch accounts to annotate balances/currency
        let details: Record<
          string,
          { balance?: number | undefined; code?: string | undefined; symbol?: string | undefined }
        > = {};
        try {
          const accResp = await api.get('/accounts', {
            params: { per_page: 1000, user_id: auth.user?.id },
          });
          type ApiAccount = {
            id: string | number;
            initial?: number | string;
            balance?: number | string;
            balance_cached?: number | string;
            balance_calculado?: number | string;
            currency?: { code?: string; symbol?: string };
          };
          const root = (accResp as unknown as { data?: unknown })?.data;
          let list: ApiAccount[] = [];
          if (Array.isArray(root)) list = root as ApiAccount[];
          else if (root && typeof root === 'object') {
            const d1 = (root as { data?: unknown }).data;
            if (Array.isArray(d1)) list = d1 as ApiAccount[];
            else if (d1 && typeof d1 === 'object') {
              const d2 = (d1 as { data?: unknown }).data;
              if (Array.isArray(d2)) list = d2 as ApiAccount[];
            }
          }
          details = {};
          for (const a of list) {
            const num = (v: unknown): number | undefined => {
              const n = Number(v as number | string);
              return Number.isFinite(n) ? n : undefined;
            };
            const bal =
              num(a.balance) ?? num(a.balance_cached) ?? num(a.balance_calculado) ?? num(a.initial);
            details[String(a.id)] = {
              balance: bal,
              code: a.currency?.code,
              symbol: a.currency?.symbol,
            };
          }
        } catch {
          /* ignore balances enrichment */
        }
        const built = mapNodes(raw);
        annotateBalances(built, details);
        nodes.value = built;
        return;
      }
    } catch {
      /* ignore and try fallback */
    }
    // Fallback: folders + accounts flat
    type Folder = {
      id: string | number;
      name?: string;
      label?: string;
      parent_id?: string | number | null;
      children?: FolderRaw[];
    };
    type Account = {
      id: string | number;
      name?: string;
      label?: string;
      folder_id?: string | number | null;
    };
    const [foldersRes, accountsRes] = await Promise.all([
      api.get('/accounts/folders', { params: { user_id: auth.user?.id } }),
      api.get('/accounts', { params: { per_page: 1000, user_id: auth.user?.id } }),
    ]);
    const extract = <T>(payload: unknown): T[] => {
      const p = payload as { data?: unknown };
      const d = p?.data;
      if (Array.isArray(d)) return d as T[];
      const obj = (d as { data?: unknown; items?: unknown }) || {};
      if (Array.isArray(obj.data)) return obj.data as T[];
      if (Array.isArray(obj.items)) return obj.items as T[];
      return [] as T[];
    };
    const folders = extract<Folder>(foldersRes);
    const accounts = extract<Account>(accountsRes);
    // also fetch balances & currency from the same payload if present
    type ApiAccount = {
      id: string | number;
      name: string;
      initial?: number | string;
      balance?: number | string;
      balance_cached?: number | string;
      balance_calculado?: number | string;
      currency?: { code?: string; symbol?: string };
    };
    const accDetails: Record<
      string,
      { balance?: number | undefined; code?: string | undefined; symbol?: string | undefined }
    > = {};
    // Try common envelope shapes: { data: [...] } or { data: { data: [...] } }
    const rawRoot = (accountsRes as unknown as { data?: unknown })?.data;
    let arr: ApiAccount[] = [];
    if (Array.isArray(rawRoot)) {
      arr = rawRoot as ApiAccount[];
    } else if (rawRoot && typeof rawRoot === 'object') {
      const data1 = (rawRoot as { data?: unknown }).data;
      if (Array.isArray(data1)) arr = data1 as ApiAccount[];
      else if (data1 && typeof data1 === 'object') {
        const data2 = (data1 as { data?: unknown }).data;
        if (Array.isArray(data2)) arr = data2 as ApiAccount[];
      }
    }
    for (const a of arr) {
      const num = (v: unknown): number | undefined => {
        const n = Number(v as number | string);
        return Number.isFinite(n) ? n : undefined;
      };
      const bal =
        num(a.balance) ?? num(a.balance_cached) ?? num(a.balance_calculado) ?? num(a.initial);
      accDetails[String(a.id)] = {
        balance: bal,
        code: a.currency?.code,
        symbol: a.currency?.symbol,
      };
    }

    // Build folder tree
    const isFlat =
      folders.length > 0 && !folders.some((f) => Array.isArray(f.children) && f.children.length);
    let folderTree: Node[];
    if (isFlat) {
      const byId = new Map<string, Node>();
      const roots: Node[] = [];
      for (const f of folders) {
        byId.set(String(f.id), {
          id: f.id,
          label: String(f.label ?? f.name ?? ''),
          type: 'folder',
          children: [],
        });
      }
      for (const f of folders) {
        const node = byId.get(String(f.id))!;
        const pid = f.parent_id == null ? null : String(f.parent_id);
        if (pid && byId.has(pid)) byId.get(pid)!.children!.push(node);
        else roots.push(node);
      }
      folderTree = roots;
    } else {
      const mapFolder = (f: FolderRaw): Node => ({
        id: f.id,
        label: String(f.label ?? f.name ?? ''),
        type: 'folder',
        children: Array.isArray(f.children) ? f.children.map(mapFolder) : [],
      });
      folderTree = (folders as FolderRaw[]).map(mapFolder);
    }

    // Place accounts
    const byIdNode = new Map<string, Node>();
    const collect = (ns: Node[]) => {
      for (const n of ns) {
        byIdNode.set(String(n.id), n);
        if (n.children) collect(n.children);
      }
    };
    collect(folderTree);
    for (const a of accounts) {
      const det = accDetails[String(a.id)] || {};
      const node: Node = {
        id: a.id,
        label: String(a.label ?? a.name ?? ''),
        type: 'account',
        balance: det.balance,
        currencyCode: det.code,
        currencySymbol: det.symbol,
      };
      const fid = a.folder_id == null ? null : String(a.folder_id);
      if (fid && byIdNode.has(fid)) byIdNode.get(fid)!.children!.push(node);
      else folderTree.push(node);
    }
    nodes.value = folderTree;
  } finally {
    loading.value = false;
  }
}

function mapNodes(list: RemoteNode[]): Node[] {
  return list.map((n) => ({
    id: n.id,
    label: String(n.label ?? n.name ?? ''),
    type: n.type,
    children: Array.isArray(n.children) ? mapNodes(n.children) : [],
  }));
}

function annotateBalances(
  ns: Node[],
  details: Record<
    string,
    { balance?: number | undefined; code?: string | undefined; symbol?: string | undefined }
  >
) {
  for (const n of ns) {
    if (n.type === 'account') {
      const d = details[String(n.id)];
      if (d) {
        n.balance = d.balance;
        n.currencyCode = d.code;
        n.currencySymbol = d.symbol;
      }
    }
    if (n.children?.length) annotateBalances(n.children, details);
  }
}

// URL decoupled

watch(
  () => ticked.value.slice().sort(),
  (vals, old) => {
    if (JSON.stringify(vals) === JSON.stringify((old || []).slice().sort())) return;
    txStore.setSelectedAccountIds(ticked.value.slice());
  }
);

function clearSelection() {
  ticked.value = [];
}

function selectAllAccounts() {
  ticked.value = allAccountIds.value.slice();
}

function formatBalance(n: {
  balance?: number | undefined;
  currencySymbol?: string | undefined;
  currencyCode?: string | undefined;
}): string {
  const bal = typeof n.balance === 'number' ? n.balance : undefined;
  if (bal == null)
    return '0.00' + n.currencySymbol || n.currencyCode
      ? '0.00 ' + (n.currencySymbol || n.currencyCode)
      : '';
  const sym = n.currencySymbol || '';
  const code = n.currencyCode || '';
  const val = Number(bal).toFixed(2);
  return sym ? `${sym}${val}` : code ? `${val} ${code}` : val;
}

function isTicked(id: string | number): boolean {
  const s = String(id);
  return ticked.value.some((v) => String(v) === s);
}

function setTick(id: string | number, value: boolean) {
  const s = String(id);
  const next = ticked.value.map(String);
  const idx = next.indexOf(s);
  if (value) {
    if (idx === -1) ticked.value = next.concat(s);
  } else if (idx !== -1) {
    next.splice(idx, 1);
    ticked.value = next;
  }
}

function toggleTick(id: string | number) {
  setTick(id, !isTicked(id));
}

// ================== Ajustar / Recalcular saldo ==================
const showAdjust = ref(false);
const adjustAccountId = ref<string | number | null>(null);
const adjustAccountLabel = ref<string>('');
const adjustNewBalance = ref<string>('');
const adjusting = ref(false);
const includeInBalanceAdjust = ref(true);

function openAdjustDialog(
  id: string | number,
  acc?: { label?: string; balance?: number | undefined }
) {
  adjustAccountId.value = id;
  adjustAccountLabel.value = String(acc?.label ?? id);
  adjustNewBalance.value = typeof acc?.balance === 'number' ? acc.balance.toFixed(2) : '';
  includeInBalanceAdjust.value = true;
  showAdjust.value = true;
}

async function submitAdjust(): Promise<void> {
  const id = adjustAccountId.value;
  if (!id) return;
  const val = Number(adjustNewBalance.value);
  if (!Number.isFinite(val)) {
    $q.notify({ type: 'warning', message: 'Ingresa un saldo válido' });
    return;
  }
  try {
    adjusting.value = true;
    await api.post(`/accounts/${id}/adjust-balance`, {
      target_balance: val,
      include_in_balance: includeInBalanceAdjust.value,
      user_id: auth.user?.id,
    });
    // Recalcular saldo tras ajustar
    await api.post(`/accounts/${id}/recalculate-account`, { user_id: auth.user?.id });
    $q.notify({ type: 'positive', message: 'Saldo ajustado' });
    showAdjust.value = false;
    await loadTree();
    window.dispatchEvent(
      new CustomEvent('ow:transactions:changed', { detail: { account_id: id, reason: 'adjust' } })
    );
  } catch {
    $q.notify({ type: 'negative', message: 'Error ajustando saldo' });
  } finally {
    adjusting.value = false;
  }
}

async function recalcBalance(id: string | number): Promise<void> {
  try {
    $q.loading.show({ message: 'Recalculando saldo...' });
    await api.post(`/accounts/${id}/recalculate-account`, { user_id: auth.user?.id });
    $q.notify({ type: 'positive', message: 'Saldo recalculado' });
    await loadTree();
    window.dispatchEvent(
      new CustomEvent('ow:transactions:changed', { detail: { account_id: id, reason: 'recalc' } })
    );
  } catch {
    $q.notify({ type: 'negative', message: 'Error recalculando saldo' });
  } finally {
    $q.loading.hide();
  }
}
</script>

<style scoped>
.no-borders-card {
  box-shadow: none;
  border: 0 !important;
  overflow-x: hidden;
}
.no-borders-list {
  border: 0 !important;
}
.min-w-0 {
  min-width: 0;
}
.ow-accounts-widget .q-item__section--avatar {
  padding-right: 0 !important;
  margin-right: 0 !important;
  min-width: 20px;
}
.ow-accounts-widget__icon .q-icon {
  margin: 0 !important;
}
.ow-accounts-widget__label,
.ow-accounts-widget__label-text {
  margin: 0 !important;
  padding: 0 !important;
}
.acc-node {
  padding: 4px 2px;
}
.section-header {
  display: flex;
  align-items: center;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.no-border-top .q-item:first-child {
  border-top: 0;
}
.acc-row {
  min-height: 36px;
}
.section-header + .q-list {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.q-list + .section-header {
  margin-top: 6px;
}
</style>
