<template>
  <div class="bap">
    <div class="bap__head">
      <div class="bap__mark" :style="{ background: tint }">{{ (business.name || '?').charAt(0).toUpperCase() }}</div>
      <div class="bap__head-text">
        <div class="bap__title">Acceso a la contabilidad</div>
        <div class="bap__label bap__ellipsis">
          {{ business.name }} · {{ members.length }} {{ members.length === 1 ? 'persona' : 'personas' }}
        </div>
      </div>
    </div>

    <p class="bap__label bap__intro">
      Acá el acceso es a <b>toda</b> la contabilidad de {{ business.name }}, con un rol — no cuenta por cuenta como en
      el grupo familiar. Tu contabilidad personal no se ve desde acá.
    </p>

    <div class="bap__members">
      <div v-for="(m, i) in members" :key="m.id" class="bap__member" :class="{ 'bap__member--first': i === 0 }">
        <q-avatar size="40px" color="grey-3" text-color="grey-8">{{ initial(m) }}</q-avatar>
        <div class="bap__member-text">
          <div class="bap__member-row">
            <span class="bap__member-name" :class="{ 'bap__member-name--pending': m.status === 'invited' }">{{ m.user?.name ?? 'Miembro' }}</span>
            <span class="bap__badge" :class="badgeClass(m)">{{ m.status === 'invited' ? 'Invitación enviada' : businessRoleLabel(m.role) }}</span>
            <span v-if="isYou(m)" class="bap__label bap__you">vos</span>
          </div>
          <div class="bap__label bap__ellipsis">{{ m.user?.email ?? '' }}</div>
          <div v-if="m.status === 'invited'" class="bap__label bap__pending-hint">
            Invitado como {{ businessRoleLabel(m.role).toLowerCase() }} · hasta que acepte no ve nada
          </div>
        </div>

        <!-- Acciones por fila -->
        <div v-if="m.status === 'invited'" class="bap__row-gap">
          <q-btn v-if="iAmOwner" size="sm" flat rounded no-caps color="negative" label="Cancelar" @click="openView('revoke', m)" />
        </div>
        <div v-else-if="isYou(m)" class="bap__row-gap">
          <span v-if="isLastOwner(m)" class="bap__label bap__last-owner">Sos el único dueño: para salir, primero pasale el rol a alguien</span>
          <q-btn v-else size="sm" flat rounded no-caps label="Dejar de acceder" @click="openView('leave', m)" />
        </div>
        <div v-else-if="iAmOwner" class="bap__row-gap">
          <q-btn size="sm" flat rounded no-caps label="Cambiar rol" @click="openView('role', m)" />
          <q-btn v-if="!isLastOwner(m)" size="sm" flat rounded no-caps color="negative" label="Quitar" @click="openView('revoke', m)" />
        </div>
      </div>
    </div>

    <!-- Invitar -->
    <div v-if="view === 'invite'" class="bap__panel">
      <div class="bap__field">
        <span class="bap__label">Correo de la persona</span>
        <q-input v-model="email" type="email" outlined dense placeholder="contador@ejemplo.com" />
        <span class="bap__label bap__hint">La persona ya tiene que estar registrada en OWFinance.</span>
      </div>
      <div class="bap__field">
        <span class="bap__label">Con qué rol</span>
        <BusinessRolePicker v-model="role" :tint="tint" />
      </div>
      <div class="bap__row-gap">
        <q-btn size="sm" unelevated rounded no-caps color="primary" label="Enviar invitación" :disable="!email.trim()" :loading="busy" @click="onInvite" />
        <q-btn size="sm" flat rounded no-caps label="Cancelar" @click="view = 'list'" />
      </div>
    </div>

    <!-- Cambiar rol -->
    <div v-if="view === 'role' && target" class="bap__panel">
      <div class="bap__panel-title">Rol de {{ target.user?.name ?? 'esta persona' }}</div>
      <BusinessRolePicker v-model="role" :tint="tint" />
      <p v-if="role === 'owner'" class="bap__label bap__hint">Como dueño también puede dar y quitar acceso, incluido el tuyo.</p>
      <div class="bap__row-gap">
        <q-btn size="sm" unelevated rounded no-caps color="primary" label="Guardar rol" :loading="busy" @click="onSaveRole" />
        <q-btn size="sm" flat rounded no-caps label="Cancelar" @click="closeView" />
      </div>
    </div>

    <!-- Quitar / cancelar invitación -->
    <div v-if="view === 'revoke' && target" class="bap__panel bap__panel--danger">
      <div class="bap__panel-title">
        {{ target.status === 'invited' ? 'Cancelar invitación de' : 'Quitar a' }} {{ target.user?.name ?? 'esta persona' }}
      </div>
      <p class="bap__panel-desc">
        <template v-if="target.status === 'invited'">La invitación deja de valer; puede volver a invitarse cuando quieras.</template>
        <template v-else>
          Pierde el acceso a {{ business.name }} de inmediato. Los movimientos que registró quedan.
        </template>
      </p>
      <div class="bap__row-gap">
        <q-btn size="sm" unelevated rounded no-caps color="negative" :label="target.status === 'invited' ? 'Cancelar invitación' : 'Quitar acceso'" :loading="busy" @click="onRevoke" />
        <q-btn size="sm" flat rounded no-caps label="Volver" @click="closeView" />
      </div>
    </div>

    <!-- Dejar de acceder -->
    <div v-if="view === 'leave'" class="bap__panel bap__panel--danger">
      <div class="bap__panel-title">Dejar de acceder a {{ business.name }}</div>
      <p class="bap__panel-desc">
        {{ business.name }} desaparece de tu selector de contabilidad. Tu contabilidad personal no cambia.
        <template v-if="iAmOwner && otherOwners.length">
          {{ otherOwners.map((o) => o.user?.name ?? 'Otro dueño').join(' y ') }} queda{{ otherOwners.length > 1 ? 'n' : '' }} al frente de la contabilidad. Para volver, tiene que invitarte.
        </template>
        <template v-else>Para volver, alguien de la empresa tiene que invitarte otra vez.</template>
      </p>
      <div class="bap__row-gap">
        <q-btn size="sm" unelevated rounded no-caps color="negative" label="Dejar de acceder" :loading="busy" @click="onLeave" />
        <q-btn size="sm" flat rounded no-caps label="Quedarme" @click="closeView" />
      </div>
    </div>

    <div v-if="iAmOwner" class="bap__footer">
      <q-btn unelevated rounded no-caps color="primary" icon="person_add" label="Dar acceso a alguien" @click="toggleInvite" />
    </div>
    <p v-else class="bap__label bap__footer bap__footer--note">Solo un dueño de {{ business.name }} puede dar o quitar acceso.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';
