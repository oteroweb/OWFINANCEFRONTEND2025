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
      <q-tab-panels v-model="tab" animated>
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
          <CrudPage :dictionary="categoriesDictionary" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CrudPage from 'components/CrudPage.vue';
import AccountsTree from 'components/AccountsTree.vue';
import AccountDialog from 'components/AccountDialog.vue';
import AccountViewerDialog from 'components/AccountViewerDialog.vue';
import { useAuthStore } from 'stores/auth';
import { defaultAvatarUrl } from '../config';
import { dictionary as taxesDictionary } from '../taxes/dictionary';
import { dictionary as categoriesDictionary } from '../categories/dictionary';
import { api } from 'boot/axios';
import { Notify, useQuasar } from 'quasar';

defineOptions({ name: 'UserSettingsPage' });

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
type AccountsTreeExposed = {
  addAccountToFolder: (acc: { id: string; label: string }, parentId?: string | null) => void;
  addFolderToParent: (folder: { id: string; label: string }, parentId?: string | null) => void;
  updateNodeLabel: (id: string, label: string) => void;
  removeNode: (id: string) => void;
};
const accountsTreeRef = ref<AccountsTreeExposed | null>(null);
const editingAccount = ref<{ id: string; label: string } | null>(null);
const editingInitialData = ref<{
  name?: string;
  initialAmount?: number | null;
  type?: string;
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
    });

    // Upload avatar if selected
    if (avatarFile.value) {
      const form = new FormData();
      form.append('avatar', avatarFile.value);
      await api.post('/user/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    // Refresh local auth store
    if (auth.user) {
      auth.user.name = name.value;
      auth.user.email = email.value;
      localStorage.setItem('user', JSON.stringify(auth.user));
    }

    Notify.create({ type: 'positive', message: 'Perfil actualizado' });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error al guardar';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}

function onCreateAccount() {
  // Abrir el flujo existente de creación de cuentas (CrudPage/AccountDialog) si aplica
  // Por ahora, solo notificamos; integración pendiente.
  showAccountDialog.value = true;
}

async function onCreateFolder(payload: { name: string; parent_id: string | null }) {
  try {
    // POST /user/account-folders
    const res = await api.post('/user/account-folders', {
      name: payload.name,
      parent_id: payload.parent_id,
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
}) {
  try {
    if (payload.node_type === 'folder') {
      // PATCH /user/account-folders/:id/move
      await api.patch(`/user/account-folders/${payload.node_id}/move`, {
        parent_id: payload.new_parent_id,
      });
    } else {
      // PATCH /user/accounts/:id/move
      await api.patch(`/user/accounts/${payload.node_id}/move`, {
        folder_id: payload.new_parent_id,
      });
    }
    Notify.create({ type: 'info', message: 'Movimiento guardado' });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error al mover';
    Notify.create({ type: 'negative', message: msg });
  }
}

async function onAccountSubmit(acc: { name: string; initialAmount: number | null; type: string }) {
  try {
    if (editingAccount.value) {
      await api.patch(`/user/accounts/${editingAccount.value.id}`, {
        name: acc.name,
        account_type_id: acc.type,
      });
      accountsTreeRef.value?.updateNodeLabel(editingAccount.value.id, acc.name);
      Notify.create({ type: 'positive', message: 'Cuenta actualizada' });
    } else {
      // POST /user/accounts (ajusta campos según tu backend)
      const res = await api.post('/user/accounts', {
        name: acc.name,
        initial_amount: acc.initialAmount,
        account_type_id: acc.type,
        folder_id: 'root',
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
  editingInitialData.value = { name: payload.label, initialAmount: null, type: '' };
  showAccountDialog.value = true;
}

function openEditFromViewer() {
  if (!viewerAccount.value) return;
  const { id, name } = viewerAccount.value;
  editingAccount.value = { id, label: name };
  editingInitialData.value = { name, initialAmount: null, type: '' };
  showViewer.value = false;
  showAccountDialog.value = true;
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
    await api.delete(`/user/accounts/${viewerAccount.value.id}`);
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
    await api.delete(`/user/account-folders/${payload.id}`);
    accountsTreeRef.value?.removeNode(payload.id);
    Notify.create({ type: 'positive', message: 'Carpeta eliminada' });
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
    // Ajusta a tu backend: GET /user/accounts/:id debe devolver dentro de data los campos mostrados
    const res = await api.get(`/user/accounts/${id}`);
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
</script>

<style scoped>
.hidden {
  display: none;
}
.profile-media-row {
  padding-left: 10px;
}
</style>
