<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Mis Categorías</div>
    <div class="q-mb-sm text-body2">
      Organiza tus categorías en jerarquía. Puedes crear, mover y eliminar con confirmación.
    </div>
    <CategoriesTree
      ref="treeRef"
      @create-category="onCreateCategory"
      @move-node="onMoveNode"
      @delete-category="onDeleteCategory"
      @edit-category="onEditCategory"
    />
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 360px">
        <q-card-section class="text-subtitle1"
          >{{ editing ? 'Editar' : 'Nueva' }} categoría</q-card-section
        >
        <q-card-section class="q-gutter-md">
          <q-input v-model="form.name" label="Nombre" dense outlined />
          <q-input v-model="form.date" label="Fecha" dense outlined type="date" />
          <q-toggle v-model="form.active" label="Activo" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat :label="editing ? 'Actualizar' : 'Crear'" color="primary" @click="onSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
defineOptions({ name: 'user_categories_page' });
import { ref } from 'vue';
import CategoriesTree from 'components/CategoriesTree.vue';
import { api } from 'boot/axios';
import { Notify, useQuasar } from 'quasar';

type CategoriesTreeExposed = {
  addCategoryToParent: (
    cat: { id: string; label: string; type?: 'folder' | 'category'; icon?: string | null },
    parentId?: string | null,
    atIndex?: number
  ) => void;
  updateNodeLabel: (id: string, label: string) => void;
  removeNode: (id: string) => void;
};
const treeRef = ref<CategoriesTreeExposed | null>(null);
const $q = useQuasar();

const showDialog = ref(false);
const editing = ref<null | { id: string }>(null);
const pendingParentId = ref<string | null>('root');
const form = ref<{ name: string; active: boolean; date: string; parent_id: string | null }>({
  name: '',
  active: true,
  date: '',
  parent_id: 'root',
});

function openCreate(parentId: string | null) {
  editing.value = null;
  form.value = { name: '', active: true, date: '', parent_id: parentId ?? 'root' };
  showDialog.value = true;
}

function confirmDialog(opts: { title: string; message: string }): Promise<boolean> {
  return new Promise((resolve) => {
    $q.dialog({
      title: opts.title,
      message: opts.message,
      ok: { label: 'Confirmar', flat: true },
      cancel: { label: 'Cancelar', flat: true },
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false));
  });
}

function onCreateCategory(payload: { parent_id: string | null }) {
  pendingParentId.value = payload.parent_id ?? 'root';
  openCreate(pendingParentId.value);
}

async function onEditCategory(payload: { id: string; label: string }) {
  editing.value = { id: payload.id };
  try {
    const res = await api.get(`/user/categories/${payload.id}`);
    type RemoteCategory = {
      name?: unknown;
      active?: unknown;
      date?: unknown;
      parent_id?: unknown;
    };
    const data = (res.data as { data?: RemoteCategory }).data ?? {};
    const name = typeof data.name === 'string' ? data.name : payload.label;
    const active = typeof data.active === 'boolean' ? data.active : true;
    const date = typeof data.date === 'string' ? data.date : '';
    const parentId = typeof data.parent_id === 'string' ? data.parent_id : 'root';
    form.value = { name, active, date, parent_id: parentId };
  } catch {
    // Si falla, usar mínimos
    form.value = { name: payload.label, active: true, date: '', parent_id: 'root' };
  } finally {
    showDialog.value = true;
  }
}

async function onSubmit() {
  try {
    if (!form.value.name) {
      Notify.create({ type: 'warning', message: 'Nombre es requerido' });
      return;
    }
    if (editing.value) {
      // PATCH /user/categories/:id
      await api.patch(`/user/categories/${editing.value.id}`, {
        name: form.value.name,
        active: form.value.active,
        date: form.value.date || null,
        parent_id: form.value.parent_id === 'root' ? null : form.value.parent_id,
      });
      treeRef.value?.updateNodeLabel(editing.value.id, form.value.name);
      Notify.create({ type: 'positive', message: 'Categoría actualizada' });
    } else {
      // POST /user/categories
      const res = await api.post('/user/categories', {
        name: form.value.name,
        active: form.value.active,
        date: form.value.date || null,
        parent_id: pendingParentId.value === 'root' ? null : pendingParentId.value,
      });
      const data = (
        res.data as { data?: { id?: string; name?: string; parent_id?: string | null } }
      ).data;
      const id = data?.id || `cat-${Date.now()}`;
      const label = data?.name || form.value.name;
      const parentId = data?.parent_id ?? pendingParentId.value ?? 'root';
      treeRef.value?.addCategoryToParent({ id, label }, parentId || 'root');
      Notify.create({ type: 'positive', message: 'Categoría creada' });
    }
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error al guardar categoría';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    showDialog.value = false;
    editing.value = null;
  }
}

async function onMoveNode(payload: { node_id: string; new_parent_id: string }) {
  try {
    await api.patch(`/user/categories/${payload.node_id}/move`, {
      parent_id: payload.new_parent_id === 'root' ? null : payload.new_parent_id,
    });
    Notify.create({ type: 'info', message: 'Movimiento guardado' });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error moviendo categoría';
    Notify.create({ type: 'negative', message: msg });
  }
}

async function onDeleteCategory(payload: { id: string; label: string }) {
  try {
    const ok = await confirmDialog({
      title: 'Eliminar categoría',
      message: `¿Eliminar la categoría "${payload.label}"? Esta acción no se puede deshacer.`,
    });
    if (!ok) return;
    await api.delete(`/user/categories/${payload.id}`);
    treeRef.value?.removeNode(payload.id);
    Notify.create({ type: 'positive', message: 'Categoría eliminada' });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error eliminando categoría';
    Notify.create({ type: 'negative', message: msg });
  }
}
</script>
