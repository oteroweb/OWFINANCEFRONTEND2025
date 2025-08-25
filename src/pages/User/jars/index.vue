<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6">Mis Cántaros</div>
          <div class="text-caption text-grey-7">
            Distribuye y visualiza tus porcentajes por frascos
          </div>
        </div>
        <div
          class="text-subtitle2"
          :class="{ 'text-negative': totalPercentage > 100, 'text-warning': totalPercentage < 100 }"
        >
          Total: {{ totalPercentage }}%
        </div>
      </q-card-section>

      <!-- Resumen con porcentajes dentro de frascos (comentado a solicitud) -->
      <!--
      <q-separator />
      <q-card-section v-if="jarElements.length > 0">
        <div class="row q-col-gutter-md items-stretch">
          <div
            v-for="(jar, idx) in jarElements"
            :key="idx"
            class="col-6 col-sm-3 col-md-2 flex column items-center"
          >
            <div class="jar-visual jar-visual--sm q-mb-xs">
              <div class="jar-cap" />
              <div class="jar-body">
                <div
                  class="jar-fill"
                  :style="{ height: jar.percent + '%', background: jarFillGradient() }"
                />
                <div class="jar-percent">{{ jar.percent }}%</div>
              </div>
            </div>
            <div class="jar-caption text-center" style="max-width: 140px">
              <div class="jar-title ellipsis-2-lines">{{ jar.name }}</div>
              <div class="jar-type text-caption text-grey-7 ellipsis">{{ jar.type }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
      -->

      <!-- Editor y visual de "jarras" (imagen 3) -->
      <q-separator />
      <q-card-section v-if="jarElements.length > 0">
        <div class="row q-col-gutter-lg">
          <div
            v-for="(jar, idx) in jarElements"
            :key="'editor-' + idx"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat class="q-pa-md">
              <div class="row items-center">
                <div class="col-auto">
                  <!-- Jar visual -->
                  <div class="jar-visual">
                    <div class="jar-cap" />
                    <div class="jar-body">
                      <div
                        class="jar-fill"
                        :style="{ height: jar.percent + '%', background: jarFillGradient() }"
                      />
                    </div>
                  </div>
                  <div class="jar-caption text-center q-mt-xs" style="max-width: 140px">
                    <div class="jar-title ellipsis-2-lines">{{ jar.name }}</div>
                    <div class="jar-type text-caption text-grey-7 ellipsis">{{ jar.type }}</div>
                  </div>
                </div>
                <div class="col">
                  <div class="text-subtitle2">{{ jar.name }}</div>
                  <div class="row items-center q-gutter-sm q-mt-xs">
                    <q-slider
                      v-model.number="jar.percent"
                      :min="0"
                      :max="100"
                      :step="1"
                      color="primary"
                      class="col"
                      @update:model-value="onPercentChange"
                    />
                    <q-input
                      v-model.number="jar.percent"
                      type="number"
                      dense
                      filled
                      style="width: 80px"
                      suffix="%"
                      @update:model-value="onPercentChange"
                    />
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-else>
        <div class="text-warning">No hay cántaros para mostrar.</div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn
          label="Guardar Cambios"
          color="primary"
          @click="saveChanges"
          :disable="totalPercentage !== 100"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

defineOptions({ name: 'JarsOverviewPage' });

type Jar = { id?: number; name: string; percent: number; type: string };

const $q = useQuasar();
const auth = useAuthStore();
const jarElements = ref<Jar[]>([]);

const totalPercentage = computed(
  () =>
    Math.round(
      (jarElements.value?.reduce((sum, j) => sum + (Number(j.percent) || 0), 0) || 0) * 100
    ) / 100
);

function onPercentChange() {
  // Clamp between 0-100 and round to int
  jarElements.value = jarElements.value.map((j) => ({
    ...j,
    percent: Math.max(0, Math.min(100, Math.round(Number(j.percent) || 0))),
  }));
}

function jarFillGradient(): string {
  // Azul consistente para mejorar la legibilidad del porcentaje dentro del frasco
  // Usa el primario si existe; fallback a un azul (#1976D2)
  return 'linear-gradient(180deg, rgba(25,118,210,0.95) 0%, rgba(25,118,210,0.9) 60%, rgba(25,118,210,0.75) 100%)';
}

async function loadJarData() {
  try {
    // Prefer backend if available
    const res = await api.get('/jars', { params: { user_id: auth.user?.id, per_page: 100 } });
    const raw = (res.data?.data || res.data || []) as Array<
      Partial<Jar> & { name?: string; percent?: number; type?: string }
    >;
    const mapped: Jar[] = (Array.isArray(raw) ? raw : []).map((r, i) => {
      const base: Jar = {
        name: r.name || `Cántaro ${i + 1}`,
        percent: Math.max(0, Math.min(100, Number(r.percent ?? 0))),
        type: r.type || 'general',
      };
      const idVal = (r as { id?: number }).id;
      return idVal != null ? { ...base, id: idVal } : base;
    });
    // Fallback demo if API returns empty
    jarElements.value = mapped.length
      ? mapped
      : [
          { name: 'Necesidades (55%)', percent: 55, type: 'needs' },
          { name: 'Ahorro (10%)', percent: 10, type: 'savings' },
          { name: 'Formación (10%)', percent: 10, type: 'education' },
          { name: 'Diversión (10%)', percent: 10, type: 'fun' },
          { name: 'Donación (10%)', percent: 10, type: 'charity' },
          { name: 'Libertad (5%)', percent: 5, type: 'freedom' },
        ];
  } catch (e) {
    // Fallback to demo and notify
    jarElements.value = [
      { name: 'Necesidades (55%)', percent: 55, type: 'needs' },
      { name: 'Ahorro (10%)', percent: 10, type: 'savings' },
      { name: 'Formación (10%)', percent: 10, type: 'education' },
      { name: 'Diversión (10%)', percent: 10, type: 'fun' },
      { name: 'Donación (10%)', percent: 10, type: 'charity' },
      { name: 'Libertad (5%)', percent: 5, type: 'freedom' },
    ];
    $q.notify({ type: 'warning', message: 'No se pudieron cargar los cántaros; usando muestra' });
    console.error('loadJarData error', e);
  }
}

function saveChanges() {
  if (totalPercentage.value !== 100) {
    $q.notify({ type: 'warning', message: 'El total debe sumar 100% antes de guardar' });
    return;
  }
  // TODO: enviar a backend (PUT /jars/bulk?) si existe endpoint
  $q.notify({ type: 'positive', message: 'Cambios guardados (local)' });
}

onMounted(() => {
  void loadJarData();
});
</script>

<style scoped>
/* Visual tipo jarra */
.jar-visual {
  width: 60px;
  height: 100px;
  position: relative;
  display: inline-block;
}
.jar-visual--sm {
  transform: scale(0.92);
  transform-origin: center;
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
  width: 60px;
  height: 88px;
  margin: 0 auto;
  border: 3px solid var(--q-grey-4);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.02);
}
.jar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transition: height 200ms ease;
}
.jar-percent {
  position: absolute;
  bottom: 6px;
  left: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}
.jar-caption {
  line-height: 1.1;
}
.jar-title {
  font-size: 13px;
}
.jar-type {
  font-size: 11px;
}
</style>
