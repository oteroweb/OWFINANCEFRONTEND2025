<template>
  <div class="categories-tree" :class="{ multicol: columnsCount > 1 }" :style="rootStyle">
    <div class="row items-center q-pa-sm q-gutter-sm" v-if="!isReadonly">
      <div class="col">
        <q-btn
          color="primary"
          dense
          icon="add"
          label="Nueva categoría"
          @click="onRequestCreateCategory"
        />
        <q-btn
          color="secondary"
          dense
          icon="create_new_folder"
          label="Nueva carpeta"
          class="q-ml-sm"
          @click="onRequestCreateFolder"
        />
      </div>
      <div class="col-auto" v-if="selectedIsCategory">
        <q-btn
          color="negative"
          dense
          icon="delete"
          label="Eliminar categoría"
          @click="onRequestDeleteCategory"
        />
      </div>
      <div class="col-auto" v-if="selectedNodeId && selectedNodeId !== 'root'">
        <q-btn
          color="secondary"
          outline
          dense
          icon="north"
          label="Mover a raíz"
          @click="onMoveSelectedToRoot"
        />
      </div>
    </div>

    <q-card flat bordered>
      <q-scroll-area class="tree-scroll">
        <div v-if="dragNodeId && dragNodeLabel" class="drag-floating">
          Moviendo: <strong>{{ dragNodeLabel }}</strong>
        </div>
        <div v-if="(nodesToRender?.length || 0) === 0" class="q-pa-sm text-grey-6">
          No hay categorías para mostrar
        </div>
        <!-- Nodo especial de drop a raíz -->
        <div
          v-if="!isReadonly && dragNodeId"
          class="row items-center no-wrap q-gutter-x-sm tree-node q-ml-sm q-mb-xs"
          :class="{ 'is-drop-target': dragOverRoot }"
          @dragover.prevent="onRootDragOver"
          @drop.prevent="onRootDrop"
          @dragleave="onRootDragLeave"
        >
          <q-icon name="arrow_upward" size="18px" />
          <div class="ellipsis col text-primary">Mover a raíz</div>
        </div>
        <!-- Single column -->
        <q-tree
          v-if="columnsCount === 1"
          :nodes="nodesToRender"
          node-key="id"
          v-model:expanded="expandedKeys"
          no-transition
        >
          <template #default-header="{ node }">
            <div
              class="row items-center no-wrap q-gutter-x-sm tree-node"
              :class="{
                'is-hovered': hoveredNodeId === node.id,
                'is-dragging': dragNodeId === node.id,
                'is-selected': selectedNodeId === node.id,
                'is-drop-target': dragOverNodeId === node.id,
              }"
              :draggable="node.id !== 'root'"
              @mouseenter="hoveredNodeId = node.id"
              @mouseleave="hoveredNodeId = null"
              @click="onSelect(node)"
              @dblclick="onDblClick(node)"
              @dragstart="(ev) => onDragStart(node, ev)"
              @dragover.prevent="(ev) => onDragOver(node, ev)"
              @drop.prevent="(ev) => onDrop(node, ev)"
              @dragleave="onDragLeave(node)"
            >
              <q-icon :name="node.type === 'folder' ? 'folder' : node.icon || 'sell'" size="18px" />
              <div class="ellipsis col">{{ node.label }}</div>
            </div>
          </template>
        </q-tree>

        <!-- Multi columns: split top-level nodes across N trees -->
        <div v-else class="tree-columns">
          <q-tree
            v-for="(col, i) in columnsNodes"
            :key="'col-' + i"
            :nodes="col"
            node-key="id"
            v-model:expanded="expandedKeys"
            no-transition
          >
            <template #default-header="{ node }">
              <div
                class="row items-center no-wrap q-gutter-x-sm tree-node"
                :class="{
                  'is-hovered': hoveredNodeId === node.id,
                  'is-dragging': dragNodeId === node.id,
                  'is-selected': selectedNodeId === node.id,
                  'is-drop-target': dragOverNodeId === node.id,
                }"
                :draggable="node.id !== 'root'"
                @mouseenter="hoveredNodeId = node.id"
                @mouseleave="hoveredNodeId = null"
                @click="onSelect(node)"
                @dblclick="onDblClick(node)"
                @dragstart="(ev) => onDragStart(node, ev)"
                @dragover.prevent="(ev) => onDragOver(node, ev)"
                @drop.prevent="(ev) => onDrop(node, ev)"
                @dragleave="onDragLeave(node)"
              >
                <q-icon
                  :name="node.type === 'folder' ? 'folder' : node.icon || 'sell'"
                  size="18px"
                />
                <div class="ellipsis col">{{ node.label }}</div>
              </div>
            </template>
          </q-tree>
        </div>
      </q-scroll-area>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import { Notify } from 'quasar';
