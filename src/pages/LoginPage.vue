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
          />
          <q-input
            v-model="password"
            label="Password"
            type="password"
            class="q-mt-sm"
            name="password"
            autocomplete="current-password"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Login" color="primary" type="submit" />
        </q-card-actions>
      </form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const email = ref('');
const password = ref('');
const router = useRouter();
const auth = useAuthStore();

async function submit() {
  try {
    await auth.login(email.value, password.value);

    // 👇 Espera a que auth.role esté disponible
    if (auth.role === 'admin') {
      void router.push('/admin');
    } else if (auth.role === 'user') {
      void router.push('/user');
    } else {
      alert('Rol desconocido');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      alert(error.message || 'Error al iniciar sesión');
    } else {
      alert('Error al iniciar sesión');
    }
  }
}
</script>
