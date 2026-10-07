<template>
  <div class="brp">
    <button
      v-for="r in BUSINESS_ROLES"
      :key="r.id"
      type="button"
      class="brp__role"
      :class="{ 'brp__role--on': modelValue === r.id }"
      :style="modelValue === r.id ? { borderColor: tint } : undefined"
      @click="emit('update:modelValue', r.id)"
    >
      <span
        class="brp__radio"
        :style="modelValue === r.id ? { borderColor: tint, background: tint } : undefined"
      />
      <span class="brp__text">
        <span class="brp__label">{{ r.label }}</span>
        <span class="brp__can">{{ r.can }}</span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { BUSINESS_ROLES, type BusinessRole } from 'stores/business';

defineOptions({ name: 'BusinessRolePicker' });

defineProps<{ modelValue: BusinessRole; tint: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: BusinessRole] }>();
</script>

<style scoped lang="scss">
.brp {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__role {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    text-align: left;
    width: 100%;
    cursor: pointer;
    padding: 12px 14px;
    border-radius: 12px;
    background: transparent;
    border: 1px solid var(--border-hairline);
    &--on { background: var(--surface-1); }
  }
  &__radio {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 1px;
    border: 2px solid var(--border-hairline);
    box-sizing: border-box;
  }
  &__text { min-width: 0; display: flex; flex-direction: column; }
  &__label { font-weight: 600; font-size: 14px; color: var(--fg-1); }
  &__can { font-size: 12.5px; line-height: 1.5; margin-top: 2px; color: var(--fg-2); }
}
</style>
