<template>
  <q-dialog v-model="isOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="bg-primary text-white text-center q-pa-xl column flex-center">
      <q-card-section>
        <div class="text-h3 text-weight-bolder q-mb-md">Bienvenido a OW Finance</div>
        <div class="text-subtitle1 text-grey-3 q-mb-xl">
          Hemos evolucionado. Ahora puedes elegir la experiencia que mejor se adapte a ti.
        </div>

        <div class="row q-col-gutter-lg justify-center">
          <div class="col-12 col-md-5">
            <q-card class="bg-white text-dark text-center cursor-pointer q-pa-lg round-borders shadow-4 hover-scale" @click="selectLayout('lite')">
              <q-icon name="speed" size="4rem" color="primary" class="q-mb-md" />
              <div class="text-h5 text-weight-bold">Versión Lite</div>
              <p class="text-body2 q-mt-sm text-grey-8">
                Rápida, ágil y directa al grano. Ideal para llevar el control diario de tus finanzas desde el móvil sin fricciones.
              </p>
              <q-btn unelevated color="primary" label="Elegir Lite" class="full-width q-mt-md" />
            </q-card>
          </div>

          <div class="col-12 col-md-5">
            <q-card class="bg-dark text-white text-center cursor-pointer q-pa-lg round-borders shadow-4 hover-scale" @click="selectLayout('pro')">
              <q-icon name="dashboard_customize" size="4rem" color="secondary" class="q-mb-md" />
              <div class="text-h5 text-weight-bold">Versión Pro</div>
              <p class="text-body2 q-mt-sm text-grey-4">
                Potencia máxima. Vista de escritorio, análisis detallados, múltiples pantallas y control absoluto de todas tus métricas.
              </p>
              <q-btn outline color="secondary" label="Elegir Pro" class="full-width q-mt-md" />
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from 'stores/auth';
import { api } from 'boot/axios';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isOpen = ref(false);

const checkOnboarding = () => {
  if (authStore.isLoggedIn && authStore.settings && !authStore.settings.has_seen_onboarding) {
    isOpen.value = true;
  } else {
    isOpen.value = false;
  }
};

onMounted(() => {
  checkOnboarding();
});

watch(
  () => authStore.settings?.has_seen_onboarding,
  () => checkOnboarding(),
  { immediate: true }
);

const selectLayout = async (mode: 'lite' | 'pro') => {
  try {
    isOpen.value = false;
    // Guardar preferencia
    const res = await api.put('/user/settings', {
      layout_mode: mode,
      has_seen_onboarding: true
    });
    
    // Actualizar store y forzar recarga de estado
    if (res.data?.data) {
      if (!authStore.settings) {
        // En caso de que TS se queje, no debería ocurrir si estamos logueados
        authStore.settings = { ...res.data.data };
      } else {
        authStore.settings.has_seen_onboarding = true;
        authStore.settings.layout_mode = mode;
      }
      localStorage.setItem('settings', JSON.stringify(authStore.settings));
    }
    
    // Redirigir según la selección a la ruta unificada
    void router.push('/app/home').then(() => {
      window.location.reload();
    });
  } catch (error) {
    console.error('Failed to update layout mode:', error);
  }
};
</script>

<style scoped>
.hover-scale {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-scale:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}
</style>
