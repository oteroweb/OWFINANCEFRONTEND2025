export const dictionary = {
  // Metadatos de la página
  title: 'Transacciones',
  description: 'Podrás gestionar las transacciones de la aplicación',
  buttonNewLabel: 'Nueva Transacción',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'transaction',
  capitalize_api: 'Transaction',
  capitalize_apis: 'Transactions',
  url_apis: 'transactions',
  // Add parametrization for server-side queries (page, per_page, sort, etc.)
  pagination_params: {
    page: 'page',
    per_page: 'per_page',
    sort_by: 'sort_by',
    descending: 'descending',
    search: 'search'
  },

  // Filtros de búsqueda
  forms_filter: [
    { id: 0, col: 4, vmodel: 'provider_id', vmodel_api: 'provider_id', vmodel_url: 'providers', type: 'select', label: 'Proveedor', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 1, col: 4, vmodel: 'user_id', vmodel_api: 'user_id', vmodel_url: 'users', type: 'select', label: 'Usuario', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 2, col: 4, vmodel: 'account_id', vmodel_api: 'account_id', vmodel_url: 'accounts', type: 'select', label: 'Cuenta', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
  { id: 3, col: 4, vmodel: 'transaction_type_id', vmodel_api: 'transaction_type_id', vmodel_url: 'transaction_types', type: 'select', label: 'Tipo de Transacción', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
  { id: 4, col: 3, vmodel: 'date_from', vmodel_api: 'date_from', type: 'datetime', label: 'Fecha y hora desde', placeholder: 'YYYY-MM-DDTHH:mm', value: '' },
  { id: 5, col: 3, vmodel: 'date_to', vmodel_api: 'date_to', type: 'datetime', label: 'Fecha y hora hasta', placeholder: 'YYYY-MM-DDTHH:mm', value: '' }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Proveedor', key: 'provider.name' },
    { name: 'Usuario', key: 'user.name' },
    { name: 'Cuenta', key: 'account.name' },
    { name: 'Tipo', key: 'transaction_type.name' },
    { name: 'Cantidad', key: 'amount' },
    { name: 'Impuesto', key: 'amount_tax' },
    { name: 'Fecha', key: 'date' },
    { name: 'Hora', key: 'time' },
    { name: 'Activo', key: 'active', type: 'boolean' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación de transacción
  window_save_title: 'Nueva Transacción',
  button_save_label: 'Guardar Transacción',
  save_description: '¿Estás seguro de crear esta transacción?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'amount', vmodel_api: 'amount', type: 'input', label: 'Cantidad', placeholder: '0.00', value: '' },
    { id: 2, vmodel: 'amount_tax', vmodel_api: 'amount_tax', type: 'input', label: 'Impuesto', placeholder: '0.00', value: '' },
    { id: 3, vmodel: 'description', vmodel_api: 'description', type: 'textarea', label: 'Descripción', placeholder: 'Descripción', value: '' },
    { id: 4, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 5, vmodel: 'time', vmodel_api: 'time', type: 'time', label: 'Hora', placeholder: 'HH:mm', value: '' },
    { id: 6, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false },
    { id: 7, vmodel: 'user_id', vmodel_api: 'user_id', vmodel_url: 'users', type: 'select', label: 'Usuario', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 8, vmodel: 'provider_id', vmodel_api: 'provider_id', vmodel_url: 'providers', type: 'select', label: 'Proveedor', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 9, vmodel: 'account_id', vmodel_api: 'account_id', vmodel_url: 'accounts', type: 'select', label: 'Cuenta', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 10, vmodel: 'transaction_type_id', vmodel_api: 'transaction_type_id', vmodel_url: 'transaction_types', type: 'select', label: 'Tipo de Transacción', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 11, vmodel: 'url_file', vmodel_api: 'url_file', type: 'input', label: 'URL del Archivo', placeholder: 'URL del archivo', value: '' }
  ],

  // Edición de transacción
  window_update_title: 'Editar Transacción',
  button_update_label: 'Actualizar Transacción',
  update_description: '¿Estás seguro de actualizar esta transacción?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'amount', vmodel_api: 'amount', type: 'input', label: 'Cantidad', placeholder: '0.00', value: '' },
    { id: 2, vmodel: 'amount_tax', vmodel_api: 'amount_tax', type: 'input', label: 'Impuesto', placeholder: '0.00', value: '' },
    { id: 3, vmodel: 'description', vmodel_api: 'description', type: 'textarea', label: 'Descripción', placeholder: 'Descripción', value: '' },
    { id: 4, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 5, vmodel: 'time', vmodel_api: 'time', type: 'time', label: 'Hora', placeholder: 'HH:mm', value: '' },
    { id: 6, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false },
    { id: 7, vmodel: 'user_id', vmodel_api: 'user_id', vmodel_url: 'users', type: 'select', label: 'Usuario', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 8, vmodel: 'provider_id', vmodel_api: 'provider_id', vmodel_url: 'providers', type: 'select', label: 'Proveedor', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 9, vmodel: 'account_id', vmodel_api: 'account_id', vmodel_url: 'accounts', type: 'select', label: 'Cuenta', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 10, vmodel: 'transaction_type_id', vmodel_api: 'transaction_type_id', vmodel_url: 'transaction_types', type: 'select', label: 'Tipo de Transacción', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 11, vmodel: 'url_file', vmodel_api: 'url_file', type: 'input', label: 'URL del Archivo', placeholder: 'URL del archivo', value: '' }
  ]
} as const;// end dictionary
