<template>
  <div ref="refEl" class="tx-dropdown" :class="{ 'tx-dropdown--full': full }">
    <button class="tx-dropdown__trigger" :class="{ 'tx-dropdown__trigger--active': active }" @click="open = !open">
      <q-icon :name="icon" size="17px" />
      <span class="tx-dropdown__label">{{ activeLabel }}</span>
      <q-icon :name="open ? 'expand_less' : 'expand_more'" size="18px" class="tx-dropdown__arrow" />
    </button>
    <div v-if="open" class="tx-dropdown__menu">
      <button
        v-for="o in options"
        :key="o.id"
        class="tx-dropdown__option"
        :class="{ 'tx-dropdown__option--active': o.id === value }"
        @click="select(o.id)"
      >
        <span v-if="o.color" class="tx-dropdown__dot" :style="{ background: o.color }" />
        <q-icon v-else-if="o.icon" :name="o.icon" size="17px" color="var(--fg-3)" />
        <span v-else class="tx-dropdown__spacer" />
        <span class="tx-dropdown__option-label">{{ o.label }}</span>
        <span v-if="o.count != null" class="tx-dropdown__count">{{ o.count }}</span>
        <q-icon v-if="o.id === value" name="check" size="17px" color="var(--brand-primary)" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

interface Option {
  id: string;
  label: string;
  icon?: string | undefined;
  color?: string | undefined;
  count?: number | undefined;
}

const props = defineProps<{
  icon: string;
  label: string;
  value: string;
  options: Option[];
  full?: boolean;
}>();

const emit = defineEmits<{ change: [value: string] }>();

const open = ref(false);
const refEl = ref<HTMLElement | null>(null);

const active = computed(() => props.value !== 'all');
const activeLabel = computed(() => {
  const cur = props.options.find((o) => o.id === props.value);
  return active.value ? (cur?.label || props.label) : props.label;
});

function select(id: string) {
  emit('change', id);
  open.value = false;
}

function onDocClick(e: MouseEvent) {
  if (refEl.value && !refEl.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<style scoped lang="scss">
.tx-dropdown {
  position: relative;
  width: auto;

  &--full {
    width: 100%;
  }

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    width: 100%;
    padding: 9px 12px;
    border-radius: var(--radius-md);
    border: 0;
    background: var(--surface-2);
    color: var(--fg-1);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);

    &--active {
      background: color-mix(in srgb, var(--brand-primary) 12%, var(--surface-1));
      color: var(--brand-primary);
      font-weight: 600;
    }
  }

  &__label {
    flex: 1;
    text-align: left;
  }

  &__arrow {
    opacity: 0.6;
  }

  &__menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 60;
    min-width: 230px;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background: var(--surface-1);
    border-radius: var(--radius-lg);
    box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18);
    border: 1px solid var(--border-hairline);
    padding: 6px;
  }

  &__option {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 10px;
    padding: 9px 11px;
    border: 0;
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: left;
    background: transparent;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--fg-1);
    transition: background var(--dur-base) var(--ease-out);

    &:hover {
      background: var(--surface-2);
    }

    &--active {
      background: var(--surface-2);
      font-weight: 600;
    }
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__spacer {
    width: 9px;
    flex-shrink: 0;
  }

  &__option-label {
    flex: 1;
  }

  &__count {
    font-size: 11px;
    color: var(--fg-3);
    font-family: var(--font-money);
  }
}
</style>
