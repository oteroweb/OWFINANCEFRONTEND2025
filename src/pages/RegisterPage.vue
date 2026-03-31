<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card style="min-width: 320px; max-width: 420px; width: 100%">
      <q-card-section>
        <div class="text-h6">Crear cuenta</div>
        <div class="text-caption text-grey">Completa los datos para registrarte</div>
      </q-card-section>

      <form @submit.prevent="submit" autocomplete="on">
        <q-card-section class="q-gutter-sm">
          <q-input
            v-model="name"
            label="Nombre completo"
            type="text"
            name="name"
            autocomplete="name"
            :disable="loading"
            :error="!!errors.name"
            :error-message="errors.name"
            autofocus
          />
          <q-input
            v-model="email"
            label="Correo electrónico"
            type="email"
            name="email"
            autocomplete="email"
            autocapitalize="none"
            inputmode="email"
            :disable="loading"
            :error="!!errors.email"
            :error-message="errors.email"
          />
          <q-input
            v-model="password"
            label="Contraseña"
            type="password"
            name="password"
            autocomplete="new-password"
            :disable="loading"
            :error="!!errors.password"
            :error-message="errors.password"
            hint="Mínimo 6 caracteres"
          />
          <q-input
            v-model="passwordConfirmation"
            label="Confirmar contraseña"
            type="password"
            name="password_confirmation"
            autocomplete="new-password"
            :disable="loading"
            :error="!!errors.password_confirmation"
            :error-message="errors.password_confirmation"
          />
        </q-card-section>

        <q-card-actions align="between" class="q-pa-md">
          <q-btn
            flat
            label="Ya tengo cuenta"
            color="primary"
            @click="$router.push('/login')"
            :disable="loading"
          />
          <q-btn
            label="Registrarme"
            color="primary"
            type="submit"
            :loading="loading"
            :disable="loading"
          />
        </q-card-actions>
      </form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { api } from 'boot/axios';

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const loading = ref(false);
const errors = ref<Record<string, string>>({});
const router = useRouter();
const auth = useAuthStore();

async function submit() {
  if (loading.value) return;
  loading.value = true;
  errors.value = {};

  try {
    const response = await api.post('/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });

    const body = response.data as Record<string, unknown>;

    if (body['status'] === 'OK' && body['token']) {
      // Replicate the same session-setting logic as the auth store login action
      auth.$patch({
        token: body['token'] as string,
        user: (body['data'] ?? null) as Parameters<typeof auth.$patch>[0] extends { user?: infer U } ? U : never,
      });
      localStorage.setItem('token', body['token'] as string);
      localStorage.setItem('user', JSON.stringify(body['data'] ?? null));
      api.defaults.headers.common.Authorization = `Bearer ${body['token']}`;

      if (auth.role === 'admin') {
        void router.push('/admin');
      } else {
        void router.push('/user');
      }
    } else {
      alert((body['message'] as string) || 'No se pudo completar el registro.');
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string }; status?: number } };
    if (axiosError?.response?.status === 422 && axiosError.response.data?.errors) {
      const rawErrors = axiosError.response.data.errors;
      const flat: Record<string, string> = {};
      for (const key in rawErrors) {
        flat[key] = Array.isArray(rawErrors[key]) ? rawErrors[key][0] : rawErrors[key];
      }
      errors.value = flat;
    } else {
      const msg = axiosError?.response?.data?.message;
      alert(msg || 'Error al crear la cuenta. Verifica tu conexión.');
    }
  } finally {
    loading.value = false;
  }
}
</script>