import {
  useBusinessStore,
  businessErrorMessage,
  businessRoleLabel,
  type Business,
  type BusinessMember,
  type BusinessRole,
} from 'stores/business';

import BusinessRolePicker from './BusinessRolePicker.vue';

defineOptions({ name: 'BusinessAccessPanel' });

const props = defineProps<{ business: Business }>();

const $q = useQuasar();
const auth = useAuthStore();
const store = useBusinessStore();

type View = 'list' | 'invite' | 'role' | 'revoke' | 'leave';
const view = ref<View>('list');
const email = ref('');
const role = ref<BusinessRole>('accountant');
const target = ref<BusinessMember | null>(null);
const busy = ref(false);

const tint = computed(() => props.business.color || 'var(--brand-primary)');
const members = computed(() => props.business.members ?? []);
const myId = computed(() => auth.user?.id);
const iAmOwner = computed(() => props.business.my_role === 'owner' && props.business.my_status === 'active');
const activeOwners = computed(() => members.value.filter((m) => m.role === 'owner' && m.status === 'active'));
const otherOwners = computed(() => activeOwners.value.filter((m) => m.user_id !== myId.value));

function isYou(m: BusinessMember) {
  return m.user_id === myId.value;
}
function isLastOwner(m: BusinessMember) {
  return m.role === 'owner' && m.status === 'active' && activeOwners.value.length === 1;
}
function initial(m: BusinessMember) {
  return (m.user?.name || '?').charAt(0).toUpperCase();
}
function badgeClass(m: BusinessMember) {
  if (m.status === 'invited') return 'bap__badge--pending';
  return m.role === 'owner' ? 'bap__badge--owner' : 'bap__badge--member';
}

function openView(v: View, m: BusinessMember | null) {
  target.value = m;
  if (m && v === 'role') role.value = m.role;
  view.value = v;
}
function closeView() {
  view.value = 'list';
  target.value = null;
}
function toggleInvite() {
  email.value = '';
  role.value = 'accountant';
  view.value = view.value === 'invite' ? 'list' : 'invite';
}

