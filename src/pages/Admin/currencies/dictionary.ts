export const dictionary = {
  // Metadatos de la página
  title: 'Monedas',
  description: 'Podrás gestionar las monedas de la aplicación',
  buttonNewLabel: 'Nueva Moneda',
  finderLabel: 'Buscar Nombre',

  // Rutas de la API
  url_api: 'currencies',
  capitalize_api: 'Currency',
  capitalize_apis: 'Currencies',
  url_apis: 'currencies',

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
    { id: 1, col: 4, vmodel: 'symbol', vmodel_api: 'symbol', type: 'input', label: 'Símbolo', placeholder: 'Símbolo', value: '' },
    { id: 2, col: 4, vmodel: 'code', vmodel_api: 'code', type: 'input', label: 'Código', placeholder: 'Código', value: '' }
  ],

  // Columnas de la tabla
  columns: [
    { name: 'ID', key: 'id' },
    { name: 'Nombre', key: 'name' },
    { name: 'Símbolo', key: 'symbol' },
    { name: 'Código', key: 'code' },
    { name: 'Alineación', key: 'align' },
    { name: 'Activo', key: 'active', type: 'boolean' },
    { name: 'Acciones', key: 'actions' }
  ],

  // Botones de acción
  buttons: [
    { icon: 'edit', type_button: 'btn-info', tooltip: 'Editar', type_action: 'go_method', action: 'edit' },
    { icon: 'delete', type_button: 'btn-negative', tooltip: 'Eliminar', type_action: 'go_method', action: 'remove' }
  ],

  // Creación de moneda
  window_save_title: 'Nueva Moneda',
  button_save_label: 'Guardar Moneda',
  save_description: '¿Estás seguro de crear esta moneda?',
  forms_save: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
  { id: 1, vmodel: 'symbol', vmodel_api: 'symbol', type: 'input', label: 'Símbolo', placeholder: 'Símbolo', value: '' },
  { id: 2, vmodel: 'code', vmodel_api: 'code', type: 'input', label: 'Código', placeholder: 'Código', value: '' },
  { id: 3, vmodel: 'align', vmodel_api: 'align', type: 'select', label: 'Alineación', select_label: 'label', placeholder: '', value: '', items: [
        { value: 'left', label: 'Izquierda' },
        { value: 'center', label: 'Centro' },
        { value: 'right', label: 'Derecha' }
      ]
    },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ],

  // Edición de moneda
  window_update_title: 'Editar Moneda',
  button_update_label: 'Actualizar Moneda',
  update_description: '¿Estás seguro de actualizar esta moneda?',
  forms_update: [
    { id: 0, vmodel: 'name', vmodel_api: 'name', type: 'input', label: 'Nombre', placeholder: 'Nombre', value: '' },
  { id: 1, vmodel: 'symbol', vmodel_api: 'symbol', type: 'input', label: 'Símbolo', placeholder: 'Símbolo', value: '' },
  { id: 2, vmodel: 'code', vmodel_api: 'code', type: 'input', label: 'Código', placeholder: 'Código', value: '' },
  { id: 3, vmodel: 'align', vmodel_api: 'align', type: 'select', label: 'Alineación', select_label: 'label', placeholder: '', value: '', items: [
        { value: 'left', label: 'Izquierda' },
        { value: 'center', label: 'Centro' },
        { value: 'right', label: 'Derecha' }
      ]
    },
    { id: 3, vmodel: 'active', vmodel_api: 'active', type: 'checkbox', label: 'Activo', value: false }
  ]
} as const;
