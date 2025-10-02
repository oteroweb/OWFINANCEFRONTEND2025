<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Configuraciones</div>

    <q-card flat bordered>
      <q-tabs v-model="tab" dense class="text-primary" align="left" inline-label>
        <q-tab name="profile" icon="person" label="Perfil" />
        <q-tab name="accounts" icon="account_balance_wallet" label="Cuentas" />
        <q-tab name="categories" icon="category" label="Categorías" />
        <q-tab name="taxes" icon="percent" label="Impuestos" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated keep-alive>
        <q-tab-panel name="profile">
          <div class="q-gutter-md">
            <div class="text-subtitle1">Información de Perfil</div>
            <div class="row q-col-gutter-md items-center profile-media-row q-mb-lg">
              <div class="col-auto">
                <q-avatar size="96px">
                  <img :src="avatarPreview || avatarUrl" alt="avatar" />
                </q-avatar>
              </div>
              <div class="col-auto">
                <q-btn color="primary" label="Cambiar foto" @click="pickAvatar" />
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileChange"
                />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="name" label="Nombre" outlined dense />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="email" label="Correo" type="email" outlined dense />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="selectedCurrencyId"
                  :options="profileCurrencyOptions"
                  :loading="profileCurrencyLoading"
                  option-label="nameLabel"
                  option-value="id"
                  emit-value
                  map-options
                  use-input
                  :onFilter="onProfileCurrencyFilter"
                  label="Moneda por defecto"
                  outlined
                  dense
                  @focus="ensureProfileCurrenciesLoaded"
                />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="password"
                  label="Nueva contraseña"
                  type="password"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="passwordConfirm"
                  label="Confirmar contraseña"
                  type="password"
                  outlined
                  dense
                />
              </div>
            </div>
            <div>
              <q-btn
                color="primary"
                :loading="saving"
                label="Guardar cambios"
                @click="saveProfile"
              />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="accounts">
          <div class="q-mb-md text-body2">
            Opción Cuentas: Mediante esta opción podrás introducir todas tus cuentas bancarias,
            tarjetas y todo lo relacionado con tus bancos. Puedes agrupar tus cuentas por carpetas
            para que las puedas localizar de manera más sencilla.
          </div>
          <AccountsTree
            ref="accountsTreeRef"
            :can-delete-folder="supportsFolderDelete"
            @create-account="onCreateAccount"
            @create-folder="onCreateFolder"
            @move-node="onMoveNode"
            @view-account="onViewAccount"
            @edit-account="onEditAccount"
            @delete-folder="onDeleteFolder"
          />
          <AccountDialog
            v-model="showAccountDialog"
            :mode="editingAccount ? 'edit' : 'create'"
            :initial-data="editingInitialData"
            :currency-options="currencyOptions"
            :account-type-options="accountTypeOptions"
            @submit="onAccountSubmit"
          />
          <AccountViewerDialog
            v-model="showViewer"
            :account="viewerAccount"
            @edit="openEditFromViewer"
            @delete="onDeleteAccount"
          />
        </q-tab-panel>

        <q-tab-panel name="taxes">
          <CrudPage :dictionary="taxesDictionary" />
        </q-tab-panel>

        <q-tab-panel name="categories">
          <div class="q-mb-sm text-body2">
            Opción Categorías: Mediante esta opción cuando creas un movimiento podrás poner una
            categoría (por ejemplo gastos o ingresos). De esta forma con un solo vistazo podrás ver
            en qué gastas tu dinero y todos tus ingresos. Las categorías las puedes organizar como
            creas más oportuno, con carpetas, subcarpetas, etc.
          </div>
          <div class="cat-tree-row q-mt-sm">
            <CategoriesTree
              ref="categoriesTreeRef"
              @create-category="onCreateCategory"
              @create-folder="onCreateFolderCategory"
              @move-node="onMoveCategoryNode"
              @delete-category="onDeleteCategory"
              @edit-category="onEditCategory"
            />
          </div>

          <CategoryDialog
            v-model="showCategoryDialog"
            :mode="editingCategory ? 'edit' : 'create'"
            :is-folder="categoryForm.isFolder || false"
            :initial-data="{
              name: categoryForm.name,
              date: categoryForm.date,
              active: categoryForm.active,
              parent_id: categoryForm.parent_id,
              icon: categoryForm.icon || null,
              type_transaction: categoryForm.type_transaction || 'both',
              include_in_balance: !!categoryForm.include_in_balance,
            }"
            @submit="onSubmitCategoryDialog"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import CrudPage from 'components/CrudPage.vue';
import CategoriesTree from 'components/CategoriesTree.vue';
import CategoryDialog from 'components/CategoryDialog.vue';
import AccountsTree from 'components/AccountsTree.vue';
import AccountDialog from 'components/AccountDialog.vue';
import AccountViewerDialog from 'components/AccountViewerDialog.vue';
import { useAuthStore } from 'stores/auth';
import { defaultAvatarUrl } from '../config';
import { dictionary as taxesDictionary } from '../taxes/dictionary';
import { api } from 'boot/axios';
import { Notify, useQuasar } from 'quasar';

