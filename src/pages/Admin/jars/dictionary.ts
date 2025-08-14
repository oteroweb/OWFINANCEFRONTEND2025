export const dictionary = {
  // Metadatos de la página
  title: 'Jarras',
  description: 'Podrás gestionar las jarras de la aplicación',
  buttonNewLabel: 'Nueva Jarra',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'jars',
  capitalize_api: 'Jar',
  capitalize_apis: 'Jars',
  url_apis: 'jars',

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
    { id: 1, col: 6, vmodel: 'type', vmodel_api: 'type', type: 'input', label: 'Tipo', placeholder: 'Tipo', value: '' }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Porcentaje', key: 'percent' },
    { name: 'Tipo', key: 'type' },
    { name: 'Fecha', key: 'date' },
    { name: 'Activo', key: 'active', type: 'boolean' },
    { name: 'Is Active', key: 'is_active', type: 'boolean' },
    { name: 'Eliminado', key: 'deleted_at' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación de jarra
  window_save_title: 'Nueva Jarra',
  button_save_label: 'Guardar Jarra',
  save_description: '¿Estás seguro de crear esta jarra?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'percent', vmodel_api: 'percent', type: 'input', label: 'Porcentaje', placeholder: '0.00', value: '' },
    { id: 2, vmodel: 'type', vmodel_api: 'type', type: 'input', label: 'Tipo', placeholder: 'Tipo', value: '' },
    { id: 3, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 4, vmodel: 'is_active', vmodel_api: 'is_active', type: 'checkbox', label: 'Is Active', value: false },
    { id: 5, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de jarra
  window_update_title: 'Editar Jarra',
  button_update_label: 'Actualizar Jarra',
  update_description: '¿Estás seguro de actualizar esta jarra?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'percent', vmodel_api: 'percent', type: 'input', label: 'Porcentaje', placeholder: '0.00', value: '' },
    { id: 2, vmodel: 'type', vmodel_api: 'type', type: 'input', label: 'Tipo', placeholder: 'Tipo', value: '' },
    { id: 3, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 4, vmodel: 'is_active', vmodel_api: 'is_active', type: 'checkbox', label: 'Is Active', value: false },
    { id: 5, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
