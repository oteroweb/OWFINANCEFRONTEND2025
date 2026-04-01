<template>
  <q-header class="bg-transparent q-py-lg q-px-xl" flat>
    <div class="row items-center justify-between">
      <div class="column">
        <span class="text-overline text-soft tracking-widest uppercase">
          {{ title }}
        </span>
        <div class="row items-baseline q-gutter-x-xs">
          <span class="text-h4 text-editorial text-pure">
            {{ currencySymbol }}{{ formattedWholePart }}
          </span>
          <span class="text-h6 text-editorial text-primary-cyan opacity-80">
            .{{ formattedDecimalPart }}
          </span>
        </div>
      </div>
      <slot name="right-action">
        <q-btn
          round
          flat
          icon="notifications_none"
          class="liquid-btn-soft text-primary-cyan"
        />
      </slot>
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  balance?: number | string;
  currencySymbol?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Ethereal Vault',
  balance: 0,
  currencySymbol: '$'
});

const formattedWholePart = computed(() => {
  const b = Number(props.balance);
  return Math.floor(b).toLocaleString();
});

const formattedDecimalPart = computed(() => {
  const b = Number(props.balance);
  const decimals = (b % 1).toFixed(2).split('.')[1];
  return decimals || '00';
});
</script>

<style lang="scss" scoped>
.text-pure { color: var(--text-pure); }
.text-soft { color: var(--text-soft); }
.text-primary-cyan { color: var(--primary-cyan); }

.liquid-btn-soft {
  background: rgba(137, 206, 255, 0.1);
  width: 44px;
  height: 44px;
}

.opacity-80 { opacity: 0.8; }
.tracking-widest { letter-spacing: 0.15em; }

.text-editorial {
  font-family: 'Manrope', sans-serif !important;
  font-weight: 700;
  letter-spacing: -0.04em;
}
</style>
