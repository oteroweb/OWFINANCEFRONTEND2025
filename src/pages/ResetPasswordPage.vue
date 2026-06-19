<template>
  <div class="auth-split">
    <aside class="auth-brand">
      <router-link class="logo-row" to="/" aria-label="OW Finance">
        <svg viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg" height="30"
          style="filter: brightness(0) invert(1)">
          <text x="0" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="700"
            font-size="20" fill="currentColor">OW</text>
          <text x="44" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="400"
            font-size="20" fill="currentColor" opacity="0.6">Finance</text>
        </svg>
      </router-link>
      <div class="auth-brand__copy">
        <h1 class="auth-brand__title">Nueva contraseña,<br />mismo control</h1>
        <p class="auth-brand__sub">Elige una contraseña segura para proteger tu cuenta.</p>
      </div>
    </aside>

    <main class="auth-form-panel">
      <div class="auth-form-wrap">
        <div v-if="!done">
          <h2 class="auth-form-title">Restablecer contraseña</h2>
          <p class="auth-form-sub">Elige una nueva contraseña de al menos 8 caracteres.</p>

          <q-form class="auth-form" @submit.prevent="submit">
            <q-input
              v-model="email"
              type="email"
              label="Correo electrónico"
              outlined
              dense
              :disable="loading || !!tokenFromUrl"
              autocomplete="email"
            />

            <q-input
              v-model="password"
              :type="showPwd ? 'text' : 'password'"
              label="Nueva contraseña"
              outlined
              dense
              :error="!!errors.password"
              :error-message="errors.password"
              autocomplete="new-password"
              :disable="loading"
            >
              <template #append>
                <q-icon
                  :name="showPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPwd = !showPwd"
                />
              </template>
            </q-input>

            <q-input
              v-model="passwordConfirm"
              :type="showPwd ? 'text' : 'password'"
              label="Confirmar contraseña"
              outlined
              dense
              :error="!!errors.confirm"
              :error-message="errors.confirm"
              autocomplete="new-password"
              :disable="loading"
            />

            <q-banner v-if="errors.global" class="auth-banner auth-banner--error q-mb-md" rounded>
              {{ errors.global }}
            </q-banner>

            <q-btn
              type="submit"
              unelevated
              color="primary"
              class="auth-form__submit"
              :loading="loading"
              label="Guardar nueva contraseña"
            />
          </q-form>

          <div class="auth-form-links">
            <router-link to="/login" class="auth-link">← Volver al inicio de sesión</router-link>
          </div>
        </div>

        <!-- Success -->
        <div v-else class="auth-sent">
          <div class="auth-sent__icon">✅</div>
          <h2 class="auth-form-title">¡Listo!</h2>
          <p class="auth-form-sub">Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.</p>
          <router-link to="/login">
            <q-btn unelevated color="primary" class="auth-form__submit" label="Ir al inicio de sesión" />
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';

const route = useRoute();

const email           = ref('');
const password        = ref('');
const passwordConfirm = ref('');
const showPwd         = ref(false);
const loading         = ref(false);
const done            = ref(false);
const tokenFromUrl    = ref('');
const errors = ref<{ password?: string; confirm?: string; global?: string }>({});

onMounted(() => {
  // Laravel sends: /reset-password?token=xxx&email=yyy
  tokenFromUrl.value = String(route.query.token ?? '');
  if (route.query.email) email.value = String(route.query.email);
});

async function submit() {
  errors.value = {};

  if (password.value.length < 8) {
    errors.value.password = 'Mínimo 8 caracteres.';
    return;
  }
  if (password.value !== passwordConfirm.value) {
    errors.value.confirm = 'Las contraseñas no coinciden.';
    return;
  }

  loading.value = true;
  try {
    await api.post('/auth/reset-password', {
      token:                 tokenFromUrl.value,
      email:                 email.value,
      password:              password.value,
      password_confirmation: passwordConfirm.value,
    });
    done.value = true;
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    errors.value.global = e.response?.data?.message ?? 'Enlace inválido o expirado. Solicita uno nuevo.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-sent {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.auth-sent__icon { font-size: 48px; margin-bottom: 8px; }
.auth-banner { font-size: 13px; }
.auth-banner--error { background: rgba(239,68,68,.08); color: #dc2626; }
</style>
