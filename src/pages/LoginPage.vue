<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <form @submit.prevent="submit" autocomplete="on">
        <q-card-section>
          <q-input
            v-model="email"
            label="Email"
            type="email"
            name="email"
            autocomplete="username"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            inputmode="email"
            autofocus
            :disable="loginLoading"
          />
          <q-input
            v-model="password"
            label="Password"
            type="password"
            class="q-mt-sm"
            name="password"
            autocomplete="current-password"
            :disable="loginLoading"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Login"
            color="primary"
            type="submit"
            :loading="loginLoading"
            :disable="loginLoading"
          />
        </q-card-actions>
      </form>

      <!-- Biometric login -->
      <q-card-section v-if="showBiometric && !loginLoading" class="q-pt-none text-center">
        <q-separator class="q-mb-md" />
        <q-btn
          round
          size="lg"
          color="teal"
          icon="fingerprint"
          @click="loginWithBiometric"
          :loading="biometricLoading"
          :disable="biometricLoading"
        />
        <div class="text-caption text-grey q-mt-sm">Acceder con huella</div>
      </q-card-section>
    </q-card>

    <!-- Register link -->
    <div class="q-mt-md text-center">
      <span class="text-caption text-grey-6">¿No tienes cuenta? </span>
      <router-link to="/register" class="text-caption text-primary">Regístrate</router-link>
    </div>

    <!-- Download App Section -->
    <div class="q-mt-lg text-center">
      <q-separator class="q-mb-md" style="max-width: 320px; margin: 0 auto 12px auto;" />
      <div class="text-caption text-grey-6 q-mb-sm">📱 Descarga la app para Android</div>
      <div class="row justify-center q-gutter-sm">
        <q-btn
          unelevated
          size="sm"
          color="positive"
          icon="android"
          label="DEV (Beta)"
          href="https://appfinanzasdev.blockshift.website/downloads/owfinance-dev.apk"
          type="a"
          no-caps
        />
        <q-btn
          unelevated
          size="sm"
          color="primary"
          icon="android"
          label="Stage"
          href="https://appfinanzas.blockshift.website/downloads/owfinance-stage.apk"
          type="a"
          no-caps
        />
      </div>
      <div class="text-caption text-grey-5 q-mt-xs">Los enlaces siempre apuntan a la versión más reciente</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { useBiometric } from 'src/composables/useBiometric';

const email = ref('');
const password = ref('');
const router = useRouter();
const auth = useAuthStore();

const { checkAvailability, checkStoredCredentials, saveCredentials, authenticate, isAvailable } = useBiometric();
const showBiometric = ref(false);
const biometricLoading = ref(false);
const loginLoading = ref(false);

onMounted(async () => {
  const available = await checkAvailability();
  if (available) {
    const hasCreds = await checkStoredCredentials();
    showBiometric.value = hasCreds;
  }
});

function navigateByRole() {
  if (auth.role === 'admin') {
    void router.push('/admin');
  } else if (auth.role === 'user') {
    void router.push('/user');
  } else {
    alert('Rol desconocido');
  }
}

async function submit() {
  if (loginLoading.value) return;
  loginLoading.value = true;
  try {
    await auth.login(email.value, password.value);

    // Guardar credenciales para biometría si el dispositivo lo soporta
    if (isAvailable.value) {
      await saveCredentials(email.value, password.value);
    }

    navigateByRole();
  } catch (error: unknown) {
    console.error('Error completo de login:', error);
    if (error instanceof Error) {
      alert(error.message || 'Error al iniciar sesión. Verifica tu conexión y credenciales.');
    } else {
      alert('Error al iniciar sesión. Verifica tu conexión y credenciales.');
    }
  } finally {
    loginLoading.value = false;
  }
}

async function loginWithBiometric() {
  biometricLoading.value = true;
  try {
    const creds = await authenticate();
    if (!creds) return;

    await auth.login(creds.email, creds.password);
    navigateByRole();
  } catch (error: unknown) {
    console.error('Error biométrico:', error);
    if (error instanceof Error) {
      alert(error.message || 'Error al autenticar con huella.');
    } else {
      alert('Error al autenticar con huella.');
    }
  } finally {
    biometricLoading.value = false;
  }
}
</script>
