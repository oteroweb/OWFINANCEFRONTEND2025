export const dictionary = {
  // Metadatos de la página
  title: 'Roles',
  description: 'Podrás gestionar los roles de la aplicación',
  buttonNewLabel: 'Nuevo Rol',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'admin/roles',
  capitalize_api: 'Role',
  capitalize_apis: 'Roles',
  url_apis: 'admin/roles',

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
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación
  window_save_title: 'Nuevo Rol',
  button_save_label: 'Guardar Rol',
  save_description: '¿Estás seguro de crear este rol?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'slug', vmodel_api: 'slug', type: 'input', label: 'Slug', placeholder: 'slug', value: '' }
  ],

  // Edición
  window_update_title: 'Editar Rol',
  button_update_label: 'Actualizar Rol',
  update_description: '¿Estás seguro de actualizar este rol?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'slug', vmodel_api: 'slug', type: 'input', label: 'Slug', placeholder: 'slug', value: '' }
  ]
} as const;
