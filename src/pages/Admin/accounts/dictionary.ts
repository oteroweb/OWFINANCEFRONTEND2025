export const dictionary = {
  // Metadatos de la página
  title: 'Cuentas',
  description: 'Podrás gestionar las cuentas de la aplicación',
  buttonNewLabel: 'Nueva Cuenta',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'accounts',
  capitalize_api: 'Account',
  capitalize_apis: 'Accounts',
  url_apis: 'accounts',

  // Parámetros de paginación
  pagination_params: {
    page: 'page',
    per_page: 'per_page',
    sort_by: 'sort_by',
    descending: 'descending',
    search: 'search'
  },

  // Filtros de búsqueda
  forms_filter: [
  { id: 0, col: 4, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
  { id: 1, col: 4, vmodel: 'currency_id', vmodel_api: 'currency_id', vmodel_url: 'currencies', type: 'select', label: 'Moneda', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
  { id: 2, col: 4, vmodel: 'account_type_id', vmodel_api: 'account_type_id', vmodel_url: 'account_types', type: 'select', label: 'Tipo de Cuenta', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
  { id: 3, col: 4, vmodel: 'user_id', vmodel_api: 'user_id', vmodel_url: 'users', type: 'select', label: 'Usuario', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
  { id: 4, col: 4, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Moneda', key: 'currency.name' },
    { name: 'Inicial', key: 'initial' },
    { name: 'Balance', key: 'balance' },
    { name: 'Tipo', key: 'account_type.name' },
    { name: 'Usuarios', key: 'users', manyToMany: true, pivotKey: 'pivot', labelKey: 'name' },
    { name: 'Activo', key: 'active', type: 'boolean' },
    { name: 'Eliminado', key: 'deleted_at' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación de cuenta
  window_save_title: 'Nueva Cuenta',
  button_save_label: 'Guardar Cuenta',
  save_description: '¿Estás seguro de crear esta cuenta?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'currency_id', vmodel_api: 'currency_id', vmodel_url: 'currencies', type: 'select', label: 'Moneda', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 2, vmodel: 'initial', vmodel_api: 'initial', type: 'number', label: 'Inicial', placeholder: '0.00', value: '' },
    { id: 3, vmodel: 'account_type_id', vmodel_api: 'account_type_id', vmodel_url: 'account_types', type: 'select', label: 'Tipo de Cuenta', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 4, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de cuenta
  window_update_title: 'Editar Cuenta',
  button_update_label: 'Actualizar Cuenta',
  update_description: '¿Estás seguro de actualizar esta cuenta?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'currency_id', vmodel_api: 'currency_id', vmodel_url: 'currencies', type: 'select', label: 'Moneda', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 2, vmodel: 'initial', vmodel_api: 'initial', type: 'number', label: 'Inicial', placeholder: '0.00', value: '' },
    { id: 3, vmodel: 'account_type_id', vmodel_api: 'account_type_id', vmodel_url: 'account_types', type: 'select', label: 'Tipo de Cuenta', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 4, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
