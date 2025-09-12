<template>
  <div class="accounts-tree">
    <div class="row items-center q-pa-sm q-gutter-sm">
      <div class="col">
        <q-btn
          color="primary"
          dense
          icon="create_new_folder"
          label="Nueva carpeta"
          @click="() => openNewFolderDialog()"
        />
      </div>
      <div class="col-auto">
        <q-btn
          color="orange"
          dense
          icon="add"
          label="Nueva cuenta"
          @click="$emit('create-account')"
        />
      </div>
      <div class="col-auto" v-if="selectedIsFolder && canDeleteFolder">
        <q-btn
          color="negative"
          dense
          icon="delete"
          label="Eliminar carpeta"
          @click="onRequestDeleteFolder"
        />
      </div>
    </div>

    <q-card flat bordered>
      <q-scroll-area style="height: 420px">
        <div v-if="dragNodeId && dragNodeLabel" class="drag-floating">
          Moviendo: <strong>{{ dragNodeLabel }}</strong>
        </div>
        <!-- Root drop target to move folders/accounts to top-level (or to 'Sin asignar' for accounts) -->
        <div
          v-if="dragNodeId"
          class="row items-center no-wrap q-gutter-x-sm tree-node q-ml-sm q-mb-xs"
          :class="{ 'is-drop-target': dragOverRoot }"
          @dragover.prevent="onRootDragOver"
          @drop.prevent="onRootDrop"
          @dragleave="onRootDragLeave"
        >
          <q-icon name="arrow_upward" size="18px" />
          <div class="ellipsis col text-primary">Mover a raíz</div>
        </div>
        <q-tree :nodes="tree" node-key="id" default-expand-all no-transition>
          <template #default-header="{ node }">
            <div
              class="row items-center no-wrap q-gutter-x-sm tree-node"
              :class="{
                'is-hovered': hoveredNodeId === node.id,
                'is-dragging': dragNodeId === node.id,
                'is-selected': selectedNodeId === node.id,
                'is-drop-target': dragOverFolderId === node.id,
              }"
              :draggable="node.id !== UNASSIGNED_ID"
              @mouseenter="hoveredNodeId = node.id"
              @mouseleave="hoveredNodeId = null"
              @click="onSelect(node)"
              @dblclick="onDblClick(node)"
              @dragstart="(ev) => onDragStart(node, ev)"
              @dragover.prevent="(ev) => onDragOver(node, ev)"
              @drop.prevent="(ev) => onDrop(node, ev)"
              @dragleave="onDragLeave(node)"
            >
              <q-icon :name="node.type === 'folder' ? 'folder' : 'account_balance'" size="18px" />
              <div class="ellipsis col">{{ node.label }}</div>
            </div>
          </template>
        </q-tree>
      </q-scroll-area>
    </q-card>

    <q-dialog v-model="showNewFolder">
      <q-card style="min-width: 300px">
        <q-card-section class="text-subtitle1">Nueva carpeta</q-card-section>
        <q-card-section>
          <q-input
            v-model="newFolderName"
            label="Nombre"
            dense
            autofocus
            @keyup.enter="createFolder"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Crear" color="primary" @click="createFolder" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Notify } from 'quasar';

type NodeType = 'folder' | 'account';

type TreeNode = {
  id: string; // unique
  label: string;
  type: NodeType;
  children?: TreeNode[];
};

