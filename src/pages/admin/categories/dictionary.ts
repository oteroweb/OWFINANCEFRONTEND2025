export const dictionary = {
  // Metadatos de la página
  title: 'Categorías',
  description: 'Podrás gestionar las categorías de la aplicación',
  buttonNewLabel: 'Nueva Categoría',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'categories',
  capitalize_api: 'Category',
  capitalize_apis: 'Categories',
  url_apis: 'categories',

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
    { id: 1, col: 6, vmodel: 'active', vmodel_api: 'active', type: 'select', label: 'Activo', select_label: '', placeholder: '', value: '', items: [
      { value: true, label: 'Activo' },
      { value: false, label: 'Inactivo' }
    ] }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Categoría Padre', key: 'parent.name' },
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

  // Creación de categoría
  window_save_title: 'Nueva Categoría',
  button_save_label: 'Guardar Categoría',
  save_description: '¿Estás seguro de crear esta categoría?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'parent_id', vmodel_api: 'parent_id', vmodel_url: 'categories', type: 'select', label: 'Categoría Padre', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 2, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de categoría
  window_update_title: 'Editar Categoría',
  button_update_label: 'Actualizar Categoría',
  update_description: '¿Estás seguro de actualizar esta categoría?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'parent_id', vmodel_api: 'parent_id', vmodel_url: 'categories', type: 'select', label: 'Categoría Padre', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 2, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
