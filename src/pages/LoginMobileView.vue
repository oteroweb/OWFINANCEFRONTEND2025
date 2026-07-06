<template>
  <div class="auth-mobile">
    <div class="auth-mobile__top">
      <router-link class="auth-mobile__back" to="/"><span class="material-icons">arrow_back</span></router-link>
    </div>

    <div class="auth-mobile__body">
      <div class="seg" role="tablist">
        <button id="tab-login" :class="{ active: mode === 'login' }" role="tab" @click="mode = 'login'">Iniciar sesión</button>
        <button id="tab-register" :class="{ active: mode === 'register' }" role="tab" @click="mode = 'register'">Crear cuenta</button>
      </div>

      <h1 class="auth-mobile__title">{{ mode === 'register' ? 'Crea tu cuenta' : 'Hola de nuevo' }}</h1>
      <p class="auth-mobile__sub">{{ mode === 'register' ? 'Empieza gratis. Sin tarjeta.' : 'Entra para seguir con tus finanzas.' }}</p>

      <form @submit.prevent="submit" autocomplete="on">
        <div class="field" :class="{ hide: mode !== 'register' }">
          <label for="m-i-name">Nombre</label>
          <div class="input-shell">
            <span class="material-icons">person</span>
            <input id="m-i-name" v-model="name" type="text" placeholder="José Andrés" autocomplete="name" />
          </div>
        </div>
        <div class="field">
          <label for="m-i-email">Correo</label>
          <div class="input-shell">
            <span class="material-icons">mail</span>
            <input id="m-i-email" v-model="email" type="email" placeholder="tu@correo.com" autocomplete="username" />
          </div>
        </div>
        <div class="field">
          <label for="m-i-pass">Contraseña</label>
          <div class="input-shell">
            <span class="material-icons">lock</span>
            <input id="m-i-pass" v-model="password" :type="showPassword ? 'text' : 'password'" :placeholder="showPassword ? 'password' : '••••••••'" :autocomplete="mode === 'register' ? 'new-password' : 'current-password'" />
            <span class="material-icons eye" @click="showPassword = !showPassword">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
          </div>
        </div>

        <div v-if="mode === 'login'" class="row-between">
          <label class="check"><input v-model="rememberMe" type="checkbox" checked />Recuérdame</label>
          <router-link class="link-cyan" style="font-size: 13.5px" to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
        </div>

        <button class="btn btn-primary btn-lg btn-block" type="submit" :disabled="loginLoading">
          {{ loginLoading ? 'Entrando...' : (mode === 'register' ? 'Crear cuenta' : 'Entrar') }}<span v-if="!loginLoading" class="material-icons">arrow_forward</span>
        </button>
      </form>

      <button v-if="biometric.isAvailable.value" class="btn btn-ghost btn-lg btn-block auth-mobile__biometric" type="button" @click="loginWithBiometrics">
        <span class="material-icons">{{ biometricIcon }}</span>{{ biometricLabel }}
      </button>

      <p v-if="mode === 'login'" class="legal">¿Aún no tienes cuenta? <a href="#" @click.prevent="mode = 'register'">Créala gratis</a>.</p>
      <p v-else class="legal">Al crear una cuenta aceptas los <a href="#">Términos</a> y la <a href="#">Política de privacidad</a>.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'stores/auth';
import { useBiometric } from 'src/composables/useBiometric';
import { BiometryType } from 'capacitor-native-biometric';
import { api } from 'boot/axios';

const $q = useQuasar();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const biometric = useBiometric();

const biometricLabel = computed(() => {
  switch (biometric.biometryType.value) {
    case BiometryType.FACE_ID: return 'Entrar con Face ID';
    case BiometryType.TOUCH_ID: return 'Entrar con Touch ID';
    default: return 'Entrar con huella';
  }
});
const biometricIcon = computed(() => {
  return biometric.biometryType.value === BiometryType.FACE_ID ? 'face' : 'fingerprint';
});

const email = ref('');
const password = ref('');
const name = ref('');
const mode = ref<'login' | 'register'>('login');
const showPassword = ref(false);
const rememberMe = ref(true);
const loginLoading = ref(false);

onMounted(() => {
  if (route.query['tab'] === 'register') mode.value = 'register';
  void biometric.checkAvailability();
});

function navigateByRole(role: string) {
  if (role === 'admin') {
    localStorage.setItem('role', 'admin');
    void router.push('/admin');
  } else if (role === 'user') {
    localStorage.setItem('role', 'user');
    void router.push('/user');
  } else {
    $q.notify({ type: 'warning', message: t('notify.unknownRole') });
    void router.push('/login');
  }
}

async function loginWithBiometrics() {
  const creds = await biometric.authenticate();
  if (!creds) return;
  loginLoading.value = true;
  try {
    const result = await auth.login(creds.email, creds.password);
    navigateByRole(result.role);
  } catch {
    $q.notify({ type: 'negative', message: t('notify.loginError') });
  } finally {
    loginLoading.value = false;
  }
}

async function submit() {
  if (loginLoading.value) return;
  loginLoading.value = true;
  try {
    if (mode.value === 'register') {
      const response = await api.post('/auth/register', {
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: password.value,
      });
      const body = response.data as Record<string, unknown>;
      if (body['status'] === 'OK' && body['token']) {
        auth.$patch({
          token: body['token'] as string,
          user: (body['data'] ?? null) as Parameters<typeof auth.$patch>[0] extends { user?: infer U } ? U : never,
        });
        const tokenStr = body['token'] as string;
        localStorage.setItem('token', tokenStr);
        localStorage.setItem('user', JSON.stringify(body['data'] ?? null));
        api.defaults.headers.common.Authorization = `Bearer ${tokenStr}`;
        void router.push('/user');
      } else {
        $q.notify({ type: 'negative', message: (body['message'] as string) || t('notify.registerFailed') });
      }
    } else {
      const result = await auth.login(email.value, password.value);
      if (biometric.isAvailable.value) {
        await biometric.saveCredentials(email.value, password.value);
      }
      navigateByRole(result.role);
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string }; status?: number }; message?: string };
    if (axiosError?.response?.status === 422 && axiosError.response.data?.errors) {
      const rawErrors = axiosError.response.data.errors;
      const first = Object.values(rawErrors)[0];
      $q.notify({ type: 'negative', message: Array.isArray(first) ? first[0] ?? '' : String(first) });
    } else {
      const msg = axiosError?.response?.data?.message || axiosError?.message;
      $q.notify({ type: 'negative', message: msg || t('notify.loginError') });
    }
  } finally {
    loginLoading.value = false;
  }
}
</script>

<style scoped>
.auth-mobile {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-canvas);
  padding: env(safe-area-inset-top) 22px env(safe-area-inset-bottom);
}

.auth-mobile__top {
  flex-shrink: 0;
  padding: 16px 0;
}

.auth-mobile__back {
  display: inline-flex;
  align-items: center;
  color: var(--fg-2);
}

.auth-mobile__body {
  flex: 1;
  padding-top: 12px;
}

.auth-mobile__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  color: var(--fg-1);
  margin: 20px 0 4px;
}

.auth-mobile__sub {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--fg-2);
  margin: 0 0 22px;
}

.auth-mobile__biometric {
  margin-top: 12px;
}

.field.hide {
  display: none;
}
</style>