async function run(fn: () => Promise<unknown>, okMsg: string, failMsg: string, after?: () => void) {
  busy.value = true;
  try {
    await fn();
    $q.notify({ type: 'positive', message: okMsg });
    if (after) after();
  } catch (e: unknown) {
    // Incluye "No se puede quitar al último dueño." (422) tal cual lo devuelve el backend.
    $q.notify({ type: 'negative', message: businessErrorMessage(e, failMsg) });
  } finally {
    busy.value = false;
  }
}

function onInvite() {
  void run(
    () => store.invite(props.business.id, email.value, role.value),
    'Invitación enviada',
    'No se pudo enviar la invitación',
    () => {
      email.value = '';
      view.value = 'list';
    },
  );
}

function onSaveRole() {
  const t = target.value;
  if (!t) return;
  void run(() => store.updateRole(props.business.id, t.user_id, role.value), 'Rol actualizado', 'No se pudo cambiar el rol', closeView);
}

function onRevoke() {
  const t = target.value;
  if (!t) return;
  void run(
    () => store.removeUser(props.business.id, t.user_id),
    t.status === 'invited' ? 'Invitación cancelada' : 'Acceso revocado',
    'No se pudo quitar el acceso',
    closeView,
  );
}

function onLeave() {
  const me = myId.value;
  if (me === undefined) return;
  void run(() => store.removeUser(props.business.id, me), 'Dejaste la empresa', 'No se pudo salir de la empresa', closeView);
}
</script>

<style scoped lang="scss">
.bap {
  background: var(--surface-1);
  border-radius: var(--radius-lg, 16px);
  box-shadow: var(--shadow-card);
  padding: 28px;
  max-width: 620px;
  width: 100%;
  box-sizing: border-box;

  &__label { font-family: var(--font-body); font-size: 13px; color: var(--fg-2); }
  &__ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__head { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
  &__mark {
    width: 42px; height: 42px; border-radius: 50%; color: #fff; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 17px;
  }
  &__head-text { min-width: 0; }
  &__title { font-family: var(--font-display); font-weight: 700; font-size: 19px; color: var(--fg-1); }
  &__intro { font-size: 12.5px; line-height: 1.55; margin: 0 0 20px; b { color: var(--fg-1); } }

  &__members { display: flex; flex-direction: column; }
  &__member {
    display: flex; align-items: center; gap: 14px; padding: 14px 0;
    border-top: 1px solid var(--border-hairline);
    &--first { border-top: 0; }
  }
  &__member-text { flex: 1; min-width: 0; }
  &__member-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  &__member-name {
    font-weight: 600; font-size: 14.5px; color: var(--fg-1);
    &--pending { color: var(--fg-2); }
  }
  &__you { font-size: 11.5px; }
  &__pending-hint { font-size: 12px; margin-top: 3px; }
  &__last-owner { font-size: 11.5px; text-align: right; max-width: 150px; line-height: 1.4; }
  &__badge {
    font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 999px;
    background: var(--surface-2); color: var(--fg-2);
    &--pending { background: var(--warning-soft, #fef3c7); color: var(--warning-fg, #92400e); }
    &--owner { background: var(--brand-primary-soft, #e0e7ff); color: var(--brand-primary-fg-soft, #3730a3); }
  }
  &__row-gap { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  &__panel {
    margin-top: 18px; padding: 18px; border-radius: var(--radius-lg, 16px);
    background: var(--surface-2); display: flex; flex-direction: column; gap: 14px;
    &--danger { background: var(--expense-soft, #fee2e2); gap: 10px; }
  }
  &__panel-title { font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--fg-1); }
  &__panel--danger &__panel-title { color: var(--expense-fg, #b91c1c); }
  &__panel-desc { margin: 0; font-size: 13px; line-height: 1.55; color: var(--expense-fg, #b91c1c); }
  &__field { display: flex; flex-direction: column; gap: 6px; }
  &__hint { font-size: 12.5px; line-height: 1.5; margin: 0; }

  &__footer {
    display: flex; align-items: center; gap: 10px; margin-top: 22px; padding-top: 18px;
    border-top: 1px solid var(--border-hairline);
    &--note { font-size: 12.5px; }
  }
}
</style>