import type { QTreeNode } from 'quasar';

type TreeNode = {
  id: string;
  label: string;
  type: 'folder' | 'category';
  icon?: string;
  order?: number;
  children?: TreeNode[];
};

export default defineComponent({
  name: 'CategoriesTree',
  props: {
    readonly: { type: Boolean, default: false },
    columns: { type: Number, default: 1 },
    // Optional: nodes provided directly from parent
    nodes: { type: Array as PropType<unknown[]>, default: null },
  },
  emits: ['create-category', 'create-folder', 'move-node', 'delete-category', 'edit-category'],
  setup(props, { emit, expose }) {
    const tree = ref<TreeNode[]>([
      { id: 'root', label: 'Categorías', type: 'folder', children: [] },
    ]);

    const dragNodeId = ref<string | null>(null);
    const dragNodeLabel = ref<string | null>(null);
    const hoveredNodeId = ref<string | null>(null);
    const selectedNodeId = ref<string | null>(null);
    const dragOverNodeId = ref<string | null>(null);
    const dragOverRoot = ref<boolean>(false);
    const expandedKeys = ref<string[]>([]);
    // UI state
    const selectedIsCategory = ref<boolean>(false);

    function onRequestCreateCategory() {
      if (props.readonly) return;
      // Parent will open dialog; pass current selected as parent
      emit('create-category', { parent_id: selectedNodeId.value || 'root' });
    }

    function onRequestCreateFolder() {
      if (props.readonly) return;
      // Crear bajo el nodo seleccionado (carpeta o categoría) o en root si nada seleccionado
      const parentId = selectedNodeId.value || 'root';
      emit('create-folder', { parent_id: parentId });
    }

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
        // ignore
      }
      const img = makeDragImage(node.label);
      ev.dataTransfer?.setDragImage(img, 8, 8);
    }

    function onDragOver(node: TreeNode, ev: DragEvent) {
      if (props.readonly) return;
      const draggingId = dragNodeId.value;
      if (!draggingId) return;
      // Permitir soltar sobre carpetas, root o categorías (si se suelta en categoría, se convierte en carpeta)
      if (
        node.id !== draggingId &&
        (node.type === 'folder' || node.type === 'category' || node.id === 'root')
      ) {
        ev.preventDefault();
        dragOverNodeId.value = node.id;
      }
    }

    function onDrop(target: TreeNode, ev: DragEvent) {
      if (props.readonly) return;
      const sourceId = ev.dataTransfer?.getData('text/plain') || dragNodeId.value;
      if (!sourceId) return;
      if (target.id === sourceId) return;

      const sourceInfo = findNodeWithParent(tree.value, sourceId);
      const targetInfo = findNodeWithParent(tree.value, target.id);
      if (!sourceInfo || !targetInfo) return;

      const { node: srcNode, parent: srcParent } = sourceInfo;
      const { node: tgtNode } = targetInfo;

      // prevent dropping a node into its own descendant
      if (isDescendant(srcNode, tgtNode)) {
        Notify.create({ type: 'warning', message: 'No puedes mover dentro de sí misma' });
        return;
      }

      // remove from old parent
      if (srcParent) {
        srcParent.children = (srcParent.children || []).filter((n) => n.id !== srcNode.id);
        if ((srcParent.children?.length || 0) === 0 && srcParent.id !== 'root') {
          srcParent.type = 'category';
        }
      } else {
        const idx = tree.value.findIndex((n) => n.id === srcNode.id);
        if (idx !== -1) tree.value.splice(idx, 1);
      }

      // permitir categoría como destino: si es categoría, la convertimos a 'folder' para UI
      if (!(tgtNode.type === 'folder' || tgtNode.id === 'root' || tgtNode.type === 'category')) {
        Notify.create({ type: 'warning', message: 'Destino no válido' });
        return;
      }
      if (tgtNode.type === 'category') {
        tgtNode.type = 'folder';
      }
      tgtNode.children = tgtNode.children || [];
      tgtNode.children.push(srcNode);

      emit('move-node', { node_id: srcNode.id, new_parent_id: tgtNode.id });

      dragNodeId.value = null;
      dragNodeLabel.value = null;
      dragOverNodeId.value = null;
    }

    function onDragLeave(node: TreeNode) {
      if (dragOverNodeId.value === node.id) dragOverNodeId.value = null;
    }

    function onRootDragOver() {
      if (props.readonly) return;
      if (dragNodeId.value) dragOverRoot.value = true;
    }
    function onRootDragLeave() {
      dragOverRoot.value = false;
    }
    function onRootDrop(ev: DragEvent) {
      if (props.readonly) return;
      const sourceId = ev.dataTransfer?.getData('text/plain') || dragNodeId.value;
      dragOverRoot.value = false;
      if (!sourceId) return;
      const sourceInfo = findNodeWithParent(tree.value, sourceId);
      const rootInfo = findNodeWithParent(tree.value, 'root');
      if (!sourceInfo || !rootInfo) return;
      const { node: srcNode, parent: srcParent } = sourceInfo;
      const rootNode = rootInfo.node;
      if (srcParent && srcParent.id === 'root') return;
      if (srcParent) {
        srcParent.children = (srcParent.children || []).filter((n) => n.id !== srcNode.id);
        if ((srcParent.children?.length || 0) === 0 && srcParent.id !== 'root') {
          srcParent.type = 'category';
        }
      }
      rootNode.children = rootNode.children || [];
      rootNode.children.push(srcNode);
      emit('move-node', { node_id: srcNode.id, new_parent_id: 'root' });
      dragNodeId.value = null;
      dragNodeLabel.value = null;
      dragOverNodeId.value = null;
    }

    function onMoveSelectedToRoot() {
      if (props.readonly) return;
      if (!selectedNodeId.value) return;
      const sourceInfo = findNodeWithParent(tree.value, selectedNodeId.value);
      const rootInfo = findNodeWithParent(tree.value, 'root');
      if (!sourceInfo || !rootInfo) return;
      const { node: srcNode, parent: srcParent } = sourceInfo;
      const rootNode = rootInfo.node;
      if (srcParent && srcParent.id === 'root') return;
      if (srcParent) {
        srcParent.children = (srcParent.children || []).filter((n) => n.id !== srcNode.id);
        if ((srcParent.children?.length || 0) === 0 && srcParent.id !== 'root') {
          srcParent.type = 'category';
        }
      }
      rootNode.children = rootNode.children || [];
      rootNode.children.push(srcNode);
      emit('move-node', { node_id: srcNode.id, new_parent_id: 'root' });
    }

    // Map internal nodes to QTreeNode typing for template consumption
    const nodesToRender = computed<QTreeNode<unknown>[]>(() => {
      const rootNode = tree.value[0];
      const kids = rootNode?.children || [];
      // Cast is safe for QTree as it ignores extra fields.
      return kids as unknown as QTreeNode<unknown>[];
    });

    const columnsCount = computed(() => Math.max(1, Number(props.columns || 1)));
    const rootStyle = computed<Record<string, string> | undefined>(() =>
      columnsCount.value > 1 ? { '--cols': String(columnsCount.value) } : undefined
    );
    const columnsNodes = computed<QTreeNode<unknown>[][]>(() => {
      const cols = columnsCount.value;
      if (cols <= 1) return [nodesToRender.value];
      const chunks: QTreeNode<unknown>[][] = Array.from({ length: cols }, () => []);
      const nodes = nodesToRender.value;
      nodes.forEach((n, i) => {
        const idx = i % cols;
        chunks[idx]!.push(n);
      });
      return chunks;
    });

    function onSelect(node: TreeNode) {
      selectedNodeId.value = node.id;
      selectedIsCategory.value = node.id !== 'root' && node.type === 'category';
    }

    function onRequestDeleteCategory() {
      if (props.readonly) return;
      if (!selectedIsCategory.value || !selectedNodeId.value) return;
      const info = findNodeWithParent(tree.value, selectedNodeId.value);
      if (!info) return;
      const node = info.node;
      if (node.id === 'root') return;
      emit('delete-category', { id: node.id, label: node.label });
    }

    function onDblClick(node: TreeNode) {
      if (props.readonly) return;
      if (node.id === 'root') return;
      emit('edit-category', { id: node.id, label: node.label });
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

    function addCategoryToParent(
      category: {
        id: string;
        label: string;
        type?: 'folder' | 'category';
        icon?: string | null;
        order?: number;
      },
      parentId: string | null = 'root',
      atIndex?: number
    ) {
      const parentInfo = parentId ? findNodeWithParent(tree.value, parentId) : null;
      const parentNode = parentInfo?.node || null;
      const node: TreeNode = {
        id: category.id,
        label: category.label,
        type: category.type || 'category',
        ...(category.icon ? { icon: category.icon } : {}),
        ...(typeof category.order === 'number' ? { order: category.order } : {}),
      };
      const computeInsertIndex = (arr: TreeNode[], fallbackIndex?: number) => {
        if (typeof node.order === 'number') {
          const targetOrder: number = node.order;
          const pos = arr.findIndex((n) => typeof n.order === 'number' && n.order > targetOrder);
          return pos >= 0 ? pos : arr.length;
        }
        if (
          typeof fallbackIndex === 'number' &&
          fallbackIndex >= 0 &&
          fallbackIndex <= arr.length
        ) {
          return fallbackIndex;
        }
        return arr.length;
      };
      if (parentNode) {
        parentNode.children = parentNode.children || [];
        // asegurar que el padre sea tratado como carpeta si recibe hijos
        if (parentNode.type !== 'folder') parentNode.type = 'folder';
        const arr = parentNode.children;
        const idx = computeInsertIndex(arr, atIndex);
        arr.splice(idx, 0, node);
      } else {
        const rootKids = tree.value;
        const idx = computeInsertIndex(rootKids, atIndex);
        rootKids.splice(idx, 0, node);
      }
    }

    function updateNodeLabel(id: string, label: string) {
      const info = findNodeWithParent(tree.value, id);
      if (info) info.node.label = label;
    }

    function updateNodeMeta(
      id: string,
      patch: { label?: string; icon?: string | null; type?: 'folder' | 'category' }
    ) {
      const info = findNodeWithParent(tree.value, id);
      if (!info) return;
      const node = info.node;
      if (typeof patch.label === 'string') node.label = patch.label;
      if (patch.icon !== undefined) {
        if (patch.icon === null) {
          // remove icon if present
          if ('icon' in node) delete (node as Record<string, unknown>).icon;
        } else {
          node.icon = patch.icon;
        }
      }
      if (patch.type) node.type = patch.type;
    }

    function removeNode(id: string) {
      const info = findNodeWithParent(tree.value, id);
      if (!info) return;
      const { parent } = info;
      if (parent) {
        parent.children = (parent.children || []).filter((n) => n.id !== id);
        if ((parent.children?.length || 0) === 0 && parent.id !== 'root') {
          parent.type = 'category';
        }
      } else {
        const idx = tree.value.findIndex((n) => n.id === id);
        if (idx !== -1) tree.value.splice(idx, 1);
      }
    }

    // Replace the tree's root children with provided nodes (typed, no any)
    type NodeInput = {
      id: string | number;
      label: string;
      type?: 'folder' | 'category';
      icon?: string | null;
      order?: number;
      children?: NodeInput[];
    };
    function setTree(children: NodeInput[]) {
      // Preserve incoming order as provided by parent/server
      const toTree = (nodes: NodeInput[]): TreeNode[] =>
        nodes.map((n) => {
          const kids = n.children ? toTree(n.children) : [];
          const type: 'folder' | 'category' = n.type
            ? n.type
            : kids.length > 0
            ? 'folder'
            : 'category';
          const base: TreeNode = {
            id: String(n.id),
            label: String(n.label ?? ''),
            type,
            children: kids,
          };
          if (typeof n.order === 'number') base.order = n.order;
          if (n.icon) base.icon = n.icon;
          return base;
        });
      const mapped = toTree(children);
      // Ensure every sibling has a stable order value based on its original index
      const stampOrder = (nodes: TreeNode[]) => {
        nodes.forEach((n, idx) => {
          if (typeof n.order !== 'number') n.order = idx;
          if (n.children?.length) stampOrder(n.children);
        });
      };
      stampOrder(mapped);
      // Fallback: ensure there is at least an empty root if no nodes
      const safeChildren = Array.isArray(mapped) ? mapped : [];
      // Always rebuild the root to avoid id collisions with server-provided nodes
      tree.value = [{ id: 'root', label: 'Categorías', type: 'folder', children: safeChildren }];
      // expand all folders by default
      expandedKeys.value = computeExpandedFrom(mapped);
    }

    function computeExpandedFrom(nodes: TreeNode[]): string[] {
      const keys: string[] = [];
      const walk = (arr: TreeNode[]) => {
        for (const n of arr) {
          if (n.children && n.children.length) {
            keys.push(n.id);
            walk(n.children);
          }
        }
      };
      walk(nodes);
      return keys;
    }

    // Flexible setter: acepta un array de hijos o un nodo raíz con children
    function setTreeFlexible(
      payload: NodeInput[] | { id: string | number; label?: string; children?: NodeInput[] }
    ) {
      const arr = Array.isArray(payload)
        ? payload
        : (payload as { id: string | number; children?: NodeInput[] }).children || [];
      setTree(arr);
    }

    // If nodes prop is provided, populate tree from it
    watch(
      () => props.nodes,
      (val) => {
        if (Array.isArray(val)) {
          // Treat array items as NodeInput
          setTree(val as unknown as NodeInput[]);
        }
      },
      { immediate: true, deep: true }
    );

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
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 0);
      return el;
    }

    const isReadonly = computed(() => props.readonly);

    expose({
      addCategoryToParent,
      updateNodeLabel,
      updateNodeMeta,
      removeNode,
      setTree,
      setTreeFlexible,
    });

    return {
      isReadonly,
      rootStyle,
      columnsCount,
      columnsNodes,
      tree,
      dragNodeId,
      dragNodeLabel,
      hoveredNodeId,
      selectedNodeId,
      dragOverNodeId,
      expandedKeys,

      selectedIsCategory,
      onRequestCreateCategory,
      onRequestCreateFolder,
      onDragStart,
      onDragOver,
      onDrop,
      onDragLeave,
      onRootDragOver,
      onRootDragLeave,
      onRootDrop,
      onSelect,
      onDblClick,
      onMoveSelectedToRoot,

      onRequestDeleteCategory,
      addCategoryToParent,
      updateNodeLabel,
      updateNodeMeta,
      removeNode,
      dragOverRoot,
      nodesToRender,
      // setTree is exposed for parent refs; no need to return to template
    };
  },
});
</script>

<style scoped>
.categories-tree {
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column; /* stack toolbar above the tree card */
}
.categories-tree > .q-card {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 360px; /* ensure usable height when parent doesn't set one */
}
.tree-scroll {
  height: 100%;
  flex: 1 1 auto;
}
@media (max-width: 1023px) {
  .categories-tree {
    height: auto;
  }
  .categories-tree > .q-card {
    min-height: 260px; /* keep a reasonable height on mobile too */
  }
  .tree-scroll {
    height: 50vh; /* ensure content is visible on mobile */
  }
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

.tree-columns {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), 1fr);
  gap: 8px 12px;
}
</style>
