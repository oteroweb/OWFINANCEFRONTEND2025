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
        <q-tree :nodes="treeData" node-key="id" default-expand-all no-transition>
          <template #default-header="{ node }">
            <div
              class="row items-center no-wrap q-gutter-x-sm tree-node"
              :class="{
                'is-hovered': hoveredNodeId === node.id,
                'is-dragging': dragNodeId === node.id,
                'is-selected': selectedNodeId === node.id,
                'is-drop-target': dragOverFolderId === node.id,
                'insert-before': dragOverInsertId === node.id && dragOverInsertPos === 'before',
                'insert-after': dragOverInsertId === node.id && dragOverInsertPos === 'after',
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
              <!-- Label + balance -->
              <div class="col row items-center no-wrap" style="min-width:0; gap:3px">
                <span class="ellipsis">{{ node.label }}</span>
                <template v-if="node.type === 'account' && node.balance !== undefined">
                  <span
                    class="text-caption no-wrap flex-shrink-0"
                    :class="node.balance < 0 ? 'text-negative' : 'text-teal-7'"
                  >({{ node.currencySymbol || '$' }}{{ formatBalance(node.balance) }})</span>
                </template>
                <template v-if="node.type === 'folder' && node.id !== UNASSIGNED_ID">
                  <span class="text-caption text-grey-5 no-wrap flex-shrink-0">
                    {{ folderAccountCount(node) }} cuenta{{ folderAccountCount(node) === 1 ? '' : 's' }}
                  </span>
                  <span v-if="folderTotalBalance(node)" class="text-caption no-wrap flex-shrink-0" :class="folderTotalBalanceNegative(node) ? 'text-negative' : 'text-teal-7'">
                    · {{ folderTotalBalance(node) }}
                  </span>
                </template>
              </div>
              <!-- Action buttons on hover -->
              <div
                v-if="hoveredNodeId === node.id && node.id !== UNASSIGNED_ID"
                class="row no-wrap q-gutter-xs node-actions"
                @click.stop
              >
                <template v-if="node.type === 'account'">
                  <q-btn
                    flat dense round size="xs"
                    :icon="node.includeInGlobalBalance !== false ? 'account_balance' : 'money_off'"
                    :color="node.includeInGlobalBalance !== false ? 'teal-6' : 'grey-5'"
                    @click.stop="$emit('toggle-global-balance', { id: node.id, newValue: node.includeInGlobalBalance === false })"
                  >
                    <q-tooltip>{{ node.includeInGlobalBalance !== false ? 'En balance global (click para excluir)' : 'Excluida del balance global (click para incluir)' }}</q-tooltip>
                  </q-btn>
                  <q-btn flat dense round size="xs" icon="edit" color="primary" @click.stop="emitEdit(node)">
                    <q-tooltip>Editar cuenta</q-tooltip>
                  </q-btn>
                  <q-btn flat dense round size="xs" icon="delete" color="negative" @click.stop="emitDelete(node)">
                    <q-tooltip>Eliminar cuenta</q-tooltip>
                  </q-btn>
                </template>
                <template v-if="node.type === 'folder'">
                  <q-btn flat dense round size="xs" icon="drive_file_rename_outline" color="primary" @click.stop="emitRenameFolder(node)">
                    <q-tooltip>Renombrar carpeta</q-tooltip>
                  </q-btn>
                </template>
              </div>
              <!-- Persistent global-balance indicator (non-hovered) -->
              <q-icon
                v-if="hoveredNodeId !== node.id && node.type === 'account' && node.includeInGlobalBalance === false"
                name="money_off"
                size="14px"
                color="grey-5"
                class="q-ml-xs"
              >
                <q-tooltip>Excluida del balance global</q-tooltip>
              </q-icon>
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
import { defineComponent, ref, watch } from 'vue';
import type { PropType } from 'vue';
import { Notify } from 'quasar';
import { useTransactionsStore } from 'stores/transactions';
import { useAuthStore } from 'stores/auth';

