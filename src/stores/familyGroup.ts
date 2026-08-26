import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { OwfPermissionId } from 'src/utils/familyPermissions';

/**
 * OWF-369 — Fase 1 de "Grupo Familiar y Contabilidad Empresarial".
 * Store de grupo familiar + cuentas compartidas. Wrappea los 8 endpoints
 * ya desplegados en backend (ver FamilyGroupController + AccountController::share/unshare/sharedWithMe).
 */

export interface FamilyGroupMemberUser {
  id: number;
  name: string;
  email: string;
}

export interface FamilyGroupMember {
  id: number;
  family_group_id: number;
  user_id: number;
  role: 'admin' | 'member';
  status: 'invited' | 'active';
  invited_by_user_id: number | null;
  user?: FamilyGroupMemberUser | null;
}

export interface FamilyGroup {
  id: number;
  name: string;
  owner_user_id: number;
  members: FamilyGroupMember[];
}

export interface SharedAccountEntry {
  id: number;
  name: string;
  balance: number;
  currency?: { id: number; code?: string; symbol?: string } | null;
  permission: OwfPermissionId | null;
  owner: { id: number; name: string } | null;
}

export const useFamilyGroupStore = defineStore('familyGroup', {
  state: () => ({
    groups: [] as FamilyGroup[],
    sharedWithMe: [] as SharedAccountEntry[],
    loadingGroups: false,
    loadingShared: false,
  }),
  actions: {
    async fetchGroups() {
      this.loadingGroups = true;
      try {
        const res = await api.get('/family-groups');
        const raw = res.data?.data ?? [];
        this.groups = Array.isArray(raw) ? (raw as FamilyGroup[]) : [];
        return this.groups;
      } finally {
        this.loadingGroups = false;
      }
    },

    async createGroup(name: string) {
      const res = await api.post('/family-groups', { name });
      const group = res.data?.data as FamilyGroup;
      if (group?.id) this.groups.push(group);
      return group;
    },

    async inviteToGroup(groupId: number, email: string) {
      const res = await api.post(`/family-groups/${groupId}/invite`, { email });
      await this.fetchGroups();
      return res.data?.data;
    },

    async acceptInvite(groupId: number) {
      const res = await api.post(`/family-groups/${groupId}/accept`);
      await this.fetchGroups();
      return res.data?.data;
    },

    async declineInvite(groupId: number) {
      await api.post(`/family-groups/${groupId}/decline`);
      await this.fetchGroups();
    },

    async removeMember(groupId: number, userId: number) {
      await api.delete(`/family-groups/${groupId}/members/${userId}`);
      await this.fetchGroups();
    },

    async leaveGroup(groupId: number, selfUserId: number) {
      await this.removeMember(groupId, selfUserId);
    },

    async fetchSharedWithMe() {
      this.loadingShared = true;
      try {
        const res = await api.get('/accounts/shared-with-me');
        const raw = res.data?.data ?? [];
        this.sharedWithMe = Array.isArray(raw) ? (raw as SharedAccountEntry[]) : [];
        return this.sharedWithMe;
      } finally {
        this.loadingShared = false;
      }
    },

    async shareAccount(accountId: number, userId: number, permission: OwfPermissionId) {
      const res = await api.post(`/accounts/${accountId}/share`, { user_id: userId, permission });
      return res.data?.data;
    },

    async unshareAccount(accountId: number, userId: number) {
      await api.delete(`/accounts/${accountId}/share/${userId}`);
    },
  },
});
