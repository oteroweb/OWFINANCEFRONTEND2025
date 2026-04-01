// Central user area configuration: menu items, labels, and defaults
export type UserMenuLink = {
  title: string;
  icon: string;
  to: string;
};

export const userMenuLinks: readonly UserMenuLink[] = [
  { title: 'Inicio', icon: 'dashboard', to: '/app/home' },
  { title: 'Transacciones', icon: 'receipt_long', to: '/app/transactions' },
  { title: 'Cántaros', icon: 'water_drop', to: '/app/jars' },
  { title: 'Configuración', icon: 'settings', to: '/app/config' },
];

export const defaultAvatarUrl = 'https://cdn.quasar.dev/img/boy-avatar.png';
