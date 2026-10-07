<template>
  <q-page class="biz-page">
    <div class="biz-page__inner">
      <div class="biz-page__header">
        <div>
          <h1 class="biz-page__title">Empresas</h1>
          <p class="biz-page__sub">Cada empresa lleva su propia contabilidad, aparte de la tuya personal.</p>
        </div>
        <q-btn unelevated rounded no-caps color="primary" icon="add_business" label="Crear empresa" @click="showCreate = true" />
      </div>

      <!-- Invitaciones pendientes -->
      <section v-if="store.pendingInvites.length" class="biz-page__section">
        <h2 class="biz-page__h2">Invitaciones</h2>
        <div v-for="b in store.pendingInvites" :key="b.id" class="biz-card biz-card--invite">
          <span class="biz-card__mark" :style="{ background: b.color }">{{ b.name.charAt(0).toUpperCase() }}</span>
          <div class="biz-card__text">
            <div class="biz-card__name">{{ b.name }}</div>
            <div class="biz-card__caption">Te invitaron como {{ businessRoleLabel(b.my_role).toLowerCase() }}</div>
          </div>
          <q-btn unelevated rounded no-caps size="sm" color="primary" label="Aceptar" :loading="respondingId === b.id" @click="respond(b, 'accept')" />
          <q-btn flat rounded no-caps size="sm" color="negative" label="Rechazar" :disable="respondingId === b.id" @click="respond(b, 'decline')" />
        </div>
      </section>

      <!-- Empresas -->
      <section class="biz-page__section">
        <div v-if="store.loading && !store.loaded" class="biz-page__loading"><q-spinner size="28px" /></div>

        <div v-else-if="!store.activeBusinesses.length" class="biz-empty">
          <q-icon name="store" size="34px" color="grey-5" />
          <div class="biz-empty__title">Todavía no tenés empresas</div>
          <p class="biz-empty__desc">
            Creá una empresa para llevar su contabilidad separada de la tuya, o pedile a alguien que te invite a la suya.
          </p>
        </div>

        <template v-else>
          <div v-for="b in store.activeBusinesses" :key="b.id" class="biz-block">
            <div class="biz-card">
              <span class="biz-card__mark" :style="{ background: b.color }">{{ b.name.charAt(0).toUpperCase() }}</span>
              <div class="biz-card__text">
                <div class="biz-card__name">
                  {{ b.name }}
                  <span v-if="store.activeContext === b.id" class="biz-card__current" :style="{ color: b.color }">activa</span>
                </div>
                <div class="biz-card__caption">
                  {{ businessRoleLabel(b.my_role) }} · {{ b.mode === 'pro' ? 'Pro' : 'Lite' }}<template v-if="b.tax_id"> · {{ b.tax_id }}</template>
                </div>
              </div>
              <q-btn v-if="store.activeContext !== b.id" outline rounded no-caps size="sm" label="Usar" @click="store.setContext(b.id)" />
              <q-btn flat round dense :icon="openId === b.id ? 'expand_less' : 'expand_more'" aria-label="Ver detalle" @click="toggle(b.id)" />
            </div>

            <div v-if="openId === b.id" class="biz-detail">
              <!-- Ajustes (solo dueño) -->
              <div v-if="b.my_role === 'owner'" class="biz-settings">
                <div class="biz-settings__row">
                  <q-input v-model="edit.name" outlined dense label="Nombre" maxlength="100" class="biz-settings__grow" />
                  <q-input v-model="edit.tax_id" outlined dense label="RIF / identificación" maxlength="40" class="biz-settings__grow" />
                </div>
                <div class="biz-settings__row">
                  <q-btn-toggle
                    v-model="edit.mode"
                    unelevated
                    rounded
                    no-caps
                    toggle-color="primary"
                    :options="[{ label: 'Lite', value: 'lite' }, { label: 'Pro', value: 'pro' }]"
                  />
                  <div class="biz-settings__palette">
                    <button
                      v-for="c in BUSINESS_PALETTE"
                      :key="c.id"
                      type="button"
                      class="biz-settings__dot"
                      :class="{ 'biz-settings__dot--on': edit.color === c.value }"
                      :style="{ background: c.value }"
                      :title="c.label"
                      :aria-label="c.label"
                      @click="edit.color = c.value"
                    />
                  </div>
                </div>
                <div class="biz-settings__row">
                  <q-btn unelevated rounded no-caps size="sm" color="primary" label="Guardar cambios" :loading="saving" :disable="edit.name.trim().length < 2" @click="saveEdit(b)" />
                  <q-btn flat rounded no-caps size="sm" :label="b.onboarded_at ? 'Repetir configuración' : 'Configurar empresa'" @click="startOnboarding(b)" />
                  <q-space />
                  <q-btn flat rounded no-caps size="sm" color="negative" icon="delete" label="Eliminar empresa" @click="confirmDelete = b" />
                </div>
              </div>

              <BusinessAccessPanel :business="b" />
            </div>
          </div>
        </template>
      </section>
    </div>

    <CreateBusinessModal v-model="showCreate" @created="onCreated" />
    <BusinessOnboardingFlow v-model="showOnboarding" :business="onboardingTarget" />

    <q-dialog :model-value="!!confirmDelete" @update:model-value="(v: boolean) => { if (!v) confirmDelete = null; }">
      <q-card style="min-width: 320px; max-width: 460px">
        <q-card-section class="text-h6">Eliminar {{ confirmDelete?.name }}</q-card-section>
        <q-card-section>
          La empresa y su acceso desaparecen para todos sus miembros. Esta acción solo la puede hacer un dueño.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" @click="confirmDelete = null" />
          <q-btn unelevated no-caps color="negative" label="Eliminar" :loading="deleting" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import {
  useBusinessStore,
  businessErrorMessage,
  businessRoleLabel,
  BUSINESS_PALETTE,
  type Business,
  type BusinessMode,
} from 'stores/business';
import CreateBusinessModal from 'components/business/CreateBusinessModal.vue';
import BusinessAccessPanel from 'components/business/BusinessAccessPanel.vue';
import BusinessOnboardingFlow from 'components/business/BusinessOnboardingFlow.vue';

