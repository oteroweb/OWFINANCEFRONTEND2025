<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Configuraciones</div>

    <q-card flat bordered>
      <q-tabs v-model="tab" dense class="text-primary" align="left" inline-label>
        <q-tab name="profile" icon="person" label="Perfil" />
        <q-tab name="accounts" icon="account_balance_wallet" label="Cuentas" />
        <q-tab name="taxes" icon="percent" label="Impuestos" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="profile">
          <div class="q-gutter-md">
            <div class="text-subtitle1">Información de Perfil</div>
            <div class="row q-col-gutter-md items-center">
              <div class="col-auto">
                <q-avatar size="96px">
                  <img :src="avatarPreview || avatarUrl" alt="avatar" />
                </q-avatar>
              </div>
              <div class="col-auto">
                <q-btn color="primary" label="Cambiar foto" @click="pickAvatar" />
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileChange"
                />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="name" label="Nombre" outlined dense />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="email" label="Correo" type="email" outlined dense />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="password"
                  label="Nueva contraseña"
                  type="password"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="passwordConfirm"
                  label="Confirmar contraseña"
                  type="password"
                  outlined
                  dense
                />
              </div>
            </div>
            <div>
              <q-btn
                color="primary"
                :loading="saving"
                label="Guardar cambios"
                @click="saveProfile"
              />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="accounts">
          <CrudPage :dictionary="accountsDictionary" />
        </q-tab-panel>

        <q-tab-panel name="taxes">
          <CrudPage :dictionary="taxesDictionary" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CrudPage from 'components/CrudPage.vue';
import { useAuthStore } from 'stores/auth';
import { defaultAvatarUrl } from '../config';
import { dictionary as accountsDictionary } from '../accounts/dictionary';
import { dictionary as taxesDictionary } from '../taxes/dictionary';
import { api } from 'boot/axios';
import { Notify } from 'quasar';

defineOptions({ name: 'user_config_page' });

const auth = useAuthStore();
const tab = ref<'profile' | 'accounts' | 'taxes'>('profile');

const name = ref(auth.user?.name || '');
const email = ref(auth.user?.email || '');
const password = ref('');
const passwordConfirm = ref('');

const fileInput = ref<HTMLInputElement | null>(null);
const avatarUrl = computed(() => defaultAvatarUrl);
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);

const saving = ref(false);

function pickAvatar() {
  fileInput.value?.click();
}

function onFileChange(evt: Event) {
  const target = evt.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  avatarFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      avatarPreview.value = typeof res === 'string' ? res : '';
    };
    reader.readAsDataURL(file);
  } else {
    avatarPreview.value = null;
  }
}

async function saveProfile() {
  try {
    if (!name.value || !email.value) {
      Notify.create({ type: 'warning', message: 'Nombre y correo son requeridos' });
      return;
    }
    if (password.value && password.value !== passwordConfirm.value) {
      Notify.create({ type: 'warning', message: 'Las contraseñas no coinciden' });
      return;
    }
    saving.value = true;

    // Update profile basic data
    await api.put('/user/profile', {
      name: name.value,
      email: email.value,
      ...(password.value ? { password: password.value } : {}),
    });

    // Upload avatar if selected
    if (avatarFile.value) {
      const form = new FormData();
      form.append('avatar', avatarFile.value);
      await api.post('/user/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    // Refresh local auth store
    if (auth.user) {
      auth.user.name = name.value;
      auth.user.email = email.value;
      localStorage.setItem('user', JSON.stringify(auth.user));
    }

    Notify.create({ type: 'positive', message: 'Perfil actualizado' });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error al guardar';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
