export const dictionary = {
  // Metadatos de la página
  title: 'Impuestos',
  description: 'Podrás gestionar los impuestos de la aplicación',
  buttonNewLabel: 'Nuevo Impuesto',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'taxes',
  capitalize_api: 'Tax',
  capitalize_apis: 'Taxes',
  url_apis: 'taxes',

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
  { name: 'Porcentaje', key: 'percent' },
  { name: 'Fecha', key: 'date' },
  { name: 'Activo', key: 'active', type: 'boolean' },
    { name: 'Eliminado', key: 'deleted_at' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación de impuesto
  window_save_title: 'Nuevo Impuesto',
  button_save_label: 'Guardar Impuesto',
  save_description: '¿Estás seguro de crear este impuesto?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'percent', vmodel_api: 'percent', type: 'input', label: 'Porcentaje', placeholder: '0.00', value: '' },
    { id: 2, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de impuesto
  window_update_title: 'Editar Impuesto',
  button_update_label: 'Actualizar Impuesto',
  update_description: '¿Estás seguro de actualizar este impuesto?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'percent', vmodel_api: 'percent', type: 'input', label: 'Porcentaje', placeholder: '0.00', value: '' },
    { id: 2, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
