// Central user area configuration: menu items, labels, and defaults
export type UserMenuLink = {
  title: string;
  icon: string;
  to: string;
};

export const userMenuLinks: readonly UserMenuLink[] = [
  { title: 'Transacciones', icon: 'receipt_long', to: '/user/transactions' },
  { title: 'Cuentas', icon: 'account_balance_wallet', to: '/user/accounts' },
  { title: 'Categorías', icon: 'category', to: '/user/categories' },
  { title: 'Impuestos', icon: 'percent', to: '/user/taxes' },
];

export const defaultAvatarUrl = 'https://cdn.quasar.dev/img/boy-avatar.png';
