export const dictionary = {
  // Metadatos de la página
  title: 'Items',
  description: 'Podrás gestionar los items de la aplicación',
  buttonNewLabel: 'Nuevo Item',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'items',
  capitalize_api: 'Item',
  capitalize_apis: 'Items',
  url_apis: 'items',

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
    { id: 0, col: 12, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Precio', key: 'last_price' },
    { name: 'Impuesto', key: 'tax.name' },
    { name: 'Nombre Personalizado', key: 'custom_name' },
    { name: 'Categoría', key: 'item_category.name' },
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

  // Creación de item
  window_save_title: 'Nuevo Item',
  button_save_label: 'Guardar Item',
  save_description: '¿Estás seguro de crear este item?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'last_price', vmodel_api: 'last_price', type: 'input', label: 'Último Precio', placeholder: '0.00', value: '' },
    { id: 2, vmodel: 'tax_id', vmodel_api: 'tax_id', vmodel_url: 'taxes', type: 'select', label: 'Impuesto', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 3, vmodel: 'custom_name', vmodel_api: 'custom_name', type: 'input', label: 'Nombre Personalizado', placeholder: 'Nombre Personalizado', value: '' },
    { id: 4, vmodel: 'item_category_id', vmodel_api: 'item_category_id', vmodel_url: 'item_categories', type: 'select', label: 'Categoría', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 5, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 6, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de item
  window_update_title: 'Editar Item',
  button_update_label: 'Actualizar Item',
  update_description: '¿Estás seguro de actualizar este item?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
    { id: 1, vmodel: 'last_price', vmodel_api: 'last_price', type: 'input', label: 'Último Precio', placeholder: '0.00', value: '' },
    { id: 2, vmodel: 'tax_id', vmodel_api: 'tax_id', vmodel_url: 'taxes', type: 'select', label: 'Impuesto', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 3, vmodel: 'custom_name', vmodel_api: 'custom_name', type: 'input', label: 'Nombre Personalizado', placeholder: 'Nombre Personalizado', value: '' },
    { id: 4, vmodel: 'item_category_id', vmodel_api: 'item_category_id', vmodel_url: 'item_categories', type: 'select', label: 'Categoría', select_label: 'name', placeholder: '', value: '', items: [], order_by: 'name', order_dir: 'asc' },
    { id: 5, vmodel: 'date', vmodel_api: 'date', type: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD', value: '' },
    { id: 6, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
