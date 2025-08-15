export const dictionary = {
  // Metadatos de la página
  title: 'Proveedores',
  description: 'Podrás gestionar los proveedores de la aplicación',
  buttonNewLabel: 'Nuevo Proveedor',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'providers',
  capitalize_api: 'Provider',
  capitalize_apis: 'Providers',
  url_apis: 'providers',

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
    { id: 1, col: 6, vmodel: 'address', vmodel_api: 'address', type: 'input', label: 'Dirección', placeholder: 'Dirección', value: '' }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Dirección', key: 'address' },
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

  // Creación de proveedor
  window_save_title: 'Nuevo Proveedor',
  button_save_label: 'Guardar Proveedor',
  save_description: '¿Estás seguro de crear este proveedor?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'address', vmodel_api: 'address', type: 'input', label: 'Dirección', placeholder: 'Dirección', value: '' },
    { id: 2, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de proveedor
  window_update_title: 'Editar Proveedor',
  button_update_label: 'Actualizar Proveedor',
  update_description: '¿Estás seguro de actualizar este proveedor?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'address', vmodel_api: 'address', type: 'input', label: 'Dirección', placeholder: 'Dirección', value: '' },
    { id: 2, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
