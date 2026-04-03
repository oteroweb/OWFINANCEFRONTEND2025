<template>
  <aside class="fixed left-0 top-18 w-70 h-[calc(100vh-72px)] bg-white border-r border-slate-200 flex flex-col overflow-y-auto" :class="{ 'w-18': collapsed }">
    <!-- User Profile Card -->
    <div class="p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition" @click="emit('profileClick')">
      <div class="flex gap-3">
        <q-avatar size="56px" :src="user.avatar" color="primary" text-color="white">
          {{ user.name?.charAt(0).toUpperCase() }}
        </q-avatar>
        <div v-show="!collapsed" class="flex-1 min-w-0">
          <p class="font-semibold text-slate-900 truncate">{{ user.name }}</p>
          <p class="text-sm text-slate-500 truncate">{{ user.email }}</p>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="p-2">
      <div v-for="item in mainNav" :key="item.id" class="mb-1">
        <button
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition whitespace-nowrap',
            activeRoute === item.route
              ? 'bg-slate-100 text-[#1E3A8A] border-l-4 border-[#1E3A8A]'
              : 'text-slate-700 hover:bg-slate-50 border-l-4 border-transparent'
          ]"
          :title="item.label"
          @click="onNavClick(item)"
        >
          <q-icon :name="item.icon" size="20px" />
          <span v-show="!collapsed">{{ item.label }}</span>
        </button>
      </div>
    </nav>

    <!-- Custom Sections (Draggable) -->
    <div v-if="!collapsed" class="flex-1 px-2 py-4 border-t border-slate-200 overflow-y-auto">
      <div
        v-if="customSections.length === 0"
        class="text-center text-sm text-slate-500 py-8"
      >
        No custom sections yet
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="(section, index) in customSections"
          :key="section.id"
          class="group p-3 rounded-lg hover:bg-slate-50 cursor-move transition bg-slate-50"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragover="onDragOver"
          @drop="onDrop($event, index)"
          @dragend="onDragEnd"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">{{ section.label }}</span>
            <button
              class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition"
              @click.stop="emit('sectionDelete', { sectionId: section.id })"
            >
              <q-icon name="close" size="16px" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Section Button -->
    <div v-if="!collapsed" class="p-2 border-t border-slate-200">
      <button
        class="w-full py-2 px-4 bg-slate-100 text-[#1E3A8A] rounded-lg text-sm font-medium hover:bg-slate-200 transition"
        @click="emit('addSection')"
      >
        + Add Section
      </button>
    </div>

    <!-- Collapse Toggle -->
    <div class="p-2 border-t border-slate-200 mt-auto">
      <button
        class="w-full flex items-center justify-center py-2 px-4 text-slate-600 hover:bg-slate-50 rounded-lg transition"
        :title="collapsed ? 'Expand' : 'Collapse'"
        @click="emit('collapseToggle')"
      >
        <q-icon :name="collapsed ? 'chevron_right' : 'chevron_left'" size="20px" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Navigation item interface
 */
interface NavItem {
  id: string
  label: string
  icon: string
  route: string
}

/**
 * Custom section interface
 */
interface CustomSection {
  id: string
  label: string
  items?: Array<{ id: string; label: string; route?: string }>
}

/**
 * Component props interface
 */
interface Props {
  user?: {
    name: string
    email: string
    avatar: string
  }
  mainNav?: NavItem[]
  customSections?: CustomSection[]
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  user: () => ({ name: 'User', email: 'user@example.com', avatar: '' }),
  mainNav: () => [
    { id: 'home', label: 'Home', icon: 'dashboard', route: '/app/home' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long', route: '/app/transactions' },
    { id: 'jars', label: 'Jars', icon: 'savings', route: '/app/jars' },
    { id: 'settings', label: 'Settings', icon: 'settings', route: '/app/config' },
  ],
  customSections: () => [],
  collapsed: false,
})

const emit = defineEmits<{
  navClick: [{ route: string }]
  sectionReorder: [{ newOrder: CustomSection[] }]
  sectionDelete: [{ sectionId: string }]
  profileClick: []
  collapseToggle: []
  addSection: []
}>()

const route = useRoute()
const draggedItem = ref<CustomSection | null>(null)
const draggedFromIndex = ref<number>(-1)
const collapsed = ref<boolean>(props.collapsed)

/**
 * Computed property for active route
 */
const activeRoute = computed(() => route.path)

/**
 * Handle navigation item click
 */
function onNavClick(item: NavItem): void {
  emit('navClick', { route: item.route })
}

/**
 * Handle drag start
 */
function onDragStart(e: DragEvent, index: number): void {
  draggedItem.value = props.customSections[index]
  draggedFromIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }
}

/**
 * Handle drag over
 */
function onDragOver(e: DragEvent): void {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

/**
 * Handle drop
 */
function onDrop(e: DragEvent, toIndex: number): void {
  e.preventDefault()

  if (!draggedItem.value || draggedFromIndex.value === -1) {
    return
  }

  const newOrder = [...props.customSections]
  const [removed] = newOrder.splice(draggedFromIndex.value, 1)
  newOrder.splice(toIndex, 0, removed)

  emit('sectionReorder', { newOrder })
  saveToLocalStorage(newOrder)
}

/**
 * Handle drag end
 */
function onDragEnd(): void {
  draggedItem.value = null
  draggedFromIndex.value = -1
}

/**
 * Save custom sections to localStorage
 */
function saveToLocalStorage(sections: CustomSection[]): void {
  try {
    localStorage.setItem('sidebar-custom-sections', JSON.stringify(sections))
  } catch (error) {
    console.error('Failed to save sections to localStorage:', error)
  }
}

/**
 * Load custom sections from localStorage
 */
function loadFromLocalStorage(): CustomSection[] {
  try {
    const stored = localStorage.getItem('sidebar-custom-sections')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load sections from localStorage:', error)
    return []
  }
}

/**
 * Initialize component
 */
onMounted(() => {
  // Load persisted state from localStorage if available
  const stored = loadFromLocalStorage()
  if (stored.length > 0) {
    emit('sectionReorder', { newOrder: stored })
  }
})

/**
 * Watch for external collapsed state changes
 */
watch(() => props.collapsed, (newValue) => {
  collapsed.value = newValue
})
</script>

<style lang="scss" scoped>
aside {
  z-index: 50;
  width: 280px;
  transition: width 0.3s ease-in-out;

  &.w-18 {
    width: 72px;

    :deep(.p-4) {
      padding: 1rem 0.5rem;
    }

    :deep(.px-4) {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
  }
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;

  &:hover {
    background: #94a3b8;
  }
}
</style>
