import { ref, computed, watch } from 'vue';
import { useTransactionsStore, type Transaction } from 'stores/transactions';
import { useTransactionTypesStore, type TransactionType } from 'stores/transactionTypes';
import { api } from 'boot/axios';

export interface TransactionFormState {
  id?: number;
  name: string;
  amount: number | null;
  datetime: string; // ISO local slice (yyyy-MM-ddTHH:mm)
  provider_id: number | null;
  account_id: number | null;
  rate: number | null;
  transaction_type_id: string | null;
  account_from_id: number | null;
  account_to_id: number | null;
  url_file: string;
}

export interface UseTransactionFormOptions {
  mode: 'create' | 'edit';
}

export function useTransactionForm() {
  const tsStore = useTransactionsStore();
  const ttypes = useTransactionTypesStore();

  const form = ref<TransactionFormState>(initialForm());
  // Flag para excluir la transacción del balance agregado de cuentas
  const includeInBalance = ref(true);
  function initialForm(): TransactionFormState {
    return {
      name: '',
      amount: null,
      datetime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
      provider_id: null,
      account_id: null,
      rate: null,
      transaction_type_id: null,
      account_from_id: null,
      account_to_id: null,
      url_file: '',
    };
  }
  function reset() { form.value = initialForm(); }

  // ===== Transaction Types =====
  const ttOptions = ref<{ label: string; value: string }[]>([]);
  async function loadTransactionTypes() {
  // fetchTransactionTypes está definido en el store; usamos as unknown para evitar any directo
  const fetchFn = (ttypes as unknown as { fetchTransactionTypes?: () => Promise<void> }).fetchTransactionTypes;
  if (fetchFn) await fetchFn();
    const bySlug = (s: string) => ttypes.types.find((t: TransactionType) => (t.slug || '').toLowerCase() === s);
    const byName = (n: string) => ttypes.types.find((t: TransactionType) => t.name.toLowerCase().includes(n));
    const income = bySlug('income') || byName('ingreso');
    const expense = bySlug('expense') || byName('egreso');
    const transfer = bySlug('transfer') || byName('transfer') || byName('transferencia');
    const optsLocal: { label: string; value: string }[] = [];
    if (income) optsLocal.push({ label: income.name, value: income.id });
    if (expense) optsLocal.push({ label: expense.name, value: expense.id });
    if (transfer) optsLocal.push({ label: transfer.name, value: transfer.id });
    ttOptions.value = optsLocal;
    if (!form.value.transaction_type_id && income) form.value.transaction_type_id = income.id;
  }

  // ===== Providers =====
  interface ProviderOption { id: number; name: string; address?: string }
  const providerOptions = ref<ProviderOption[]>([]);
  let allProviders: ProviderOption[] = [];
  let providersLoaded = false;
  function providerLabel(p: { name?: string; address?: string }) {
    if (!p) return '';
    return p.address ? `${p.name} (${p.address})` : p.name || '';
  }
  function onProviderFilter(val: string, done: (cb: () => void) => void) {
    const needle = (val || '').toLowerCase();
    done(() => {
      providerOptions.value = !needle
        ? allProviders.slice()
        : allProviders.filter((p) => (p.name || '').toLowerCase().includes(needle));
    });
  }
  async function ensureProvidersLoaded() {
    if (providersLoaded) return;
    try {
      const r = await api.get('/providers');
      const list = (r.data?.data || r.data) as ProviderOption[];
      allProviders = Array.isArray(list) ? list : [];
      providerOptions.value = allProviders.slice();
      providersLoaded = true;
    } catch (e) {
      console.warn('Error cargando providers', e);
    }
  }
  function reloadProviders() { providersLoaded = false; void ensureProvidersLoaded(); }

  // ===== Accounts =====
  interface AccountOption { id: number; name: string; balance?: number; currencySymbol?: string; currencyCode?: string; currencyId?: number | null }
  const accountOptions = ref<AccountOption[]>([]);
   const allAccounts = ref<AccountOption[]>([]);
  let accountsLoaded = false;
  function accountLabel(a: AccountOption) {
    if (!a) return '';
    const bal = a.balance ?? 0;
    const code = a.currencyCode ? ` ${a.currencyCode}` : '';
    return `${a.name} (${bal}${code})`;
  }
  function onAccountFilter(val: string, done: (cb: () => void) => void) {
    const needle = (val || '').toLowerCase();
    done(() => {
      accountOptions.value = !needle
        ? allAccounts.value.slice()
        : allAccounts.value.filter((a: AccountOption) => (a.name || '').toLowerCase().includes(needle));
    });
  }
  async function ensureAccountsLoaded() {
    if (accountsLoaded) return;
    try {
      const r = await api.get('/accounts');
      // Tipar la respuesta de cuentas mínimamente
      interface RawAccount { id: number; name: string; balance?: number; balance_cached?: number; currency?: { id?: number; code?: string; symbol?: string }; currency_symbol?: string; currency_code?: string; currency_id?: number }
      const list = (r.data?.data || r.data) as RawAccount[];
        const mapped: AccountOption[] = (Array.isArray(list) ? list : []).map((a: RawAccount) => ({
        id: a.id,
        name: a.name,
        balance: Number(a.balance ?? a.balance_cached ?? 0),
        currencySymbol: a.currency?.symbol || a.currency_symbol || '',
        currencyCode: a.currency?.code || a.currency_code || '',
        currencyId: a.currency?.id ?? a.currency_id ?? null,
      }));
        allAccounts.value = mapped;
        accountOptions.value = mapped.slice();
      accountsLoaded = true;
    } catch (e) {
      console.warn('Error cargando cuentas', e);
    }
  }
  function reloadAccounts() { accountsLoaded = false; void ensureAccountsLoaded(); }
   function findAccount(id?: number | null) { return allAccounts.value.find(a => a.id === id); }

  // ===== Transfer detection =====
  const isTransfer = computed(() => {
    const id = form.value.transaction_type_id;
    if (!id) return false;
    const ty = ttypes.types.find((t: TransactionType) => t.id === id);
    const slug = (ty?.slug || '').toLowerCase();
    const name = (ty?.name || '').toLowerCase();
    return slug === 'transfer' || name.includes('transfer');
  });
  const showRateInput = computed(() => {
    if (!isTransfer.value) return false;
    const from = findAccount(form.value.account_from_id);
    const to = findAccount(form.value.account_to_id);
    if (!from || !to) return false;
    return (from.currencyId || from.currencyCode) !== (to.currencyId || to.currencyCode);
  });
  const rateLabel = computed(() => 'Tasa (Origen→Destino)');

  // ===== Balance preview =====
  const previewBalance = computed(() => {
    const amt = Number(form.value.amount || 0);
    if (isTransfer.value) {
      const from = findAccount(form.value.account_from_id);
      const to = findAccount(form.value.account_to_id);
      const fromBal = Number(from?.balance || 0);
      const toBal = Number(to?.balance || 0);
      return {
        currentDisplay: `${from?.currencySymbol || ''}${fromBal.toFixed(2)} / ${to?.currencySymbol || ''}${toBal.toFixed(2)}`,
        afterDisplay: `${from?.currencySymbol || ''}${(fromBal - Math.abs(amt)).toFixed(2)} / ${to?.currencySymbol || ''}${(toBal + Math.abs(amt)).toFixed(2)}`,
      };
    }
    const acc = findAccount(form.value.account_id);
    const bal = Number(acc?.balance || 0);
    const after = bal + amt;
    return {
      currentDisplay: `${acc?.currencySymbol || ''}${bal.toFixed(2)}`,
      afterDisplay: `${acc?.currencySymbol || ''}${after.toFixed(2)}`,
    };
  });

  // Ajustar tipo por signo
  watch(
    () => form.value.amount,
    (val) => {
      if (!ttOptions.value.length) return;
      const amt = Number(val);
      if (!Number.isFinite(amt) || amt === 0) return;
      const findBy = (frag: string) => ttOptions.value.find(o => o.label.toLowerCase().includes(frag));
      const inc = findBy('ingreso') || findBy('income');
      const exp = findBy('egreso') || findBy('expense');
      if (amt > 0 && inc && form.value.transaction_type_id !== inc.value) form.value.transaction_type_id = inc.value;
      else if (amt < 0 && exp && form.value.transaction_type_id !== exp.value) form.value.transaction_type_id = exp.value;
    }
  );

  // ===== Persist helpers =====
  function loadFromTransaction(tx: Transaction) {
    form.value = {
      id: tx.id,
      name: tx.name,
      amount: tx.amount ?? null,
      datetime: (tx.date || '').replace(' ', 'T'),
      provider_id: tx.provider_id ?? null,
      account_id: tx.account_id ?? null,
      rate: tx.rate ? Number(tx.rate.value) : null,
      transaction_type_id: tx.transaction_type_id ?? null,
      account_from_id: null,
      account_to_id: null,
      url_file: tx.url_file || '',
    };
  }

  function buildUpdatePayload(): Record<string, unknown> | null {
    if (!form.value.id) return null;
    const existing = tsStore.transactions.find(t => t.id === form.value.id);
    if (!existing) return null;
    const payload = { ...existing } as Record<string, unknown>;
    payload['name'] = form.value.name || '';
    if (form.value.amount != null) payload['amount'] = Number(form.value.amount);
    payload['date'] = form.value.datetime.replace('T', ' ');
    payload['provider_id'] = form.value.provider_id ?? 0;
    payload['account_id'] = form.value.account_id ?? null;
    payload['transaction_type_id'] = form.value.transaction_type_id ?? null;
    if (form.value.url_file) payload['url_file'] = form.value.url_file;
    payload['include_in_balance'] = includeInBalance.value ? 1 : 0;
    return payload;
  }

  async function saveCreate(): Promise<void> {
    // Construir payload básico de creación (sin pagos avanzados ni líneas de factura)
    const id = form.value.transaction_type_id || '';
    const ty = ttypes.types.find((t: TransactionType) => t.id === id);
    const slug = (ty?.slug || '').toLowerCase();
    const isTransferType = slug === 'transfer' || (ty?.name || '').toLowerCase().includes('transfer');

    // Normalizar fecha
    let dateStr = form.value.datetime || '';
    if (dateStr.includes('T')) dateStr = dateStr.replace('T', ' ');
    if (dateStr.length === 16) dateStr += ':00';

    // Validaciones mínimas
    if (isTransferType) {
      if (!form.value.account_from_id || !form.value.account_to_id) throw new Error('Cuenta origen y destino requeridas');
      if (!form.value.amount || form.value.amount <= 0) throw new Error('El importe debe ser positivo');
    } else {
      if (!form.value.account_id) throw new Error('Cuenta requerida');
      if (!form.value.amount || form.value.amount === 0) throw new Error('Monto requerido');
    }

    // Normalizar signo para income/expense
    let amount = Number(form.value.amount || 0);
    if (!isTransferType) {
      if (slug === 'expense') amount = -Math.abs(amount);
      else if (slug === 'income') amount = Math.abs(amount);
    } else {
      amount = Math.abs(amount);
    }

    type CreatePayload = {
      name: string;
      amount: number;
      date: string;
      provider_id: number | null;
      transaction_type_id: string | null;
      url_file: string | null;
      rate: number | null;
      account_id?: number | null;
      account_from_id?: number | null;
      account_to_id?: number | null;
      include_in_balance?: number;
    };

    const payload: CreatePayload = {
      name: form.value.name || '',
      amount,
      date: dateStr,
      provider_id: form.value.provider_id ?? null,
      transaction_type_id: form.value.transaction_type_id ?? null,
      url_file: form.value.url_file || null,
      rate: form.value.rate ?? null,
      include_in_balance: includeInBalance.value ? 1 : 0,
    };
    if (isTransferType) {
      payload.account_from_id = form.value.account_from_id ?? null;
      payload.account_to_id = form.value.account_to_id ?? null;
    } else {
      payload.account_id = form.value.account_id ?? null;
      // Si no se requiere tasa (misma moneda usuario/cuenta), enviar null
      // De lo contrario usar el valor ingresado
      const needRate = showRateInput.value;
      payload.rate = needRate ? (form.value.rate ?? null) : null;
    }

    await tsStore.addTransaction(payload as unknown as Record<string, unknown>);
  }
  async function saveUpdate(): Promise<void> {
    const payload = buildUpdatePayload();
    if (!payload) return;
    // Construimos un objeto Transaction mezclando el existente con campos actualizados ya en buildUpdatePayload
    await tsStore.updateTransaction(payload as unknown as Transaction);
  }

  return {
    form,
    includeInBalance,
    reset,
    ttOptions,
    loadTransactionTypes,
    providerOptions,
    providerLabel,
    onProviderFilter,
    ensureProvidersLoaded,
    reloadProviders,
    accountOptions,
  allAccounts,
    accountLabel,
    onAccountFilter,
    ensureAccountsLoaded,
    reloadAccounts,
    isTransfer,
    showRateInput,
    rateLabel,
    previewBalance,
    loadFromTransaction,
    saveCreate,
    saveUpdate,
  };
}
