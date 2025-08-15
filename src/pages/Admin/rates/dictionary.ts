export const dictionary = {
  // Metadatos de la página
  title: 'Tasas',
  description: 'Podrás gestionar las tasas de la aplicación',
  buttonNewLabel: 'Nueva Tasa',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'rates',
  capitalize_api: 'Rate',
  capitalize_apis: 'Rates',
  url_apis: 'rates',

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
  { name: 'Valor', key: 'value' },
    { name: 'Fecha', key: 'date' },
    { name: 'Activo', key: 'active', type: 'boolean' },
  { name: 'Creado', key: 'created_at' },
  { name: 'Actualizado', key: 'updated_at' },
    { name: 'Eliminado', key: 'deleted_at' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación de tasa
  window_save_title: 'Nueva Tasa',
  button_save_label: 'Guardar Tasa',
  save_description: '¿Estás seguro de crear esta tasa?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
  { id: 1, vmodel: 'value', vmodel_api: 'value', type: 'input', label: 'Valor', placeholder: '0.00', value: '' },
  { id: 2, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
  { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de tasa
  window_update_title: 'Editar Tasa',
  button_update_label: 'Actualizar Tasa',
  update_description: '¿Estás seguro de actualizar esta tasa?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
  { id: 1, vmodel: 'value', vmodel_api: 'value', type: 'input', label: 'Valor', placeholder: '0.00', value: '' },
  { id: 2, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
  { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