export default defineComponent({
  name: 'AccountsTree',
  props: {
    // Si la API no soporta eliminar carpetas, ocultar el botón desde el padre
    canDeleteFolder: { type: Boolean, default: false },
  },
  emits: [
    'create-account',
    'create-folder',
    'move-node',
    'view-account',
    'edit-account',
    'delete-folder',
  ],
  setup(_, { emit, expose }) {
    // Top-level nodes; we keep a special folder id 'root' labeled 'Sin asignar'
    const UNASSIGNED_ID = 'root';
    const tree = ref<TreeNode[]>([
      { id: UNASSIGNED_ID, label: 'Sin asignar', type: 'folder', children: [] },
    ]);

    // DnD state
    const dragNodeId = ref<string | null>(null);
    const dragNodeLabel = ref<string | null>(null);
    const hoveredNodeId = ref<string | null>(null);
    const selectedNodeId = ref<string | null>(null);
    const dragOverFolderId = ref<string | null>(null);
    const dragOverRoot = ref<boolean>(false);
    const selectedIsFolder = ref<boolean>(false);

    function onDragStart(node: TreeNode, ev: DragEvent) {
      dragNodeId.value = node.id;
      dragNodeLabel.value = node.label;
      // Provide multiple payload types for consumers
      ev.dataTransfer?.setData('text/plain', node.id);
      try {
        ev.dataTransfer?.setData(
          'application/json',
          JSON.stringify({ id: node.id, label: node.label, type: node.type })
        );
      } catch {
        /* no-op */
      }
      // custom drag image for better UX
      const img = makeDragImage(node.label);
      ev.dataTransfer?.setDragImage(img, 8, 8);
    }

    function onDragOver(node: TreeNode, ev: DragEvent) {
      // Allow dropping on folders (and root); prevent dropping on itself
      const draggingId = dragNodeId.value;
      if (!draggingId) return;
      if (node.type === 'folder' && node.id !== draggingId) {
        ev.preventDefault();
        dragOverFolderId.value = node.id;
      }
    }

    function onDrop(target: TreeNode, ev: DragEvent) {
      const sourceId = ev.dataTransfer?.getData('text/plain') || dragNodeId.value;
      if (!sourceId) return;
      if (target.type !== 'folder' || target.id === sourceId) return;

      const sourceInfo = findNodeWithParent(tree.value, sourceId);
      const targetInfo = findNodeWithParent(tree.value, target.id);
      if (!sourceInfo || !targetInfo) return;

      const { node: srcNode, parent: srcParent } = sourceInfo;
      let { node: tgtNode } = targetInfo;

      // prevent dropping a folder into its own descendant
      if (srcNode.type === 'folder' && isDescendant(srcNode, tgtNode)) {
        Notify.create({
          type: 'warning',
          message: 'No puedes mover una carpeta dentro de sí misma',
        });
        return;
      }

      // UI rule: accounts dropped on 'Sin asignar' stay there; payload 'root' => null en backend
      let payloadParentId = tgtNode.id;
      const isUnassigned = tgtNode.id === UNASSIGNED_ID;
      if (isUnassigned && srcNode.type === 'account') {
        const un = getOrCreateUnassigned();
        tgtNode = un;
        payloadParentId = 'root'; // keep API semantic: root => null folder
      }
      // Do not allow moving a folder into 'Sin asignar'
      if (isUnassigned && srcNode.type === 'folder') {
        Notify.create({ type: 'warning', message: 'No puedes mover carpetas a "Sin asignar"' });
        return;
      }

      // remove from old parent
      if (srcParent) {
        srcParent.children = (srcParent.children || []).filter((n) => n.id !== srcNode.id);
      } else {
        // was root-level
        const idx = tree.value.findIndex((n) => n.id === srcNode.id);
        if (idx !== -1) tree.value.splice(idx, 1);
      }

      // add to target folder
      tgtNode.children = tgtNode.children || [];
      tgtNode.children.push(srcNode);
      const sortOrder = (tgtNode.children?.length || 1) - 1;

      // emit payload for backend with node_type
      emit('move-node', {
        node_id: srcNode.id,
        new_parent_id: payloadParentId,
        node_type: srcNode.type,
        sort_order: sortOrder,
      });

      dragNodeId.value = null;
      dragNodeLabel.value = null;
      dragOverFolderId.value = null;
    }

    function onRootDragOver() {
      if (dragNodeId.value) dragOverRoot.value = true;
    }

    function onRootDragLeave() {
      dragOverRoot.value = false;
    }

    function onRootDrop(ev: DragEvent) {
      const sourceId = ev.dataTransfer?.getData('text/plain') || dragNodeId.value;
      dragOverRoot.value = false;
      if (!sourceId) return;
      const sourceInfo = findNodeWithParent(tree.value, String(sourceId));
      if (!sourceInfo) return;
      const { node: srcNode, parent: srcParent } = sourceInfo;
      // Do not allow moving the special 'Sin asignar' node
      if (srcNode.id === UNASSIGNED_ID) return;

      // Remove from old parent
      if (srcParent) {
        srcParent.children = (srcParent.children || []).filter((n) => n.id !== srcNode.id);
      } else {
        const idx = tree.value.findIndex((n) => n.id === srcNode.id);
        if (idx !== -1) tree.value.splice(idx, 1);
      }

      if (srcNode.type === 'account') {
        // Accounts moved to root go to 'Sin asignar'
        const un = getOrCreateUnassigned();
        un.children = un.children || [];
        un.children.push(srcNode);
        const sortOrder = (un.children?.length || 1) - 1;
        emit('move-node', {
          node_id: srcNode.id,
          new_parent_id: UNASSIGNED_ID, // backend can treat 'root' as null folder
          node_type: 'account',
          sort_order: sortOrder,
        });
      } else {
        // Folders moved to root become top-level siblings of 'Sin asignar'
        tree.value.push(srcNode);
        const sortOrder = tree.value.length - 1;
        emit('move-node', {
          node_id: srcNode.id,
          new_parent_id: 'root', // parent_id null at backend
          node_type: 'folder',
          sort_order: sortOrder,
        });
      }

      dragNodeId.value = null;
      dragNodeLabel.value = null;
    }

    function onDragLeave(node: TreeNode) {
      if (dragOverFolderId.value === node.id) dragOverFolderId.value = null;
    }

    function emitView(node: TreeNode) {
      if (node.type === 'account') emit('view-account', { id: node.id, label: node.label });
    }

    function emitEdit(node: TreeNode) {
      if (node.type === 'account') emit('edit-account', { id: node.id, label: node.label });
    }

    function onDblClick(node: TreeNode) {
      if (node.type === 'account') {
        emit('view-account', { id: node.id, label: node.label });
      }
    }

    function onSelect(node: TreeNode) {
      selectedNodeId.value = node.id;
      selectedIsFolder.value = node.type === 'folder' && node.id !== UNASSIGNED_ID;
    }

    function onRequestDeleteFolder() {
      // Only allow when the selected node is a non-root folder
      if (!selectedIsFolder.value || !selectedNodeId.value) return;
      const info = findNodeWithParent(tree.value, selectedNodeId.value);
      if (!info) return;
      const node = info.node;
      if (node.type !== 'folder' || node.id === 'root') return;
      emit('delete-folder', { id: node.id, label: node.label });
    }

    function findNodeWithParent(
      nodes: TreeNode[],
      id: string,
      parent: TreeNode | null = null
    ): { node: TreeNode; parent: TreeNode | null } | null {
      for (const n of nodes) {
        if (n.id === id) return { node: n, parent };
        if (n.children?.length) {
          const res = findNodeWithParent(n.children, id, n);
          if (res) return res;
        }
      }
      return null;
    }

    function isDescendant(ancestor: TreeNode, maybeChild: TreeNode): boolean {
      if (!ancestor.children) return false;
      for (const c of ancestor.children) {
        if (c.id === maybeChild.id) return true;
        if (isDescendant(c, maybeChild)) return true;
      }
      return false;
    }

    // New folder dialog
    const showNewFolder = ref(false);
    const newFolderName = ref('');
    let newFolderParentId: string | null = null;

    function openNewFolderDialog(parentId: string | null = null) {
      newFolderParentId = parentId;
      newFolderName.value = '';
      showNewFolder.value = true;
    }

    function createFolder() {
      const name = newFolderName.value.trim();
      if (!name) return;
      showNewFolder.value = false;
      // emit payload for backend; parent inserts folder after server responds
      emit('create-folder', { name, parent_id: newFolderParentId });
    }

    // Expose helper to add an account under a folder (default root)
    function addAccountToFolder(
      account: { id: string; label: string },
      parentId: string | null = 'root'
    ) {
      let parentNode: TreeNode | null = null;
      if (parentId === 'root') {
        parentNode = getOrCreateUnassigned();
      } else {
        const parentInfo = parentId ? findNodeWithParent(tree.value, parentId) : null;
        parentNode = parentInfo?.node || null;
      }
      const node: TreeNode = { id: account.id, label: account.label, type: 'account' };
      if (parentNode && parentNode.type === 'folder') {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(node);
      } else {
        tree.value.push(node);
      }
    }

    // Helper to add a folder under a parent (used after backend creates it)
    function addFolderToParent(
      folder: { id: string; label: string },
      parentId: string | null = null
    ) {
      // parentId === 'root' or null => top-level folder (sibling of "Sin asignar")
      const isTopLevel = !parentId || parentId === UNASSIGNED_ID;
      const parentInfo = !isTopLevel && parentId ? findNodeWithParent(tree.value, parentId) : null;
      const parentNode = parentInfo?.node || null;
      const node: TreeNode = { id: folder.id, label: folder.label, type: 'folder', children: [] };
      if (!isTopLevel && parentNode && parentNode.type === 'folder') {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(node);
      } else {
        tree.value.push(node);
      }
    }

    // Helper to update a node label (account or folder)
    function updateNodeLabel(id: string, label: string) {
      const info = findNodeWithParent(tree.value, id);
      if (info) info.node.label = label;
    }

    function removeNode(id: string) {
      const info = findNodeWithParent(tree.value, id);
      if (!info) return;
      const { parent } = info;
      if (parent) {
        parent.children = (parent.children || []).filter((n) => n.id !== id);
      } else {
        const idx = tree.value.findIndex((n) => n.id === id);
        if (idx !== -1) tree.value.splice(idx, 1);
      }
    }
    // Replace entire tree with provided nodes (typed, no any)
    type NodeInput = { id: string | number; label: string; type: NodeType; children?: NodeInput[] };
    function setTree(nodes: NodeInput[]) {
      // Normalize incoming nodes
      const toTree = (items: NodeInput[]): TreeNode[] =>
        items.map((n) => ({
          id: String(n.id),
          label: String(n.label ?? ''),
          type: n.type,
          children: n.children ? toTree(n.children) : [],
        }));

      // If backend provides a node with id 'root', treat it as 'Sin asignar' children
      const children = toTree(nodes);

      // Split top-level items: folders vs orphan accounts
      const folders: TreeNode[] = [];
      const orphanAccounts: TreeNode[] = [];
      for (const n of children) {
        if (n.id === UNASSIGNED_ID && n.type === 'folder') {
          // Merge its children into orphanAccounts
          orphanAccounts.push(...(n.children || []).filter((c) => c.type === 'account'));
          // Also keep any nested folders from this node at top-level
          folders.push(...(n.children || []).filter((c) => c.type === 'folder'));
          continue;
        }
        if (n.type === 'folder') folders.push(n);
        else orphanAccounts.push(n);
      }

      // Sort folders by label
      folders.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));

      // Ensure 'Sin asignar' node exists and is first
      const unassigned: TreeNode = {
        id: UNASSIGNED_ID,
        label: 'Sin asignar',
        type: 'folder',
        children: orphanAccounts,
      };

      tree.value = [unassigned, ...folders];
    }

    function getOrCreateUnassigned(): TreeNode {
      // Find existing 'Sin asignar' at top-level; if missing, create it
      const existing = tree.value.find((n) => n.id === UNASSIGNED_ID && n.type === 'folder');
      if (existing) return existing;
      const un: TreeNode = {
        id: UNASSIGNED_ID,
        label: 'Sin asignar',
        type: 'folder',
        children: [],
      };
      tree.value.unshift(un);
      return un;
    }

    function makeDragImage(label: string) {
      const el = document.createElement('div');
      el.textContent = label;
      el.style.cssText = [
        'position: absolute',
        'top: -9999px',
        'left: -9999px',
        'padding: 4px 8px',
        'background: rgba(33, 150, 243, 0.9)',
        'color: white',
        'font-size: 12px',
        'border-radius: 4px',
        'box-shadow: 0 2px 6px rgba(0,0,0,0.3)',
      ].join(';');
      document.body.appendChild(el);
      // Note: we don't remove immediately because it is used as drag image; browser will clone it
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 0);
      return el;
    }

    // Expose methods to parent via template ref
    expose({ addAccountToFolder, addFolderToParent, updateNodeLabel, removeNode, setTree });

    return {
      UNASSIGNED_ID,
      tree,
      showNewFolder,
      newFolderName,
      openNewFolderDialog,
      createFolder,
      onDragStart,
      onDragOver,
      onDrop,
      onDragLeave,
      dragNodeId,
      dragNodeLabel,
      hoveredNodeId,
      selectedNodeId,
      dragOverFolderId,
      dragOverRoot,
      selectedIsFolder,
      emitView,
      emitEdit,
      onDblClick,
      onSelect,
      onRequestDeleteFolder,
      addAccountToFolder,
      addFolderToParent,
      updateNodeLabel,
      removeNode,
      onRootDragOver,
      onRootDragLeave,
      onRootDrop,
      // setTree is exposed for parent refs; no need to return to template
    };
  },
});
</script>
<style scoped>
.accounts-tree {
  max-width: 100%;
}
.tree-node {
  padding: 4px 2px;
}
.tree-node.is-hovered {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
}
.tree-node.is-dragging {
  outline: 1px dashed var(--q-primary);
}
.tree-node.is-selected {
  background: rgba(33, 150, 243, 0.12);
  border-radius: 6px;
}
.tree-node.is-drop-target {
  background: rgba(76, 175, 80, 0.12);
  border: 1px dashed rgba(76, 175, 80, 0.6);
  border-radius: 6px;
}
.drag-floating {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  color: #1976d2;
  font-size: 12px;
}
</style>
