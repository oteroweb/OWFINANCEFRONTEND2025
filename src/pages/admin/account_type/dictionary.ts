export const dictionary = {
  // Metadatos de la página
  title: 'Tipos de Cuenta',
  description: 'Podrás gestionar los tipos de cuenta de la aplicación',
  buttonNewLabel: 'Nuevo Tipo de Cuenta',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'account_types',
  capitalize_api: 'AccountType',
  capitalize_apis: 'AccountTypes',
  url_apis: 'account_types',

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
    { name: 'Icono', key: 'icon' },
    { name: 'Descripción', key: 'description' },
    { name: 'Activo', key: 'active', type: 'boolean' },
    { name: 'Eliminado', key: 'deleted_at' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación de tipo de cuenta
  window_save_title: 'Nuevo Tipo de Cuenta',
  button_save_label: 'Guardar Tipo de Cuenta',
  save_description: '¿Estás seguro de crear este tipo de cuenta?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'icon', vmodel_api: 'icon', type: 'input', label: 'Icono', placeholder: 'Icono', value: '' },
    { id: 2, vmodel: 'description', vmodel_api: 'description', type: 'textarea', label: 'Descripción', placeholder: 'Descripción', value: '' },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de tipo de cuenta
  window_update_title: 'Editar Tipo de Cuenta',
  button_update_label: 'Actualizar Tipo de Cuenta',
  update_description: '¿Estás seguro de actualizar este tipo de cuenta?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'icon', vmodel_api: 'icon', type: 'input', label: 'Icono', placeholder: 'Icono', value: '' },
    { id: 2, vmodel: 'description', vmodel_api: 'description', type: 'textarea', label: 'Descripción', placeholder: 'Descripción', value: '' },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