defineOptions({ name: 'user_settings_page' });

const auth = useAuthStore();
const $q = useQuasar();
const tab = ref<'profile' | 'accounts' | 'taxes' | 'categories'>('profile');

const name = ref(auth.user?.name || '');
const email = ref(auth.user?.email || '');
const password = ref('');
const passwordConfirm = ref('');

const fileInput = ref<HTMLInputElement | null>(null);
const avatarUrl = computed(() => defaultAvatarUrl);
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);

const saving = ref(false);
const showAccountDialog = ref(false);
const showViewer = ref(false);
const supportsFolderDelete = ref(true);
type AccountsTreeExposed = {
  addAccountToFolder: (acc: { id: string; label: string }, parentId?: string | null) => void;
  addFolderToParent: (folder: { id: string; label: string }, parentId?: string | null) => void;
  updateNodeLabel: (id: string, label: string) => void;
  removeNode: (id: string) => void;
  setTree: (nodes: AccountsNodeInput[]) => void;
};
const accountsTreeRef = ref<AccountsTreeExposed | null>(null);
const editingAccount = ref<{ id: string; label: string } | null>(null);
const editingInitialData = ref<{
  name?: string;
  initialAmount?: number | null;
  // legacy support: some backends used `type` as an alias for account_type_id
  type?: string;
  currency_id?: number | string | null;
  account_type_id?: number | string | null;
} | null>(null);
type ViewerAccountData = {
  id: string;
  name: string;
  balance?: number | null;
  currency_label?: string | null;
  opening_date?: string | null;
  image_url?: string | null;
  active?: boolean | null;
};
const viewerAccount = ref<ViewerAccountData | null>(null);

