// Central user area configuration: menu items, labels, and defaults
export type UserMenuLink = {
  title: string;
  icon: string;
  to: string;
};

export const userMenuLinks: readonly UserMenuLink[] = [
  { title: 'Transacciones', icon: 'receipt_long', to: '/user/transactions' },
  { title: 'Configuración', icon: 'settings', to: '/user/config' },
  { title: 'Cántaros', icon: 'water_drop', to: '/user/jars' },
];

export const defaultAvatarUrl = 'https://cdn.quasar.dev/img/boy-avatar.png';