defineOptions({ name: 'BusinessesPage' });

const $q = useQuasar();
const store = useBusinessStore();

const showCreate = ref(false);
const showOnboarding = ref(false);
const onboardingTarget = ref<Business | null>(null);
const openId = ref<number | null>(null);
const respondingId = ref<number | null>(null);
const saving = ref(false);
const deleting = ref(false);
const confirmDelete = ref<Business | null>(null);
const edit = reactive<{ name: string; tax_id: string; mode: BusinessMode; color: string }>({
  name: '',
  tax_id: '',
  mode: 'lite',
  color: '#3B5BDB',
});

onMounted(() => {
  void (async () => {
    try {
      await store.fetchBusinesses();
    } catch (e: unknown) {
      $q.notify({ type: 'negative', message: businessErrorMessage(e, 'No se pudieron cargar tus empresas') });
    }
  })();
});

function toggle(id: number) {
  if (openId.value === id) {
    openId.value = null;
    return;
  }
  openId.value = id;
  const b = store.businesses.find((x) => x.id === id);
  if (b) {
    edit.name = b.name;
    edit.tax_id = b.tax_id ?? '';
    edit.mode = b.mode;
    edit.color = b.color;
  }
}

async function respond(b: Business, action: 'accept' | 'decline') {
  respondingId.value = b.id;
  try {
    if (action === 'accept') await store.accept(b.id);
    else await store.decline(b.id);
    $q.notify({ type: 'positive', message: action === 'accept' ? 'Ahora tenés acceso a la empresa' : 'Invitación rechazada' });
  } catch (e: unknown) {
    $q.notify({ type: 'negative', message: businessErrorMessage(e) });
  } finally {
    respondingId.value = null;
  }
}

async function saveEdit(b: Business) {
  saving.value = true;
  try {
    await store.updateBusiness(b.id, {
      name: edit.name.trim(),
      tax_id: edit.tax_id.trim() || null,
      mode: edit.mode,
      color: edit.color,
    });
    $q.notify({ type: 'positive', message: 'Cambios guardados' });
  } catch (e: unknown) {
    $q.notify({ type: 'negative', message: businessErrorMessage(e, 'No se pudieron guardar los cambios') });
  } finally {
    saving.value = false;
  }
}

async function doDelete() {
  const b = confirmDelete.value;
  if (!b) return;
  deleting.value = true;
  try {
    await store.removeBusiness(b.id);
    confirmDelete.value = null;
    openId.value = null;
    $q.notify({ type: 'positive', message: 'Empresa eliminada' });
  } catch (e: unknown) {
    $q.notify({ type: 'negative', message: businessErrorMessage(e, 'No se pudo eliminar la empresa') });
  } finally {
    deleting.value = false;
  }
}

function startOnboarding(b: Business) {
  onboardingTarget.value = b;
  showOnboarding.value = true;
}

function onCreated(b: Business) {
  openId.value = b.id;
  store.setContext(b.id);
}
</script>

<style scoped lang="scss">
.biz-page {
  padding: 24px 16px 120px;

  &__inner { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 22px; }
  &__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  &__title { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: 24px; color: var(--fg-1); }
  &__sub { margin: 4px 0 0; font-size: 13.5px; color: var(--fg-2); }
  &__section { display: flex; flex-direction: column; gap: 12px; }
  &__h2 { margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--fg-3); }
  &__loading { display: flex; justify-content: center; padding: 24px; }
}

.biz-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-lg, 16px);
  background: var(--surface-1);
  box-shadow: var(--shadow-card);

  &--invite { border: 1px solid var(--warning, #f59e0b); }
  &__mark {
    width: 40px; height: 40px; border-radius: 12px; color: #fff; flex-shrink: 0;
    display: grid; place-items: center; font-weight: 700; font-size: 17px;
  }
  &__text { flex: 1; min-width: 0; }
  &__name { font-weight: 600; font-size: 15px; color: var(--fg-1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__current { font-size: 11px; font-weight: 700; margin-left: 8px; text-transform: uppercase; letter-spacing: 0.04em; }
  &__caption { font-size: 12.5px; color: var(--fg-2); margin-top: 2px; }
}

.biz-block { display: flex; flex-direction: column; gap: 12px; }
.biz-detail { display: flex; flex-direction: column; gap: 16px; padding-left: 8px; }

.biz-settings {
  display: flex; flex-direction: column; gap: 14px; padding: 18px; border-radius: var(--radius-lg, 16px);
  background: var(--surface-1); box-shadow: var(--shadow-card);

  &__row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  &__grow { flex: 1; min-width: 200px; }
  &__palette { display: flex; gap: 7px; flex-wrap: wrap; }
  &__dot {
    width: 26px; height: 26px; border-radius: 8px; cursor: pointer; border: 2px solid transparent;
    &--on { border-color: var(--fg-1); }
  }
}

.biz-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 16px; text-align: center;
  &__title { font-weight: 600; font-size: 16px; color: var(--fg-1); }
  &__desc { margin: 0; max-width: 420px; font-size: 13.5px; line-height: 1.5; color: var(--fg-2); }
}
</style>
