export const dictionary = {
  // Metadatos de la página
  title: 'Clientes',
  description: 'Podrás gestionar los clientes de la aplicación',
  buttonNewLabel: 'Nuevo Cliente',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'clients',
  capitalize_api: 'Client',
  capitalize_apis: 'Clients',
  url_apis: 'clients',

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
    { id: 0, col: 6, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, col: 6, vmodel: 'email', vmodel_api: 'email', type: 'input', label: 'Email', placeholder: 'Email', value: '' }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Email', key: 'email' },
    { name: 'Activo', key: 'active', type: 'boolean' },
    { name: 'Eliminado', key: 'deleted_at' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación de cliente
  window_save_title: 'Nuevo Cliente',
  button_save_label: 'Guardar Cliente',
  save_description: '¿Estás seguro de crear este cliente?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'email', vmodel_api: 'email', type: 'input', label: 'Email', placeholder: 'Email', value: '' },
    { id: 2, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de cliente
  window_update_title: 'Editar Cliente',
  button_update_label: 'Actualizar Cliente',
  update_description: '¿Estás seguro de actualizar este cliente?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'email', vmodel_api: 'email', type: 'input', label: 'Email', placeholder: 'Email', value: '' },
    { id: 2, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