type NodeType = 'folder' | 'account';

type TreeNode = {
  id: string; // unique
  label: string;
  type: NodeType;
  balance?: number;
  currencyCode?: string;
  currencySymbol?: string;
  includeInGlobalBalance?: boolean;
  children?: TreeNode[];
};

export default defineComponent({
  name: 'AccountsTree',
  props: {
    // Si la API no soporta eliminar carpetas, ocultar el botón desde el padre
    canDeleteFolder: { type: Boolean, default: false },
    // Tree data from parent (optional)
    tree: { type: Array as PropType<unknown[]>, default: null },
  },
  emits: [
    'create-account',
    'create-folder',
    'move-node',
    'reorder-siblings',
    'view-account',
    'edit-account',
    'delete-account',
    'delete-folder',
    'rename-folder',
    'toggle-global-balance',
  ],
  setup(props, { emit, expose }) {
    const txStore = useTransactionsStore();
    const authStore = useAuthStore();
    // Top-level nodes; we keep a special folder id 'root' labeled 'Sin asignar'
    const UNASSIGNED_ID = 'root';
    const treeData = ref<TreeNode[]>([
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
    // Reorder insert indicator: which node id + position before/after
    const dragOverInsertId = ref<string | null>(null);
    const dragOverInsertPos = ref<'before' | 'after'>('after');

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
      const draggingId = dragNodeId.value;
      if (!draggingId || node.id === draggingId) return;
      ev.preventDefault();

      // Determine Y position relative to the element (0..1)
      const target = ev.currentTarget as HTMLElement | null;
      const rect = target?.getBoundingClientRect();
      const relY = rect ? (ev.clientY - rect.top) / rect.height : 0.5;

      // 'Sin asignar' only supports insert-after (bottom half) — it must stay first
      if (node.id === UNASSIGNED_ID) {
        dragOverFolderId.value = null;
        dragOverInsertId.value = node.id;
        dragOverInsertPos.value = 'after';
        return;
      }

      if (node.type === 'folder' && relY > 0.25 && relY < 0.75) {
        // Middle zone of a folder → move INTO folder
        dragOverFolderId.value = node.id;
        dragOverInsertId.value = null;
      } else {
        // Top or bottom zone → insert before / after
        dragOverFolderId.value = null;
        dragOverInsertId.value = node.id;
        dragOverInsertPos.value = relY <= 0.5 ? 'before' : 'after';
      }
    }

    function onDrop(target: TreeNode, ev: DragEvent) {
      const sourceId = ev.dataTransfer?.getData('text/plain') || dragNodeId.value;
      if (!sourceId || target.id === sourceId) { clearDragState(); return; }

      const sourceInfo = findNodeWithParent(treeData.value, sourceId);
      const targetInfo = findNodeWithParent(treeData.value, target.id);
      if (!sourceInfo || !targetInfo) { clearDragState(); return; }

      const { node: srcNode, parent: srcParent } = sourceInfo;
      const { node: tgtNode, parent: tgtParent } = targetInfo;

      // ── CASE A: drop INTO a folder (middle-zone hover) ──────────────────────
      if (dragOverFolderId.value === target.id && target.type === 'folder') {
        if (srcNode.type === 'folder' && isDescendant(srcNode, tgtNode)) {
          Notify.create({ type: 'warning', message: 'No puedes mover una carpeta dentro de sí misma' });
          clearDragState(); return;
        }
        if (tgtNode.id === UNASSIGNED_ID && srcNode.type === 'folder') {
          Notify.create({ type: 'warning', message: 'No puedes mover carpetas a "Sin asignar"' });
          clearDragState(); return;
        }
        // Remove from old parent
        removeSrcFromParent(srcNode, srcParent);
        // Append to target folder
        tgtNode.children = tgtNode.children || [];
        tgtNode.children.push(srcNode);
        const sortOrder = tgtNode.children.length - 1;
        const payloadParentId = tgtNode.id === UNASSIGNED_ID ? 'root' : tgtNode.id;
        emit('move-node', { node_id: srcNode.id, new_parent_id: payloadParentId, node_type: srcNode.type, sort_order: sortOrder });
        clearDragState(); return;
      }

      // ── CASE B: reorder (insert before/after target) ─────────────────────────
      if (!dragOverInsertId.value) { clearDragState(); return; }
      // Safety: never insert before UNASSIGNED_ID — redirect to after
      if (tgtNode.id === UNASSIGNED_ID && dragOverInsertPos.value === 'before') {
        dragOverInsertPos.value = 'after';
      }
      // Get the siblings list of the target
      const tgtSiblings: TreeNode[] = tgtParent ? (tgtParent.children || []) : treeData.value;
      const srcSiblings: TreeNode[] = srcParent ? (srcParent.children || []) : treeData.value;

      // Determine the parent id payload (for the backend)
      const newParentNode = tgtParent ?? null;
      const payloadParentId = !newParentNode
        ? 'root'
        : newParentNode.id === UNASSIGNED_ID
        ? 'root'
        : newParentNode.id;

      // Prevent accounts from being reordered to root (would escape a folder)
      // — only allow if there's a valid folder parent or they are already root-level
      if (srcNode.type === 'folder' && newParentNode?.id === UNASSIGNED_ID) {
        Notify.create({ type: 'warning', message: 'No puedes mover carpetas a "Sin asignar"' });
        clearDragState(); return;
      }

      // Remove source from its current siblings
      const srcIdx = srcSiblings.findIndex((n) => n.id === srcNode.id);
      if (srcIdx !== -1) srcSiblings.splice(srcIdx, 1);

      // Find target position in target siblings (after source removal)
      let tgtIdx = tgtSiblings.findIndex((n) => n.id === tgtNode.id);
      if (tgtIdx === -1) tgtIdx = tgtSiblings.length;

      const insertAt = dragOverInsertPos.value === 'before' ? tgtIdx : tgtIdx + 1;
      tgtSiblings.splice(insertAt, 0, srcNode);

      emit('move-node', {
        node_id: srcNode.id,
        new_parent_id: payloadParentId,
        node_type: srcNode.type,
        sort_order: insertAt,
      });

      // Emit full sibling order so parent can persist all positions (folders + accounts separately)
      const folderSiblings = tgtSiblings
        .filter((n) => n.type === 'folder')
        .map((n, idx) => ({ id: n.id, sort_order: idx, node_type: 'folder' }));
      const accountSiblings = tgtSiblings
        .filter((n) => n.type === 'account')
        .map((n, idx) => ({ id: n.id, sort_order: idx, node_type: 'account' }));
      emit('reorder-siblings', {
        parent_id: payloadParentId,
        siblings: [...folderSiblings, ...accountSiblings],
      });

      clearDragState();
    }

    function clearDragState() {
      dragNodeId.value = null;
      dragNodeLabel.value = null;
      dragOverFolderId.value = null;
      dragOverInsertId.value = null;
    }

    function removeSrcFromParent(srcNode: TreeNode, srcParent: TreeNode | null) {
      if (srcParent) {
        srcParent.children = (srcParent.children || []).filter((n) => n.id !== srcNode.id);
      } else {
        const idx = treeData.value.findIndex((n) => n.id === srcNode.id);
        if (idx !== -1) treeData.value.splice(idx, 1);
      }
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
      const sourceInfo = findNodeWithParent(treeData.value, String(sourceId));
      if (!sourceInfo) return;
      const { node: srcNode, parent: srcParent } = sourceInfo;
      // Do not allow moving the special 'Sin asignar' node
      if (srcNode.id === UNASSIGNED_ID) return;

      // Remove from old parent
      if (srcParent) {
        srcParent.children = (srcParent.children || []).filter((n) => n.id !== srcNode.id);
      } else {
        const idx = treeData.value.findIndex((n) => n.id === srcNode.id);
        if (idx !== -1) treeData.value.splice(idx, 1);
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
        treeData.value.push(srcNode);
        const sortOrder = treeData.value.length - 1;
        emit('move-node', {
          node_id: srcNode.id,
          new_parent_id: 'root', // parent_id null at backend
          node_type: 'folder',
          sort_order: sortOrder,
        });
      }

      clearDragState();
    }

    function onDragLeave(node: TreeNode) {
      if (dragOverFolderId.value === node.id) dragOverFolderId.value = null;
      if (dragOverInsertId.value === node.id) dragOverInsertId.value = null;
    }

    function emitView(node: TreeNode) {
      if (node.type === 'account') emit('view-account', { id: node.id, label: node.label });
    }

    function emitEdit(node: TreeNode) {
      if (node.type === 'account') emit('edit-account', { id: node.id, label: node.label });
    }

    function emitDelete(node: TreeNode) {
      if (node.type === 'account') emit('delete-account', { id: node.id, label: node.label });
    }

    function emitRenameFolder(node: TreeNode) {
      if (node.type === 'folder') emit('rename-folder', { id: node.id, label: node.label });
    }

    function onDblClick(node: TreeNode) {
      if (node.type === 'account') {
        emit('view-account', { id: node.id, label: node.label });
      }
    }

    function onSelect(node: TreeNode) {
      selectedNodeId.value = node.id;
      selectedIsFolder.value = node.type === 'folder' && node.id !== UNASSIGNED_ID;
      if (node.type === 'account') {
        txStore.setSelectedAccountIds([node.id]);
        emit('view-account', { id: node.id, label: node.label });
        try {
          window.dispatchEvent(
            new CustomEvent('ow:accounts:selected', { detail: { ids: [node.id] } })
          );
        } catch {
          /* ignore */
        }
      } else if (node.type === 'folder' && node.id !== UNASSIGNED_ID) {
        // Seleccionar todas las cuentas de la carpeta
        const ids: string[] = [];
        const walkIds = (n: TreeNode) => {
          if (n.type === 'account') ids.push(String(n.id));
          for (const c of n.children || []) walkIds(c);
        };
        walkIds(node);
        if (ids.length) {
          txStore.setSelectedAccountIds(ids);
          try {
            window.dispatchEvent(
              new CustomEvent('ow:accounts:selected', { detail: { ids } })
            );
          } catch {
            /* ignore */
          }
        }
      }
    }

    function onRequestDeleteFolder() {
      // Only allow when the selected node is a non-root folder
      if (!selectedIsFolder.value || !selectedNodeId.value) return;
      const info = findNodeWithParent(treeData.value, selectedNodeId.value);
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
        const parentInfo = parentId ? findNodeWithParent(treeData.value, parentId) : null;
        parentNode = parentInfo?.node || null;
      }
      const node: TreeNode = { id: account.id, label: account.label, type: 'account' };
      if (parentNode && parentNode.type === 'folder') {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(node);
      } else {
        treeData.value.push(node);
      }
    }

    // Helper to add a folder under a parent (used after backend creates it)
    function addFolderToParent(
      folder: { id: string; label: string },
      parentId: string | null = null
    ) {
      // parentId === 'root' or null => top-level folder (sibling of "Sin asignar")
      const isTopLevel = !parentId || parentId === UNASSIGNED_ID;
      const parentInfo = !isTopLevel && parentId ? findNodeWithParent(treeData.value, parentId) : null;
      const parentNode = parentInfo?.node || null;
      const node: TreeNode = { id: folder.id, label: folder.label, type: 'folder', children: [] };
      if (!isTopLevel && parentNode && parentNode.type === 'folder') {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(node);
      } else {
        treeData.value.push(node);
      }
    }

    // Helper to update a node label (account or folder)
    function updateNodeLabel(id: string, label: string) {
      const info = findNodeWithParent(treeData.value, id);
      if (info) info.node.label = label;
    }

    function updateNodeGlobalBalance(id: string, value: boolean) {
      const info = findNodeWithParent(treeData.value, id);
      if (info) info.node.includeInGlobalBalance = value;
    }

    function removeNode(id: string) {
      const info = findNodeWithParent(treeData.value, id);
      if (!info) return;
      const { parent } = info;
      if (parent) {
        parent.children = (parent.children || []).filter((n) => n.id !== id);
      } else {
        const idx = treeData.value.findIndex((n) => n.id === id);
        if (idx !== -1) treeData.value.splice(idx, 1);
      }
    }
    // Replace entire tree with provided nodes (typed, no any)
    type NodeInput = { id: string | number; label: string; type: NodeType; balance?: number | string | null; currency_symbol?: string; currency_code?: string; include_in_global_balance?: boolean; children?: NodeInput[] };
    function setTree(nodes: NodeInput[]) {
      // Normalize incoming nodes
      const toTree = (items: NodeInput[]): TreeNode[] =>
        items.map((n) => {
          const balance = n.balance !== undefined && n.balance !== null ? Number(n.balance) : undefined;
          const currencySymbol = n.currency_symbol ?? undefined;
          const currencyCode = n.currency_code ?? undefined;
          return {
            id: String(n.id),
            label: String(n.label ?? ''),
            type: n.type,
            ...(balance !== undefined ? { balance } : {}),
            ...(currencySymbol !== undefined ? { currencySymbol } : {}),
            ...(currencyCode !== undefined ? { currencyCode } : {}),
            includeInGlobalBalance: n.include_in_global_balance !== false,
            children: n.children ? toTree(n.children) : [],
          };
        });

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

      // Keep folders in the order returned by the backend (sort_order)
      // Do NOT sort alphabetically — the backend now returns them in user-defined order

      // Ensure 'Sin asignar' node exists and is first
      const unassigned: TreeNode = {
        id: UNASSIGNED_ID,
        label: 'Sin asignar',
        type: 'folder',
        children: orphanAccounts,
      };

      treeData.value = [unassigned, ...folders];
    }

    function getOrCreateUnassigned(): TreeNode {
      // Find existing 'Sin asignar' at top-level; if missing, create it
      const existing = treeData.value.find((n) => n.id === UNASSIGNED_ID && n.type === 'folder');
      if (existing) return existing;
      const un: TreeNode = {
        id: UNASSIGNED_ID,
        label: 'Sin asignar',
        type: 'folder',
        children: [],
      };
      treeData.value.unshift(un);
      return un;
    }

    function formatBalance(n: number): string {
      const abs = Math.abs(n);
      const sign = n < 0 ? '-' : '';
      if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M';
      if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + 'k';
      return sign + abs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    function folderAccountCount(node: TreeNode): number {
      let count = 0;
      for (const c of node.children || []) {
        if (c.type === 'account') count++;
        else count += folderAccountCount(c);
      }
      return count;
    }

    function folderTotalBalance(node: TreeNode): string {
      // Group balances by currency code
      const perCurrency = new Map<string, { total: number; sym: string }>();
      const walk = (n: TreeNode) => {
        if (n.type === 'account' && n.balance !== undefined) {
          const code = n.currencyCode || '';
          const sym = n.currencySymbol || '';
          const existing = perCurrency.get(code);
          if (existing) existing.total += n.balance;
          else perCurrency.set(code, { total: n.balance, sym });
        }
        for (const c of n.children || []) walk(c);
      };
      walk(node);
      if (!perCurrency.size) return '';

      const fmtNum = (val: number, decimals = 0): string => {
        const abs = Math.abs(val);
        const sign = val < 0 ? '-' : '';
        if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M';
        if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + 'k';
        return sign + abs.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals > 0 ? decimals : 2 });
      };

      // Try converting each currency to USD
      let usdTotal = 0;
      let hasUnconvertible = false;
      const unconvertibleParts: string[] = [];
      const convertibleParts: string[] = [];

      for (const [code, { total, sym }] of perCurrency.entries()) {
        const partLabel = sym + fmtNum(total);
        if (!code || code.toUpperCase() === 'USD') {
          usdTotal += total;
          convertibleParts.push(sym + fmtNum(total, 2));
        } else {
          const rate = authStore.getCurrentRateForCurrency(code);
          if (rate && rate > 0) {
            usdTotal += total / rate;
            convertibleParts.push(partLabel);
          } else {
            hasUnconvertible = true;
            unconvertibleParts.push(partLabel);
          }
        }
      }

      const fmtUsd = (val: number): string => {
        const abs = Math.abs(val);
        const sign = val < 0 ? '-' : '';
        if (abs >= 1_000_000) return sign + '$' + (abs / 1_000_000).toFixed(1) + 'M';
        if (abs >= 1_000) return sign + '$' + (abs / 1_000).toFixed(1) + 'k';
        return sign + '$' + abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      const parts: string[] = [];

      // Show USD total for all convertible currencies
      if (convertibleParts.length > 0) {
        const isSingleUsd = perCurrency.size === 1 && !hasUnconvertible && [...perCurrency.keys()][0]?.toUpperCase() === 'USD';
        if (isSingleUsd) {
          parts.push(fmtUsd(usdTotal));
        } else {
          // Show USD total with per-currency breakdown in parens
          parts.push(fmtUsd(usdTotal) + ' (' + convertibleParts.join(' + ') + ')');
        }
      }

      // Append unconvertible currencies separately
      parts.push(...unconvertibleParts);

      return parts.join(' + ');
    }

    function folderTotalBalanceNegative(node: TreeNode): boolean {
      // Sum all balances converted to USD where possible; otherwise raw
      let total = 0;
      const walk = (n: TreeNode) => {
        if (n.type === 'account' && n.balance !== undefined) {
          const code = n.currencyCode || '';
          if (!code || code.toUpperCase() === 'USD') {
            total += n.balance;
          } else {
            const rate = authStore.getCurrentRateForCurrency(code);
            total += rate && rate > 0 ? n.balance / rate : n.balance;
          }
        }
        for (const c of n.children || []) walk(c);
      };
      walk(node);
      return total < 0;
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

    // Watch for tree prop changes from parent
    watch(
      () => props.tree,
      (val) => {
        console.log('🏦 AccountsTree recibió tree:', val);
        if (Array.isArray(val)) {
          setTree(val as unknown as NodeInput[]);
        }
      },
      { immediate: true, deep: true }
    );

    // Expose methods to parent via template ref
    expose({ addAccountToFolder, addFolderToParent, updateNodeLabel, updateNodeGlobalBalance, removeNode, setTree });

    return {
      UNASSIGNED_ID,
      treeData,
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
      dragOverInsertId,
      dragOverInsertPos,
      selectedIsFolder,
      emitView,
      emitEdit,
      emitDelete,
      emitRenameFolder,
      onDblClick,
      onSelect,
      onRequestDeleteFolder,
      addAccountToFolder,
      addFolderToParent,
      updateNodeLabel,
      updateNodeGlobalBalance,
      removeNode,
      onRootDragOver,
      onRootDragLeave,
      onRootDrop,
      formatBalance,
      folderAccountCount,
      folderTotalBalance,
      folderTotalBalanceNegative,
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
.node-actions {
  opacity: 0.7;
  transition: opacity 0.15s;
}
.node-actions:hover {
  opacity: 1;
}
.tree-node.insert-before {
  border-top: 2px solid var(--q-primary);
  margin-top: -1px;
}
.tree-node.insert-after {
  border-bottom: 2px solid var(--q-primary);
  margin-bottom: -1px;
}
</style>
