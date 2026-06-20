<template>
  <div class="auth-split">
    <!-- LEFT BRAND -->
    <aside class="auth-brand">
      <router-link class="logo-row" to="/" aria-label="OW Finance">
        <svg viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg" height="30" style="filter: brightness(0) invert(1)">
          <text x="0" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="700" font-size="20" fill="currentColor">OW</text>
          <text x="44" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="400" font-size="20" fill="currentColor" opacity="0.6">Finance</text>
        </svg>
      </router-link>
      <div class="brand-mid">
        <h2>Tu dinero, repartido<br />con propósito.</h2>
        <p>Entra para ver tus cántaros, alimentar tus sueños y registrar lo del día en segundos.</p>
        <div class="brand-mock">
          <div class="bm-lbl">Disponible · USD</div>
          <div class="bm-amt">$ 12,480.50</div>
          <div class="bm-row">
            <div class="bm-pill"><div class="p-l">Necesidades</div><div class="p-v">$ 1,815</div></div>
            <div class="bm-pill"><div class="p-l">Ahorro</div><div class="p-v">$ 2,940</div></div>
            <div class="bm-pill"><div class="p-l">Diversión</div><div class="p-v">$ 132</div></div>
          </div>
        </div>
      </div>
      <div class="brand-foot">Lite o Pro · USD · EUR · VES · Claro y oscuro</div>
    </aside>

    <!-- RIGHT FORM -->
    <main class="auth-form-wrap">
      <div class="auth-form-top">
        <router-link class="auth-back" to="/"><span class="material-icons">arrow_back</span>Volver al inicio</router-link>
        <button
          class="icon-btn"
          :aria-label="isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'"
          @click="toggleTheme"
        >
          <span class="material-icons">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>
      </div>

      <div class="auth-form-center">
        <div class="auth-card">
          <div class="auth-logo-mobile">
            <img src="/assets/redesign/ow-finance-wordmark.svg" alt="OW Finance" height="32" />
          </div>

          <div class="seg" role="tablist">
            <button
              id="tab-login"
              :class="{ active: mode === 'login' }"
              role="tab"
              @click="mode = 'login'"
            >Iniciar sesión</button>
            <button
              id="tab-register"
              :class="{ active: mode === 'register' }"
              role="tab"
              @click="goToRegister"
            >Crear cuenta</button>
          </div>

          <h1 id="auth-title">{{ mode === 'register' ? 'Crea tu cuenta' : 'Hola de nuevo' }}</h1>
          <p class="sub" id="auth-sub">{{ mode === 'register' ? 'Empieza gratis. Sin tarjeta.' : 'Entra para seguir con tus finanzas.' }}</p>

          <form @submit.prevent="submit" autocomplete="on">
            <div class="field" :class="{ hide: mode !== 'register' }">
              <label for="i-name">Nombre</label>
              <div class="input-shell">
                <span class="material-icons">person</span>
                <input id="i-name" v-model="name" type="text" placeholder="José Andrés" autocomplete="name" />
              </div>
            </div>
            <div class="field">
              <label for="i-email">Correo</label>
              <div class="input-shell">
                <span class="material-icons">mail</span>
                <input id="i-email" v-model="email" type="email" placeholder="tu@correo.com" autocomplete="username" />
              </div>
            </div>
            <div class="field">
              <label for="i-pass">Contraseña</label>
              <div class="input-shell">
                <span class="material-icons">lock</span>
                <input id="i-pass" v-model="password" :type="showPassword ? 'text' : 'password'" :placeholder="showPassword ? 'password' : '••••••••'" :autocomplete="mode === 'register' ? 'new-password' : 'current-password'" />
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

          <div class="divider">o continúa con</div>
          <div class="social">
            <a class="btn" href="#" @click.prevent><span class="g-mark" aria-hidden="true">G</span>Google</a>
            <a class="btn" href="#" @click.prevent><span class="a-mark" aria-hidden="true"></span>Apple</a>
          </div>

          <p v-if="mode === 'login'" class="legal">¿Aún no tienes cuenta? <router-link to="/register">Créala gratis</router-link>.</p>
          <p v-else class="legal">Al crear una cuenta aceptas los <a href="#">Términos</a> y la <a href="#">Política de privacidad</a>.</p>

          <!-- App Download -->
          <div class="divider">Descarga la app</div>
          <div class="app-downloads" style="display: flex; gap: 10px; margin-top: 12px">
            <a class="btn" style="flex: 1; font-size: 13px" href="https://appfinanzasdev.blockshift.website/downloads/owfinance-dev.apk" target="_blank" rel="noopener">
              <span class="material-icons" style="font-size: 18px; color: var(--info)">android</span>DEV (Beta)
            </a>
            <a class="btn" style="flex: 1; font-size: 13px" href="https://appfinanzas.blockshift.website/downloads/owfinance-stage.apk" target="_blank" rel="noopener">
              <span class="material-icons" style="font-size: 18px; color: var(--brand-primary)">android</span>Stage
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'stores/auth';
import { useBiometric } from 'src/composables/useBiometric';
import { api } from 'boot/axios';
import { usePublicTheme } from 'src/composables/usePublicTheme';

const $q = useQuasar();
const { t } = useI18n();

const email = ref('');
const password = ref('');
const name = ref('');
const mode = ref<'login' | 'register'>('login');
const showPassword = ref(false);
const rememberMe = ref(true);
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const { isDark, toggleTheme } = usePublicTheme();

const { saveCredentials, isAvailable } = useBiometric();
const loginLoading = ref(false);

onMounted(() => {
  if (route.query['tab'] === 'register') mode.value = 'register';
});

function goToRegister() {
  mode.value = 'register';
  void router.replace({ path: '/login', query: { tab: 'register' } });
}

function navigateByRole(role: string) {
  console.log('[Login] navigateByRole — role:', role);

  if (role === 'admin') {
    localStorage.setItem('role', 'admin');
    void router.push('/admin');
  } else if (role === 'user') {
    localStorage.setItem('role', 'user');
    void router.push('/user');
  } else {
    console.error('[Login] Unrecognized role:', role, '| auth.user:', auth.user);
    $q.notify({ type: 'warning', message: t('notify.unknownRole') });
    void router.push('/login');
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
      if (isAvailable.value) {
        await saveCredentials(email.value, password.value);
      }
      navigateByRole(result.role);
    }
  } catch (error: unknown) {
    console.error('[Auth] submit error:', error);
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

// Biometric login logic preserved in useBiometric composable
</script>
