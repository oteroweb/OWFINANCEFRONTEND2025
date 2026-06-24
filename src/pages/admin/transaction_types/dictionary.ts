export const dictionary = {
  // Metadatos de la página
  title: 'Tipos de Transacción',
  description: 'Podrás gestionar los tipos de transacción de la aplicación',
  buttonNewLabel: 'Nuevo Tipo',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'transaction_types',
  capitalize_api: 'TransactionType',
  capitalize_apis: 'TransactionTypes',
  url_apis: 'transaction_types',

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
    { id: 0, col: 6, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Slug', key: 'slug' },
    { name: 'Activo', key: 'active', type: 'boolean' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación
  window_save_title: 'Nuevo Tipo de Transacción',
  button_save_label: 'Guardar Tipo',
  save_description: '¿Estás seguro de crear este tipo de transacción?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'slug', vmodel_api: 'slug', type: 'input', label: 'Slug', placeholder: 'slug', value: '' },
    { id: 2, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición
  window_update_title: 'Editar Tipo de Transacción',
  button_update_label: 'Actualizar Tipo',
  update_description: '¿Estás seguro de actualizar este tipo de transacción?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'slug', vmodel_api: 'slug', type: 'input', label: 'Slug', placeholder: 'slug', value: '' },
    { id: 2, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
