<template>
  <div class="big-jar-sidebar">
    <div class="text-subtitle2 q-mb-sm">Resumen</div>
    <div class="row q-col-gutter-md items-start">
      <div class="col-auto">
        <div class="jar-visual jar-visual--xl">
          <div class="jar-cap" />
          <div class="jar-body">
            <div class="jar-stack">
              <div
                v-for="seg in segments"
                :key="seg.uid"
                class="jar-segment"
                :style="{ height: seg.height + '%', backgroundColor: seg.color }"
              />
              <div
                v-if="!hasFixedJar && totalPercentage < 100"
                class="jar-segment jar-segment-empty"
                :style="{ height: 100 - totalPercentage + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="text-caption text-grey-7 q-mb-xs">Leyenda</div>
        <div v-for="j in jars" :key="j.uid" class="row items-center q-gutter-xs q-mb-xs no-wrap">
          <div class="color-dot" :style="{ backgroundColor: getJarColor(j) }" />
          <div class="col text-caption ellipsis">
            {{ j.name }} —
            <span v-if="j.type === 'percent'">{{ j.percent || 0 }}%</span>
            <span v-else
              >$ {{ (j.fixedAmount ?? 0).toLocaleString?.() ?? j.fixedAmount ?? 0 }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useJarsStore, type JarLite } from 'stores/jars';

const store = useJarsStore();
const jars = computed(() => store.jars);
const totalPercentage = computed(() => store.totalPercentage);
const hasFixedJar = computed(() => store.hasFixedJar);

// Color utils (higher contrast)
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
function autoColorForLabel(label: string): string {
  if (!label) return '#6B7280';
  const seed = hashString(label);
  // Golden-angle hue spacing for better distribution
  const h = Math.floor((((seed * 137.508) % 360) + 360) % 360);
  // Vary saturation and lightness deterministically within contrast-friendly ranges
  const s = 65 + (seed % 25); // 65–89
  const l = 36 + (Math.floor(seed / 7) % 14); // 36–49 (not too light)
  return hslToHex(h, s, l);
}
function getJarColor(j: JarLite): string {
  return j.color || autoColorForLabel(j.name || 'Jar');
}

// Build stacked segments from percent jars, normalized
const segments = computed(() => {
  const parts = (jars.value || [])
    .filter((j) => j.type === 'percent' && (j.percent || 0) > 0)
    .map((j) => ({ uid: j.uid, percent: Number(j.percent || 0), color: getJarColor(j) }));
  const sum = parts.reduce((a, b) => a + b.percent, 0);
  if (sum <= 0) return [] as Array<{ uid: string; height: number; color: string }>;
  return parts.map((p) => ({ uid: p.uid, height: (p.percent / sum) * 100, color: p.color }));
});
</script>

<script lang="ts">
export default {
  name: 'BigJarSidebar',
};
</script>

<style scoped>
.jar-visual {
  width: 60px;
  height: 100px;
  position: relative;
  display: inline-block;
}
.jar-visual--xl {
  width: 110px;
  height: 180px;
}
.jar-cap {
  width: 34px;
  height: 10px;
  background: #333;
  border-radius: 4px;
  margin: 0 auto 2px auto;
}
.jar-body {
  position: relative;
  width: 110px;
  height: 168px;
  margin: 0 auto;
  border: 3px solid rgba(0, 0, 0, 0.02);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.02);
}
.jar-stack {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
}
.jar-segment {
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.jar-segment-empty {
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.05),
    rgba(0, 0, 0, 0.05) 6px,
    rgba(0, 0, 0, 0.08) 6px,
    rgba(0, 0, 0, 0.08) 12px
  );
}
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
