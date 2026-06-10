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
    { id: 0, col: 4, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, col: 4, vmodel: 'email', vmodel_api: 'email', type: 'input', label: 'Email', placeholder: 'Email', value: '' },
    { id: 2, col: 4, vmodel: 'city', vmodel_api: 'city', type: 'input', label: 'Ciudad', placeholder: 'Ciudad', value: '' }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Email', key: 'email' },
    { name: 'Teléfono', key: 'phone' },
    { name: 'Dirección', key: 'address' },
    { name: 'Ciudad', key: 'city' },
    { name: 'Estado', key: 'state' },
    { name: 'Código Postal', key: 'postal_code' },
    { name: 'País', key: 'country' },
    { name: 'Web', key: 'website' },
    { name: 'Logo', key: 'logo' },
    { name: 'Usuario', key: 'user.name' },
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

  // Creación de proveedor
  window_save_title: 'Nuevo Proveedor',
  button_save_label: 'Guardar Proveedor',
  save_description: '¿Estás seguro de crear este proveedor?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'description', vmodel_api: 'description', type: 'textarea', label: 'Descripción', placeholder: 'Descripción', value: '' },
    { id: 2, vmodel: 'address', vmodel_api: 'address', type: 'input', label: 'Dirección', placeholder: 'Dirección', value: '' },
    { id: 3, vmodel: 'city', vmodel_api: 'city', type: 'input', label: 'Ciudad', placeholder: 'Ciudad', value: '' },
    { id: 4, vmodel: 'state', vmodel_api: 'state', type: 'input', label: 'Estado/Provincia', placeholder: 'Estado/Provincia', value: '' },
    { id: 5, vmodel: 'postal_code', vmodel_api: 'postal_code', type: 'input', label: 'Código Postal', placeholder: 'Código Postal', value: '' },
    { id: 6, vmodel: 'country', vmodel_api: 'country', type: 'input', label: 'País', placeholder: 'País', value: '' },
    { id: 7, vmodel: 'phone', vmodel_api: 'phone', type: 'input', label: 'Teléfono', placeholder: 'Teléfono', value: '' },
    { id: 8, vmodel: 'email', vmodel_api: 'email', type: 'input', label: 'Email', placeholder: 'Email', value: '' },
    { id: 9, vmodel: 'website', vmodel_api: 'website', type: 'input', label: 'Sitio Web', placeholder: 'https://...', value: '' },
    { id: 10, vmodel: 'logo', vmodel_api: 'logo', type: 'input', label: 'Logo (URL)', placeholder: 'https://...', value: '' },
    { id: 11, vmodel: 'user_id', vmodel_api: 'user_id', vmodel_url: 'users', type: 'select', label: 'Usuario', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 12, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de proveedor
  window_update_title: 'Editar Proveedor',
  button_update_label: 'Actualizar Proveedor',
  update_description: '¿Estás seguro de actualizar este proveedor?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'description', vmodel_api: 'description', type: 'textarea', label: 'Descripción', placeholder: 'Descripción', value: '' },
    { id: 2, vmodel: 'address', vmodel_api: 'address', type: 'input', label: 'Dirección', placeholder: 'Dirección', value: '' },
    { id: 3, vmodel: 'city', vmodel_api: 'city', type: 'input', label: 'Ciudad', placeholder: 'Ciudad', value: '' },
    { id: 4, vmodel: 'state', vmodel_api: 'state', type: 'input', label: 'Estado/Provincia', placeholder: 'Estado/Provincia', value: '' },
    { id: 5, vmodel: 'postal_code', vmodel_api: 'postal_code', type: 'input', label: 'Código Postal', placeholder: 'Código Postal', value: '' },
    { id: 6, vmodel: 'country', vmodel_api: 'country', type: 'input', label: 'País', placeholder: 'País', value: '' },
    { id: 7, vmodel: 'phone', vmodel_api: 'phone', type: 'input', label: 'Teléfono', placeholder: 'Teléfono', value: '' },
    { id: 8, vmodel: 'email', vmodel_api: 'email', type: 'input', label: 'Email', placeholder: 'Email', value: '' },
    { id: 9, vmodel: 'website', vmodel_api: 'website', type: 'input', label: 'Sitio Web', placeholder: 'https://...', value: '' },
    { id: 10, vmodel: 'logo', vmodel_api: 'logo', type: 'input', label: 'Logo (URL)', placeholder: 'https://...', value: '' },
    { id: 11, vmodel: 'user_id', vmodel_api: 'user_id', vmodel_url: 'users', type: 'select', label: 'Usuario', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 12, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