// Accounts tree loader using accounts/tree
type AccountsNodeInput = {
  id: string | number;
  label: string;
  type: 'folder' | 'account';
  children?: AccountsNodeInput[];
};
const accountsLoaded = ref(false);
async function loadAccountsTree() {
  // Primer intento: endpoint agregado que devuelve folders+accounts en árbol
  try {
    type RemoteNode = {
      id: string | number;
      label?: string;
      name?: string;
      type: 'folder' | 'account';
      children?: RemoteNode[];
    };
    const res = await api.get('accounts/tree');
    const raw: RemoteNode[] = (res.data as { data?: { nodes?: RemoteNode[] } }).data?.nodes || [];
    if (Array.isArray(raw) && raw.length > 0) {
      const mapNodes = (nodes: RemoteNode[]): AccountsNodeInput[] =>
        nodes.map((n) => ({
          id: n.id,
          label: String(n.label ?? n.name ?? ''),
          type: n.type,
          children: n.children ? mapNodes(n.children) : [],
        }));
      accountsTreeRef.value?.setTree(mapNodes(raw));
      accountsLoaded.value = true;
      return;
    }
  } catch {
    /* fallback below */
  }

  // Fallback: construir árbol con GET accounts/folders y GET accounts
  try {
    type Folder = {
      id: string | number;
      name?: string;
      label?: string;
      parent_id?: string | number | null;
      children?: Folder[];
    };
    type Account = {
      id: string | number;
      name?: string;
      label?: string;
      folder_id?: string | number | null;
    };
    const [foldersRes, accountsRes] = await Promise.all([
      api.get('accounts/folders'),
      api.get('accounts', { params: { per_page: 1000 } }),
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

    const toNode = (f: Folder): AccountsNodeInput => ({
      id: f.id,
      label: String(f.label ?? f.name ?? ''),
      type: 'folder',
      children: (f.children || []).map(toNode),
    });

    // Si folders viene plano, construir jerarquía por parent_id
    const isFlat =
      folders.length > 0 &&
      !folders.some((f) => Array.isArray(f.children) && f.children.length > 0);
    let folderTree: AccountsNodeInput[];
    if (isFlat) {
      const byId = new Map<string, AccountsNodeInput>();
      const roots: AccountsNodeInput[] = [];
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
        if (pid && byId.has(pid)) {
          const parent = byId.get(pid)!;
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
      folderTree = roots;
    } else {
      folderTree = folders.map(toNode);
    }

    // Colocar cuentas dentro de su carpeta
    const byIdNode = new Map<string, AccountsNodeInput>();
    const collect = (nodes: AccountsNodeInput[]) => {
      for (const n of nodes) {
        byIdNode.set(String(n.id), n);
        if (n.children) collect(n.children);
      }
    };
    collect(folderTree);

    for (const a of accounts) {
      const node: AccountsNodeInput = {
        id: a.id,
        label: String(a.label ?? a.name ?? ''),
        type: 'account',
      };
      const fid = a.folder_id == null ? null : String(a.folder_id);
      if (fid && byIdNode.has(fid)) {
        const parent = byIdNode.get(fid)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        // top-level; AccountsTree agrupará en "Sin asignar"
        folderTree.push(node);
      }
    }

    accountsTreeRef.value?.setTree(folderTree);
    accountsLoaded.value = true;
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'No se pudo cargar el árbol de cuentas';
    Notify.create({ type: 'warning', message: msg });
  }
}

// Categories state/refs
type CategoriesTreeExposed = {
  addCategoryToParent: (
    cat: { id: string; label: string; type?: 'folder' | 'category'; icon?: string | null },
    parentId?: string | null
  ) => void;
  updateNodeLabel: (id: string, label: string) => void;
  updateNodeMeta: (
    id: string,
    patch: { label?: string; icon?: string | null; type?: 'folder' | 'category' }
  ) => void;
  removeNode: (id: string) => void;
  setTree: (children: CatNodeInput[]) => void;
};
const categoriesTreeRef = ref<CategoriesTreeExposed | null>(null);
const showCategoryDialog = ref(false);
const editingCategory = ref<null | { id: string }>(null);
const pendingCategoryParentId = ref<string | null>('root');
const categoryForm = ref<{
  name: string;
  active: boolean;
  date: string;
  parent_id: string | null;
  isFolder?: boolean;
  icon?: string | null;
  type_transaction?: 'income' | 'expense' | 'both' | null;
  include_in_balance?: boolean;
}>({
  name: '',
  active: true,
  date: '',
  parent_id: 'root',
  isFolder: false,
  icon: null,
  type_transaction: 'both',
  include_in_balance: true,
});

// Tipado de nodos para setTree
type CatNodeInput = {
  id: string | number;
  label: string;
  type?: 'folder' | 'category';
  children?: CatNodeInput[];
  icon?: string | null;
};

// Carga inicial de categorías (una sola vez por visita)
const categoriesLoaded = ref(false);
async function loadCategoriesTree() {
  try {
    type RemoteNode = {
      id: string | number;
      name?: string;
      label?: string;
      type?: 'folder' | 'category';
      icon?: string | null;
      children?: RemoteNode[];
    };
    const res = await api.get('categories/tree');
    const data = (res.data as { data?: unknown }).data;
    const raw: RemoteNode[] = Array.isArray(data)
      ? (data as RemoteNode[])
      : data && typeof data === 'object' && Array.isArray((data as { nodes?: unknown }).nodes)
      ? ((data as { nodes?: unknown }).nodes as RemoteNode[])
      : ([] as RemoteNode[]);
    const mapNodes = (nodes: RemoteNode[]): CatNodeInput[] =>
      nodes.map((n) => {
        const kids = n.children ? mapNodes(n.children) : [];
        const type: 'folder' | 'category' = n.type
          ? n.type
          : kids.length > 0
          ? 'folder'
          : 'category';
        return {
          id: n.id,
          label: String(n.label ?? n.name ?? ''),
          type,
          icon: n.icon || null,
          children: kids,
        };
      });
    categoriesTreeRef.value?.setTree(raw.length ? mapNodes(raw) : []);
    categoriesLoaded.value = true;
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'No se pudieron cargar las categorías';
    Notify.create({ type: 'warning', message: msg });
  }
}

onMounted(() => {
  if (tab.value === 'categories' && !categoriesLoaded.value) void loadCategoriesTree();
  if (tab.value === 'accounts' && !accountsLoaded.value) void loadAccountsTree();
});

watch(tab, (val) => {
  if (val === 'categories' && !categoriesLoaded.value) void loadCategoriesTree();
  if (val === 'accounts' && !accountsLoaded.value) void loadAccountsTree();
});

// Options for AccountDialog
type Opt = { label: string; value: string | number };
const currencyOptions = ref<Opt[]>([]);
const accountTypeOptions = ref<Opt[]>([]);
let optionsLoaded = false;

async function loadAccountDialogOptions() {
  if (optionsLoaded) return;
  try {
    const [curRes, typeRes] = await Promise.all([
      api.get('/currencies', { params: { per_page: 1000 } }),
      api.get('/account_types', { params: { per_page: 1000 } }),
    ]);
    type ApiList<T> = { data?: T[] } | { data?: { data?: T[] } } | { data?: { items?: T[] } };
    type Currency = { id: number | string; name?: string; code?: string };
    type AccType = { id: number | string; name?: string };
    const extract = <T>(payload: ApiList<T>): T[] => {
      const p = payload as { data?: unknown };
      const d = p?.data;
      if (Array.isArray(d)) return d as T[];
      const obj = (d as { data?: unknown; items?: unknown }) || {};
      if (Array.isArray(obj.data)) return obj.data as T[];
      if (Array.isArray(obj.items)) return obj.items as T[];
      return [] as T[];
    };
    const currArr = extract<Currency>(curRes.data as ApiList<Currency>);
    const typeArr = extract<AccType>(typeRes.data as ApiList<AccType>);
    currencyOptions.value = currArr.map((c) => ({
      value: c.id,
      label: c.name || c.code || String(c.id),
    }));
    accountTypeOptions.value = typeArr.map((t) => ({ value: t.id, label: t.name || String(t.id) }));
    optionsLoaded = true;
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'No se pudieron cargar opciones';
    Notify.create({ type: 'warning', message: msg });
  }
}

// Debug de endpoints de categorías
type CatDebug = {
  ts: string;
  action: string;
  method: string;
  url: string;
  payload?: unknown;
  response?: unknown;
  error?: unknown;
};
const catDebug = ref<CatDebug[]>([]);
function pushCatDebug(entry: CatDebug) {
  catDebug.value.unshift(entry);
  if (catDebug.value.length > 25) catDebug.value.pop();
}

function pickAvatar() {
  fileInput.value?.click();
}

function onFileChange(evt: Event) {
  const target = evt.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  avatarFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      avatarPreview.value = typeof res === 'string' ? res : '';
    };
    reader.readAsDataURL(file);
  } else {
    avatarPreview.value = null;
  }
}

async function saveProfile() {
  try {
    if (!name.value || !email.value) {
      Notify.create({ type: 'warning', message: 'Nombre y correo son requeridos' });
      return;
    }
    if (password.value && password.value !== passwordConfirm.value) {
      Notify.create({ type: 'warning', message: 'Las contraseñas no coinciden' });
      return;
    }
    saving.value = true;

    // Update profile basic data
    await api.put('/user/profile', {
      name: name.value,
      email: email.value,
      ...(password.value ? { password: password.value } : {}),
      ...(typeof selectedCurrencyId.value === 'number'
        ? { currency_id: selectedCurrencyId.value }
        : {}),
    });

    // Upload avatar if selected
    if (avatarFile.value) {
      const form = new FormData();
      form.append('avatar', avatarFile.value);
      await api.post('/user/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    // Refresh local auth store (incluye moneda por defecto)
    if (auth.user) {
      auth.user.name = name.value;
      auth.user.email = email.value;
      const cid = typeof selectedCurrencyId.value === 'number' ? selectedCurrencyId.value : null;
      if (cid) {
        (auth.user as unknown as LooseUser).currency_id = cid;
        const cur = profileAllCurrencies.value.find((c) => c.id === cid);
        if (cur) {
          (auth.user as unknown as LooseUser).currency = {
            id: cur.id,
            name: cur.name,
            code: cur.code ?? null,
            symbol: cur.symbol ?? null,
          };
        }
      }
      localStorage.setItem('user', JSON.stringify(auth.user));
    }

    // Notificar cambio global de moneda
    try {
      const detail = {
        user_id: auth.user?.id ?? null,
        currency_id: (auth.user as unknown as LooseUser)?.currency_id ?? null,
        currency: (auth.user as unknown as LooseUser)?.currency ?? null,
      };
      window.dispatchEvent(new CustomEvent('ow:user:currency-changed', { detail }));
    } catch {
      /* silent */
    }

    Notify.create({ type: 'positive', message: 'Perfil actualizado' });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error al guardar';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}

// ----- Moneda por defecto (perfil) -----
type ProfileCurrencyOption = {
  id: number;
  name: string;
  code?: string | undefined;
  symbol?: string | undefined;
  nameLabel: string;
};
type LooseUser = {
  currency?: {
    id?: number | null;
    code?: string | null;
    symbol?: string | null;
    name?: string | null;
  } | null;
  currency_id?: number | null;
};
const profileCurrencyOptions = ref<ProfileCurrencyOption[]>([]);
const profileAllCurrencies = ref<ProfileCurrencyOption[]>([]);
const profileCurrencyLoading = ref(false);
function getInitialCurrencyId(): number | null {
  const u = (auth.user as unknown as LooseUser) || null;
  const id = u?.currency?.id ?? u?.currency_id ?? null;
  return typeof id === 'number' ? id : null;
}
const selectedCurrencyId = ref<number | null>(getInitialCurrencyId());

async function ensureProfileCurrenciesLoaded() {
  if (profileAllCurrencies.value.length) return;
  profileCurrencyLoading.value = true;
  try {
    const res = await api.get('/currencies', { params: { per_page: 1000, order_by: 'name', order_dir: 'asc' } });
    type Cur = { id: number; name: string; symbol?: string; code?: string };
    const extract = (payload: unknown): Cur[] => {
      const p = payload as { data?: unknown };
      const d = p?.data;
      if (Array.isArray(d)) return d as Cur[];
      const obj = (d as { data?: unknown; items?: unknown }) || {};
      if (Array.isArray(obj.data)) return obj.data as Cur[];
      if (Array.isArray(obj.items)) return obj.items as Cur[];
      // As fallback, if top-level is array
      if (Array.isArray(payload)) return payload as Cur[];
      return [] as Cur[];
    };
    const raw = extract(res.data);
    const mapped: ProfileCurrencyOption[] = raw.map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol ?? undefined,
      code: c.code ?? undefined,
      nameLabel: c.symbol ? `${c.name} (${c.symbol})` : c.name,
    }));
    profileAllCurrencies.value = mapped;
    profileCurrencyOptions.value = mapped;
    if (selectedCurrencyId.value == null) {
      const u = (auth.user as unknown as LooseUser) || null;
      const id = u?.currency?.id ?? u?.currency_id ?? null;
      selectedCurrencyId.value = typeof id === 'number' ? id : null;
    }
  } catch {
    Notify.create({ type: 'negative', message: 'Error cargando monedas' });
  } finally {
    profileCurrencyLoading.value = false;
  }
}

function onProfileCurrencyFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  done(() => {
    profileCurrencyOptions.value = !needle
      ? profileAllCurrencies.value
      : profileAllCurrencies.value.filter(
          (o) =>
            (o.name || '').toLowerCase().includes(needle) ||
            (o.code || '').toLowerCase().includes(needle)
        );
  });
}

onMounted(() => {
  if (tab.value === 'profile') void ensureProfileCurrenciesLoaded();
});
watch(tab, (t) => {
  if (t === 'profile') void ensureProfileCurrenciesLoaded();
});

function onCreateAccount() {
  // Abrir el flujo existente de creación de cuentas (CrudPage/AccountDialog) si aplica
  // Por ahora, solo notificamos; integración pendiente.
  void loadAccountDialogOptions().finally(() => {
    showAccountDialog.value = true;
  });
}

async function onCreateFolder(payload: { name: string; parent_id: string | null }) {
  try {
    // POST accounts/folders
    const res = await api.post('accounts/folders', {
      name: payload.name,
      parent_id: payload.parent_id === 'root' ? null : payload.parent_id,
    });
    const data = (res.data as { data?: { id?: string } }).data;
    const id = data?.id || `f-${Date.now()}`;
    accountsTreeRef.value?.addFolderToParent(
      { id, label: payload.name },
      payload.parent_id || 'root'
    );
    Notify.create({ type: 'positive', message: `Carpeta creada: ${payload.name}` });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error creando carpeta';
    Notify.create({ type: 'negative', message: msg });
  }
}

async function onMoveNode(payload: {
  node_id: string;
  new_parent_id: string;
  node_type: 'folder' | 'account';
  sort_order?: number;
}) {
  try {
    if (payload.node_type === 'folder') {
      // PATCH accounts/folders/:id/move
      await api.patch(`accounts/folders/${payload.node_id}/move`, {
        parent_id: payload.new_parent_id === 'root' ? null : payload.new_parent_id,
      });
      Notify.create({ type: 'info', message: 'Carpeta movida' });
      return;
    }
    // PATCH accounts/:id/move
    await api.patch(`accounts/${payload.node_id}/move`, {
      folder_id: payload.new_parent_id === 'root' ? null : payload.new_parent_id,
      ...(typeof payload.sort_order === 'number' ? { sort_order: payload.sort_order } : {}),
    });
    Notify.create({ type: 'info', message: 'Movimiento guardado' });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error al mover';
    Notify.create({ type: 'negative', message: msg });
  }
}

async function onAccountSubmit(acc: {
  name: string;
  initialAmount: number | null;
  currency_id?: string | number;
  account_type_id?: string | number;
  type?: string;
}) {
  try {
    if (editingAccount.value) {
      // PUT /accounts/{id}
      await api.put(`accounts/${editingAccount.value.id}`, {
        name: acc.name,
        ...(acc.account_type_id !== undefined && acc.account_type_id !== ''
          ? { account_type_id: acc.account_type_id }
          : acc.type && acc.type !== ''
          ? { account_type_id: acc.type }
          : {}),
        ...(acc.currency_id !== undefined && acc.currency_id !== ''
          ? { currency_id: acc.currency_id }
          : {}),
        ...(typeof acc.initialAmount === 'number' ? { initial: acc.initialAmount } : {}),
      });
      accountsTreeRef.value?.updateNodeLabel(editingAccount.value.id, acc.name);
      Notify.create({ type: 'positive', message: 'Cuenta actualizada' });
    } else {
      // POST /accounts (ajusta campos según la API)
      const res = await api.post('accounts', {
        name: acc.name,
        currency_id: acc.currency_id,
        account_type_id: acc.account_type_id ?? acc.type,
        initial: acc.initialAmount,
        folder_id: null,
        active: true,
      });
      const data = (res.data as { data?: { id?: string; name?: string; folder_id?: string } }).data;
      const id = data?.id || `acc-${Date.now()}`;
      const label = data?.name || acc.name;
      const parentId = data?.folder_id || 'root';
      accountsTreeRef.value?.addAccountToFolder({ id, label }, parentId);
      Notify.create({ type: 'positive', message: `Cuenta creada: ${label}` });
    }
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error creando cuenta';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    showAccountDialog.value = false;
    editingAccount.value = null;
    editingInitialData.value = null;
  }
}

async function onViewAccount(payload: { id: string; label: string }) {
  // Cargar detalles reales de la cuenta
  await loadAccountDetails(payload.id, payload.label);
}

function onEditAccount(payload: { id: string; label: string }) {
  editingAccount.value = payload;
  void (async () => {
    await loadAccountDialogOptions();
    try {
      const res = await api.get(`accounts/${payload.id}`);
      type Detail = BackendAccount & {
        currency_id?: number | string | null;
        account_type_id?: number | string | null;
        initial?: number | string | null;
      };
      const data = (res.data as { data?: Detail }).data || ({} as Detail);
      const initVal =
        typeof data.initial === 'string' || typeof data.initial === 'number'
          ? Number(data.initial)
          : null;
      editingInitialData.value = {
        name: String(data.name ?? payload.label ?? ''),
        initialAmount: Number.isFinite(initVal as number) ? (initVal as number) : null,
        currency_id: data.currency_id ?? null,
        account_type_id: data.account_type_id ?? null,
      };
    } catch {
      editingInitialData.value = { name: payload.label, initialAmount: null };
    } finally {
      showAccountDialog.value = true;
    }
  })();
}

function openEditFromViewer() {
  if (!viewerAccount.value) return;
  const { id, name } = viewerAccount.value;
  editingAccount.value = { id, label: name };
  showViewer.value = false;
  void (async () => {
    await loadAccountDialogOptions();
    try {
      const res = await api.get(`accounts/${id}`);
      type Detail = BackendAccount & {
        currency_id?: number | string | null;
        account_type_id?: number | string | null;
        initial?: number | string | null;
      };
      const data = (res.data as { data?: Detail }).data || ({} as Detail);
      const initVal =
        typeof data.initial === 'string' || typeof data.initial === 'number'
          ? Number(data.initial)
          : null;
      editingInitialData.value = {
        name: String(data.name ?? name ?? ''),
        initialAmount: Number.isFinite(initVal as number) ? (initVal as number) : null,
        currency_id: data.currency_id ?? null,
        account_type_id: data.account_type_id ?? null,
      };
    } catch {
      editingInitialData.value = { name, initialAmount: null };
    } finally {
      showAccountDialog.value = true;
    }
  })();
}

async function onDeleteAccount() {
  if (!viewerAccount.value) return;
  try {
    const ok = await confirmDialog({
      title: 'Eliminar cuenta',
      message: '¿Eliminar esta cuenta? Esta acción no se puede deshacer.',
      ok: { label: 'Eliminar', color: 'negative', flat: true },
      cancel: { label: 'Cancelar', flat: true },
      persistent: true,
    });
    if (!ok) return;
    await api.delete(`accounts/${viewerAccount.value.id}`);
    accountsTreeRef.value?.removeNode(viewerAccount.value.id);
    Notify.create({ type: 'positive', message: 'Cuenta eliminada' });
    showViewer.value = false;
    viewerAccount.value = null;
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error eliminando cuenta';
    Notify.create({ type: 'negative', message: msg });
  }
}

async function onDeleteFolder(payload: { id: string; label: string }) {
  try {
    const ok = await confirmDialog({
      title: 'Eliminar carpeta',
      message:
        '¿Eliminar esta carpeta y su contenido? Esta acción no se puede deshacer. Se moverán las cuentas hijas al nivel superior si tu backend así lo define, o se eliminarán si así está implementado.',
      ok: { label: 'Eliminar', color: 'negative', flat: true },
      cancel: { label: 'Cancelar', flat: true },
      persistent: true,
    });
    if (!ok) return;
    if (supportsFolderDelete.value) {
      await api.delete(`accounts/folders/${payload.id}`);
      accountsTreeRef.value?.removeNode(payload.id);
      Notify.create({ type: 'positive', message: 'Carpeta eliminada' });
    } else {
      Notify.create({ type: 'warning', message: 'Eliminar carpetas no está soportado por la API' });
    }
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error eliminando carpeta';
    Notify.create({ type: 'negative', message: msg });
  }
}

type BackendAccount = {
  id?: string | number;
  name?: string;
  balance?: number | null;
  current_balance?: number | null;
  currency_label?: string | null;
  currency?: { code?: string | null } | null;
  opening_date?: string | null;
  opened_at?: string | null;
  image_url?: string | null;
  active?: boolean | null;
};

async function loadAccountDetails(id: string, fallbackName: string) {
  try {
    // GET /accounts/:id debe devolver dentro de data los campos mostrados
    const res = await api.get(`accounts/${id}`);
    const data = (res.data as { data?: BackendAccount }).data || ({} as BackendAccount);
    viewerAccount.value = {
      id: String(data.id ?? id),
      name: String(data.name ?? fallbackName ?? ''),
      balance: data.balance ?? data.current_balance ?? null,
      currency_label: data.currency_label ?? data.currency?.code ?? null,
      opening_date: data.opening_date ?? data.opened_at ?? null,
      image_url: data.image_url ?? null,
      active: typeof data.active === 'boolean' ? data.active : true,
    };
  } catch (e: unknown) {
    // Si falla, usar mínimos y notificar
    const msg = (e as { message?: string })?.message || 'No se pudo cargar detalles de la cuenta';
    Notify.create({ type: 'warning', message: msg });
    viewerAccount.value = {
      id,
      name: fallbackName,
      balance: null,
      currency_label: null,
      opening_date: null,
      image_url: null,
      active: true,
    };
  } finally {
    showViewer.value = true;
  }
}

function confirmDialog(opts: {
  title: string;
  message: string;
  ok?: { label?: string; color?: string; flat?: boolean };
  cancel?: { label?: string; color?: string; flat?: boolean };
  persistent?: boolean;
}): Promise<boolean> {
  return new Promise((resolve) => {
    $q.dialog({
      title: opts.title,
      message: opts.message,
      ok: opts.ok ?? { label: 'OK', flat: true },
      cancel: opts.cancel ?? { label: 'Cancelar', flat: true },
      persistent: opts.persistent ?? false,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false));
  });
}

// Categories handlers
function onCreateCategory(payload: { parent_id: string | null }) {
  pendingCategoryParentId.value = payload.parent_id ?? 'root';
  editingCategory.value = null;
  categoryForm.value = {
    name: '',
    active: true,
    date: '',
    parent_id: pendingCategoryParentId.value,
    isFolder: false,
  };
  showCategoryDialog.value = true;
}

function onCreateFolderCategory(payload: { parent_id: string | null }) {
  pendingCategoryParentId.value = payload.parent_id ?? 'root';
  editingCategory.value = null;
  categoryForm.value = {
    name: '',
    active: true,
    date: '',
    parent_id: pendingCategoryParentId.value,
    isFolder: true,
  };
  showCategoryDialog.value = true;
}

async function onEditCategory(payload: { id: string; label: string }) {
  editingCategory.value = { id: payload.id };
  try {
    const url = `categories/${payload.id}`;
    pushCatDebug({
      ts: new Date().toLocaleString(),
      action: 'GET categoría',
      method: 'GET',
      url,
    });
    const res = await api.get(url);
    const entry = catDebug.value[0];
    if (entry) entry.response = res.data;
    type RemoteCategory = {
      name?: string;
      active?: boolean;
      date?: string | null;
      parent_id?: string | null;
      icon?: string | null;
      type_transaction?: 'income' | 'expense' | 'both' | null;
      include_in_balance?: boolean | null;
    };
    const data = (res.data as { data?: RemoteCategory }).data ?? {};
    const name = typeof data.name === 'string' ? data.name : payload.label;
    const active = typeof data.active === 'boolean' ? data.active : true;
    const date = typeof data.date === 'string' ? data.date : '';
    const parentId = typeof data.parent_id === 'string' ? data.parent_id : 'root';
    const icon = data.icon ?? null;
    const type_transaction =
      data.type_transaction === 'income' ||
      data.type_transaction === 'expense' ||
      data.type_transaction === 'both'
        ? data.type_transaction
        : 'both';
    const include_in_balance =
      typeof data.include_in_balance === 'boolean' ? data.include_in_balance : true;
    categoryForm.value = {
      name,
      active,
      date,
      parent_id: parentId,
      icon,
      type_transaction,
      include_in_balance,
    };
  } catch (e: unknown) {
    const entry = catDebug.value[0];
    if (entry) entry.error = e;
    categoryForm.value = {
      name: payload.label,
      active: true,
      date: '',
      parent_id: 'root',
      icon: null,
      type_transaction: 'both',
      include_in_balance: true,
    };
  } finally {
    showCategoryDialog.value = true;
  }
}

async function onSubmitCategoryDialog(payload: {
  name: string;
  active: boolean;
  date: string | null;
  parent_id?: string | null;
  isFolder?: boolean;
  icon?: string | null;
  type_transaction?: 'income' | 'expense' | 'both' | null;
  include_in_balance?: boolean;
}) {
  try {
    if (!payload.name) {
      Notify.create({ type: 'warning', message: 'Nombre es requerido' });
      return;
    }
    if (editingCategory.value) {
      const url = `categories/${editingCategory.value.id}`;
      const body = {
        name: payload.name,
        active: payload.active,
        date: payload.date || null,
        parent_id: categoryForm.value.parent_id === 'root' ? null : categoryForm.value.parent_id,
        ...(categoryForm.value.isFolder
          ? { type: 'folder' as const }
          : { type: 'category' as const }),
        icon: payload.icon || null,
        type_transaction: payload.type_transaction ?? 'both',
        include_in_balance: payload.include_in_balance ?? true,
      };
      pushCatDebug({
        ts: new Date().toLocaleString(),
        action: 'PATCH actualizar',
        method: 'PATCH',
        url,
        payload: body,
      });
      const res = await api.patch(url, body);
      const entry = catDebug.value[0];
      if (entry) entry.response = res.data;
      // Update label and icon locally
      categoriesTreeRef.value?.updateNodeMeta(editingCategory.value.id, {
        label: payload.name,
        icon: payload.isFolder ? null : payload.icon || null,
      });
      Notify.create({ type: 'positive', message: 'Categoría actualizada' });
    } else {
      const url = 'categories';
      const body = {
        name: payload.name,
        active: payload.active,
        date: payload.date || null,
        parent_id: pendingCategoryParentId.value === 'root' ? null : pendingCategoryParentId.value,
        type: categoryForm.value.isFolder ? 'folder' : 'category',
        icon: payload.icon || null,
        type_transaction: payload.type_transaction ?? 'both',
        include_in_balance: payload.include_in_balance ?? true,
      };
      pushCatDebug({
        ts: new Date().toLocaleString(),
        action: 'POST crear',
        method: 'POST',
        url,
        payload: body,
      });
      const res = await api.post(url, body);
      const entry = catDebug.value[0];
      if (entry) entry.response = res.data;
      const data = (
        res.data as {
          data?: { id?: string; name?: string; parent_id?: string | null; icon?: string | null };
        }
      ).data;
      const id = data?.id || `cat-${Date.now()}`;
      const label = data?.name || payload.name;
      const parentId = data?.parent_id ?? pendingCategoryParentId.value ?? 'root';
      categoriesTreeRef.value?.addCategoryToParent(
        {
          id,
          label,
          type: categoryForm.value.isFolder ? 'folder' : 'category',
          icon: data?.icon || payload.icon || null,
        },
        parentId || 'root'
      );
      Notify.create({ type: 'positive', message: 'Categoría creada' });
    }
  } catch (e: unknown) {
    const entry = catDebug.value[0];
    if (entry && !entry.error) entry.error = e;
    const msg = (e as { message?: string })?.message || 'Error guardando categoría';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    showCategoryDialog.value = false;
    editingCategory.value = null;
  }
}

async function onMoveCategoryNode(payload: { node_id: string; new_parent_id: string }) {
  try {
    const url = `categories/${payload.node_id}/move`;
    const body = { parent_id: payload.new_parent_id === 'root' ? null : payload.new_parent_id };
    pushCatDebug({
      ts: new Date().toLocaleString(),
      action: 'PATCH mover',
      method: 'PATCH',
      url,
      payload: body,
    });
    const res = await api.patch(url, body);
    const entry = catDebug.value[0];
    if (entry) entry.response = res.data;
    Notify.create({ type: 'info', message: 'Movimiento guardado' });
  } catch (e: unknown) {
    const entry = catDebug.value[0];
    if (entry && !entry.error) entry.error = e;
    const msg = (e as { message?: string })?.message || 'Error moviendo categoría';
    Notify.create({ type: 'negative', message: msg });
  }
}

async function onDeleteCategory(payload: { id: string; label: string }) {
  try {
    const ok = await confirmDialog({
      title: 'Eliminar categoría',
      message: `¿Eliminar la categoría "${payload.label}"? Esta acción no se puede deshacer.`,
      ok: { label: 'Eliminar', color: 'negative', flat: true },
      cancel: { label: 'Cancelar', flat: true },
      persistent: true,
    });
    if (!ok) return;
    const url = `categories/${payload.id}`;
    pushCatDebug({
      ts: new Date().toLocaleString(),
      action: 'DELETE eliminar',
      method: 'DELETE',
      url,
    });
    const res = await api.delete(url);
    const entry = catDebug.value[0];
    if (entry) entry.response = res.data;
    categoriesTreeRef.value?.removeNode(payload.id);
    Notify.create({ type: 'positive', message: 'Categoría eliminada' });
  } catch (e: unknown) {
    const entry = catDebug.value[0];
    if (entry && !entry.error) entry.error = e;
    const msg = (e as { message?: string })?.message || 'Error eliminando categoría';
    Notify.create({ type: 'negative', message: msg });
  }
}
</script>

<style scoped>
.hidden {
  display: none;
}
.profile-media-row {
  padding-left: 10px;
}
.cat-tree-row {
  width: 100%;
  /* show a decent height for the tree; the inner q-scroll-area will handle overflow */
  height: 60vh;
  min-height: 360px;
}
</style>
