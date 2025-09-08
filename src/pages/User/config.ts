// Central user area configuration: menu items, labels, and defaults
export type UserMenuLink = {
  title: string;
  icon: string;
  to: string;
};

export const userMenuLinks: readonly UserMenuLink[] = [
  { title: 'Inicio', icon: 'dashboard', to: '/user/home' },
  { title: 'Transacciones', icon: 'receipt_long', to: '/user/transactions' },
  { title: 'Cántaros', icon: 'water_drop', to: '/user/jars' },
  { title: 'Configuración', icon: 'settings', to: '/user/config' },
];

export const defaultAvatarUrl = 'https://cdn.quasar.dev/img/boy-avatar.png';
