<template>
  <q-card flat bordered class="q-pa-md">
    <div class="text-subtitle1 q-mb-sm">
      <q-icon name="lock" class="q-mr-sm" />
      Cambiar Contraseña
    </div>
    <div class="text-caption text-grey-7 q-mb-md">
      Deja estos campos vacíos si no deseas cambiar tu contraseña
    </div>
    <div class="q-gutter-md">
      <q-input
        v-model="newPwd"
        :type="showPwd ? 'text' : 'password'"
        label="Nueva contraseña"
        outlined
        dense
        autocomplete="new-password"
      >
        <template #prepend>
          <q-icon name="vpn_key" />
        </template>
        <template #append>
          <q-icon
            :name="showPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPwd = !showPwd"
          />
        </template>
        <template #hint>Mínimo 8 caracteres</template>
      </q-input>

      <div v-if="newPwd.length > 0" class="pw-strength">
        <div class="pw-strength__bar">
          <div
            v-for="i in 4"
            :key="i"
            class="pw-strength__seg"
            :class="{ 'pw-strength__seg--active': i <= strength.score }"
            :style="i <= strength.score ? { background: strength.color } : {}"
          />
        </div>
        <span class="pw-strength__label" :style="{ color: strength.color }">{{ strength.label }}</span>
      </div>

      <q-input
        v-model="confirmPwd"
        :type="showPwd ? 'text' : 'password'"
        label="Confirmar contraseña"
        outlined
        dense
        autocomplete="new-password"
        :error="!!confirmError"
        :error-message="confirmError"
      >
        <template #prepend>
          <q-icon name="check_circle" />
        </template>
      </q-input>
    </div>
    <div class="row justify-end q-mt-md">
      <q-btn
        color="primary"
        label="Cambiar contraseña"
        :loading="saving"
        :disable="!newPwd"
        @click="submit"
      />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const $q = useQuasar();

const newPwd     = ref('');
const confirmPwd = ref('');
const showPwd    = ref(false);
const saving     = ref(false);

const strength = computed(() => {
  const p = newPwd.value;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  return { score, label: labels[score - 1] ?? 'Muy débil', color: colors[score - 1] ?? '#ef4444' };
});

const confirmError = computed(() =>
  confirmPwd.value && newPwd.value !== confirmPwd.value ? 'Las contraseñas no coinciden' : ''
);

async function submit() {
  if (!newPwd.value) return;
  if (newPwd.value.length < 8) {
    $q.notify({ type: 'warning', message: 'La contraseña debe tener al menos 8 caracteres' });
    return;
  }
  if (newPwd.value !== confirmPwd.value) {
    $q.notify({ type: 'warning', message: 'Las contraseñas no coinciden' });
    return;
  }
  saving.value = true;
  try {
    await api.put('/user/profile', { password: newPwd.value });
    newPwd.value = '';
    confirmPwd.value = '';
    $q.notify({ type: 'positive', message: 'Contraseña actualizada' });
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al cambiar la contraseña';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.pw-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: -4px;
}
.pw-strength__bar {
  display: flex;
  gap: 4px;
  flex: 1;
}
.pw-strength__seg {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--surface-3, #e2e8f0);
  transition: background 250ms;
}
.pw-strength__label {
  font-size: 11px;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}
</style>
