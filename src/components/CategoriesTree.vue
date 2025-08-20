<template>
  <div class="categories-tree">
    <div class="row items-center q-pa-sm q-gutter-sm">
      <div class="col">
        <q-btn
          color="primary"
          dense
          icon="add"
          label="Nueva categoría"
          @click="onRequestCreateCategory"
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
    </div>

    <q-card flat bordered>
      <q-scroll-area style="height: 420px">
        <div v-if="dragNodeId && dragNodeLabel" class="drag-floating">
          Moviendo: <strong>{{ dragNodeLabel }}</strong>
        </div>
        <q-tree :nodes="tree" node-key="id" default-expand-all no-transition>
          <template #default-header="{ node }">
            <div
              class="row items-center no-wrap q-gutter-x-sm tree-node"
              :class="{
                'is-hovered': hoveredNodeId === node.id,
                'is-dragging': dragNodeId === node.id,
                'is-selected': selectedNodeId === node.id,
                'is-drop-target': dragOverNodeId === node.id,
              }"
              :draggable="true"
              @mouseenter="hoveredNodeId = node.id"
              @mouseleave="hoveredNodeId = null"
              @click="onSelect(node)"
              @dblclick="onDblClick(node)"
              @dragstart="(ev) => onDragStart(node, ev)"
              @dragover.prevent="(ev) => onDragOver(node, ev)"
              @drop.prevent="(ev) => onDrop(node, ev)"
              @dragleave="onDragLeave(node)"
            >
              <q-icon name="folder" size="18px" />
              <div class="ellipsis col">{{ node.label }}</div>
            </div>
          </template>
        </q-tree>
      </q-scroll-area>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Notify } from 'quasar';

type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

export default defineComponent({
  name: 'CategoriesTree',
  emits: ['create-category', 'move-node', 'delete-category', 'edit-category'],
  setup(_, { emit, expose }) {
    const tree = ref<TreeNode[]>([{ id: 'root', label: 'Categorías', children: [] }]);

    const dragNodeId = ref<string | null>(null);
    const dragNodeLabel = ref<string | null>(null);
    const hoveredNodeId = ref<string | null>(null);
    const selectedNodeId = ref<string | null>(null);
    const dragOverNodeId = ref<string | null>(null);
    const selectedIsCategory = ref<boolean>(false);

    function onRequestCreateCategory() {
      // Parent will open dialog; pass current selected as parent
      emit('create-category', { parent_id: selectedNodeId.value || 'root' });
    }

    function onDragStart(node: TreeNode, ev: DragEvent) {
      dragNodeId.value = node.id;
      dragNodeLabel.value = node.label;
      ev.dataTransfer?.setData('text/plain', node.id);
      const img = makeDragImage(node.label);
      ev.dataTransfer?.setDragImage(img, 8, 8);
    }

    function onDragOver(node: TreeNode, ev: DragEvent) {
      const draggingId = dragNodeId.value;
      if (!draggingId) return;
      if (node.id !== draggingId) {
        ev.preventDefault();
        dragOverNodeId.value = node.id;
      }
    }

    function onDrop(target: TreeNode, ev: DragEvent) {
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
      } else {
        const idx = tree.value.findIndex((n) => n.id === srcNode.id);
        if (idx !== -1) tree.value.splice(idx, 1);
      }

      // add to target as child
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

    function onSelect(node: TreeNode) {
      selectedNodeId.value = node.id;
      selectedIsCategory.value = node.id !== 'root';
    }

    function onRequestDeleteCategory() {
      if (!selectedIsCategory.value || !selectedNodeId.value) return;
      const info = findNodeWithParent(tree.value, selectedNodeId.value);
      if (!info) return;
      const node = info.node;
      if (node.id === 'root') return;
      emit('delete-category', { id: node.id, label: node.label });
    }

    function onDblClick(node: TreeNode) {
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
      category: { id: string; label: string },
      parentId: string | null = 'root'
    ) {
      const parentInfo = parentId ? findNodeWithParent(tree.value, parentId) : null;
      const parentNode = parentInfo?.node || null;
      const node: TreeNode = { id: category.id, label: category.label };
      if (parentNode) {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(node);
      } else {
        tree.value.push(node);
      }
    }

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

    // Replace the tree's root children with provided nodes (typed, no any)
    type NodeInput = { id: string | number; label: string; children?: NodeInput[] };
    function setTree(children: NodeInput[]) {
      const toTree = (nodes: NodeInput[]): TreeNode[] =>
        nodes.map((n) => ({
          id: String(n.id),
          label: String(n.label ?? ''),
          children: n.children ? toTree(n.children) : [],
        }));
      const root = findNodeWithParent(tree.value, 'root');
      const mapped = toTree(children);
      if (root) {
        root.node.children = mapped;
      } else {
        tree.value = [{ id: 'root', label: 'Categorías', children: mapped }];
      }
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
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 0);
      return el;
    }

    expose({ addCategoryToParent, updateNodeLabel, removeNode, setTree });

    return {
      tree,
      dragNodeId,
      dragNodeLabel,
      hoveredNodeId,
      selectedNodeId,
      dragOverNodeId,
      selectedIsCategory,
      onRequestCreateCategory,
      onDragStart,
      onDragOver,
      onDrop,
      onDragLeave,
      onSelect,
      onDblClick,
      onRequestDeleteCategory,
      addCategoryToParent,
      updateNodeLabel,
      removeNode,
      // setTree is exposed for parent refs; no need to return to template
    };
  },
});
</script>

<style scoped>
.categories-tree {
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
