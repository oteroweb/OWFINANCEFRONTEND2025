export const dictionary = {
  // Metadatos de la página
  title: 'Usuarios',
  description: 'Podrás gestionar los usuarios de la aplicación',
  buttonNewLabel: 'Nuevo Usuario',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'users',
  capitalize_api: 'User',
  capitalize_apis: 'Users',
  url_apis: 'users',

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
    { id: 1, col: 4, vmodel: 'email', vmodel_api: 'email', type: 'input', label: 'Email', placeholder: 'Email', value: '' },
    { id: 2, col: 4, vmodel: 'phone', vmodel_api: 'phone', type: 'input', label: 'Teléfono', placeholder: 'Teléfono', value: '' }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Teléfono', key: 'phone' },
    { name: 'Email', key: 'email' },
    { name: 'Balance', key: 'balance' },
    { name: 'Moneda', key: 'currency.name' },
    { name: 'Cliente', key: 'client.name' },
    { name: 'Activo', key: 'active', type: 'boolean' },
    { name: 'Eliminado', key: 'deleted_at' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación de usuario
  window_save_title: 'Nuevo Usuario',
  button_save_label: 'Guardar Usuario',
  save_description: '¿Estás seguro de crear este usuario?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'phone', vmodel_api: 'phone', type: 'input', label: 'Teléfono', placeholder: 'Teléfono', value: '' },
    { id: 2, vmodel: 'email', vmodel_api: 'email', type: 'input', label: 'Email', placeholder: 'Email', value: '' },
    { id: 3, vmodel: 'balance', vmodel_api: 'balance', type: 'input', label: 'Balance', placeholder: '0.00', value: '' },
    { id: 4, vmodel: 'currency_id', vmodel_api: 'currency_id', vmodel_url: 'currencies', type: 'select', label: 'Moneda', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 5, vmodel: 'client_id', vmodel_api: 'client_id', vmodel_url: 'clients', type: 'select', label: 'Cliente', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 6, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de usuario
  window_update_title: 'Editar Usuario',
  button_update_label: 'Actualizar Usuario',
  update_description: '¿Estás seguro de actualizar este usuario?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'phone', vmodel_api: 'phone', type: 'input', label: 'Teléfono', placeholder: 'Teléfono', value: '' },
    { id: 2, vmodel: 'email', vmodel_api: 'email', type: 'input', label: 'Email', placeholder: 'Email', value: '' },
    { id: 3, vmodel: 'balance', vmodel_api: 'balance', type: 'input', label: 'Balance', placeholder: '0.00', value: '' },
    { id: 4, vmodel: 'currency_id', vmodel_api: 'currency_id', vmodel_url: 'currencies', type: 'select', label: 'Moneda', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 5, vmodel: 'client_id', vmodel_api: 'client_id', vmodel_url: 'clients', type: 'select', label: 'Cliente', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 6, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
