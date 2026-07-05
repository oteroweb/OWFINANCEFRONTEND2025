<template>
  <div v-if="percentJars.length" class="jar-split-info shell-surface shell-surface--subtle">
    <div class="row items-center q-gutter-xs">
      <q-icon name="auto_awesome" size="16px" color="primary" />
      <div class="text-caption text-weight-medium">Se reparte automáticamente</div>
    </div>
    <div class="q-mt-xs">
      <div
        v-for="jar in percentJars"
        :key="jar.uid"
        class="row items-center justify-between text-caption q-py-2"
      >
        <div class="row items-center q-gutter-xs">
          <q-badge v-if="jar.color" :style="{ backgroundColor: jar.color }" rounded />
          <span>{{ jar.name }}</span>
        </div>
        <span class="text-weight-medium">{{ Number(jar.percent || 0).toFixed(0) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useJarsStore } from 'stores/jars';
import { api } from 'boot/axios';

defineOptions({ name: 'JarPercentSplitInfo' });

const jarsStore = useJarsStore();

// OWF-187: cántaros con reparto por porcentaje, mismo criterio que JarCard.vue / useJarBalance.ts
const percentJars = computed(() =>
  jarsStore.jars.filter((j) => j.type === 'percent' && (j.active ?? true) && Number(j.percent || 0) > 0)
);

// Si el store aún no tiene cántaros (p.ej. el usuario no ha visitado /jars), los cargamos
// reutilizando el mismo endpoint /jars que usa la pantalla de cántaros.
onMounted(() => {
  if (jarsStore.jars.length) return;
  void (async () => {
    try {
      const res = await api.get('/jars', { params: { per_page: 100 } });
      const raw = res.data as { data?: unknown };
      let arr: unknown[] = [];
      if (Array.isArray(raw?.data)) arr = raw.data;
      else if (raw?.data && typeof raw.data === 'object' && Array.isArray((raw.data as { data?: unknown }).data)) {
        arr = (raw.data as { data: unknown[] }).data;
      } else if (Array.isArray(raw)) arr = raw as unknown[];
      type RawJar = {
        uid?: string;
        id?: number | string;
        name?: string;
        type?: string;
        percent?: number | string;
        color?: string;
        is_active?: unknown;
        active?: unknown;
      };
      const mapped = (arr as RawJar[]).map((r) => ({
        uid: String(r.uid ?? r.id ?? r.name ?? Math.random()),
        name: r.name || 'Cántaro',
        type: r.type === 'fixed' ? ('fixed' as const) : ('percent' as const),
        percent: r.percent != null ? Number(r.percent) : undefined,
        color: r.color,
        active: r.is_active != null ? Number(r.is_active) === 1 : r.active != null ? Number(r.active) === 1 : true,
      }));
      jarsStore.setJars(mapped);
    } catch {
      // Silencioso: si falla, simplemente no se muestra el aviso
    }
  })();
});
</script>

<style scoped>
.jar-split-info {
  border-radius: 8px;
  padding: 10px 14px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
}
</style>
