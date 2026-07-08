<template>
  <div class="auth-split">
    <!-- LEFT BRAND (same as LoginPage) -->
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
        <h1 class="auth-brand__title">Recupera el control<br />de tus finanzas</h1>
        <p class="auth-brand__sub">Te enviamos un enlace para restablecer tu contraseña.</p>
      </div>
    </aside>

    <!-- RIGHT FORM -->
    <main class="auth-form-panel">
      <div class="auth-form-wrap">
        <div v-if="!sent">
          <h2 class="auth-form-title">¿Olvidaste tu contraseña?</h2>
          <p class="auth-form-sub">Ingresa tu correo y te enviaremos un enlace de recuperación.</p>

          <q-form class="auth-form" @submit.prevent="submit">
            <q-input
              v-model="email"
              type="email"
              label="Correo electrónico"
              outlined
              dense
              :error="!!error"
              :error-message="error"
              autocomplete="email"
              :disable="loading"
            />

            <q-btn
              type="submit"
              unelevated
              color="primary"
              class="auth-form__submit"
              :loading="loading"
              label="Enviar enlace de recuperación"
            />
          </q-form>

          <div class="auth-form-links">
            <router-link to="/login" class="auth-link">← Volver al inicio de sesión</router-link>
          </div>
        </div>

        <!-- Success state -->
        <div v-else class="auth-sent">
          <q-icon name="mail" size="48px" color="primary" class="auth-sent__icon" />
          <h2 class="auth-form-title">Revisa tu correo</h2>
          <p class="auth-form-sub">
            Si <strong>{{ email }}</strong> está registrado, recibirás el enlace en los próximos minutos.
            Revisa también la carpeta de spam.
          </p>
          <router-link to="/login">
            <q-btn unelevated color="primary" class="auth-form__submit" label="Volver al inicio de sesión" />
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';

const email   = ref('');
const loading = ref(false);
const error   = ref('');
const sent    = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await api.post('/auth/forgot-password', { email: email.value });
    sent.value = true;
  } catch {
    error.value = 'No se pudo enviar el correo. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Reuses auth-split styles defined globally in LoginPage.vue / app.scss */
.auth-sent {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.auth-sent__icon {
  font-size: 48px;
  margin-bottom: 8px;
}
</style>
