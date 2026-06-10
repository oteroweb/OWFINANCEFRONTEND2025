export default {
  // General
  failed: 'Acción fallida',
  success: 'Acción realizada',

  // Auth
  auth: {
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    loginBtn: 'Entrar',
  },

  // Lite shell nav
  nav: {
    home: 'Inicio',
    transactions: 'Movs.',
    jars: 'Cántaros',
    config: 'Ajustes',
    add: 'Agregar',
    advisor: 'Asesor',
    analysis: 'Análisis',
  },

  // Lite Home — DS-20
  home: {
    title: 'Inicio',
    balance: 'Balance',
    income: 'Ingresos',
    expenses: 'Gastos',
    recentTransactions: 'Últimas transacciones',
    noTransactions: 'Aún no hay movimientos este mes.',
    addFirst: 'Agrega tu primer movimiento',
    jars: 'Cántaros',
    noJars: 'Sin cántaros activos.',
  },

  // Lite Transactions — DS-21
  transactions: {
    title: 'Transacciones',
    search: 'Buscar en concepto, cántaro, categoría, monto…',
    filters: 'Filtros',
    clearAll: 'Limpiar todo',
    type: 'Tipo',
    jar: 'Cántaro',
    category: 'Categoría',
    amount: 'Monto',
    allJars: 'Todos los cántaros',
    allCategories: 'Todas las categorías',
    noResults: 'Sin movimientos para este período.',
    loadMore: 'Cargar más',
    income: 'Ingreso',
    expense: 'Egreso',
    transfer: 'Transferencia',
    all: 'Todos',
  },

  // Lite Jars — DS-22
  jars: {
    title: 'Cántaros',
    newJar: 'Nuevo cántaro',
    noJars: 'Sin cántaros activos.',
    budget: 'Presupuesto',
    spent: 'Gastado',
    remaining: 'Restante',
  },

  // Pro Home — DS-30
  pro: {
    home: {
      title: 'Panel Pro',
      kpiIncome: 'Ingresos',
      kpiExpenses: 'Gastos',
      kpiBalance: 'Balance neto',
      kpiSavings: 'Ahorro',
      spendingByCategory: 'Gastos por categoría',
      viewAnalysis: 'Ver análisis',
      jarsTitle: 'Cántaros',
      viewAll: 'Ver todos',
      recentTransactions: 'Transacciones recientes',
      aiAdvisor: 'Asesor IA',
      aiCta: 'Consultar asesor',
    },
  },

  // Config — DS-23 / DS-33
  config: {
    title: 'Configuración',
    layout: 'Experiencia visual',
    layoutDescription: 'Cambia entre modo Lite (móvil, simple) y Pro (analítico, escritorio).',
    layoutLite: 'Lite',
    layoutPro: 'Pro',
    save: 'Guardar cambios',
    cancel: 'Cancelar',
    saved: 'Perfil actualizado',
    reloadNotice: 'La app se reiniciará para aplicar el nuevo modo.',
  },

  // Notifications (Quasar $q.notify)
  notify: {
    // General
    errorLoadingData: 'Error cargando datos',
    errorUnknown: 'Error inesperado',
    savedOk: 'Guardado correctamente',
    deletedOk: 'Eliminado correctamente',
    updatedOk: 'Actualizado correctamente',
    createdOk: 'Creado correctamente',

    // Auth
    loginInvalid: 'Credenciales inválidas. Verifica tu conexión y credenciales.',
    loginError: 'Error al iniciar sesión. Verifica tu conexión y credenciales.',
    unknownRole: 'Rol desconocido. Revisa la consola para detalles.',
    registerFailed: 'No se pudo completar el registro.',
    registerError: 'Error al crear la cuenta. Verifica tu conexión.',
    logoutError: 'No se pudo redirigir al login',

    // Transactions
    txDeleted: 'Transacción eliminada',
    txDeleteError: 'Error eliminando transacción',
    txDeleteBulk: '{count} transacciones eliminadas',
    txDeleteBulkPartial: 'No se pudo eliminar ninguna transacción',
    txNoneSelected: 'No hay transacciones seleccionadas',
    validBalance: 'Ingresa un saldo válido',
    balanceAdjusted: 'Saldo ajustado',
    balanceAdjustError: 'Error ajustando saldo',
    balanceRecalculated: 'Saldo recalculado',
    balanceRecalcError: 'Error recalculando saldo',

    // Transaction form
    conceptRequired: 'Concepto es requerido',
    selectOriginDest: 'Selecciona cuenta origen y destino',
    positiveAmount: 'El importe debe ser positivo',
    enterRate: 'Ingresa la tasa de cambio',
    enterRateOriginDest: 'Ingresa la tasa Origen→Destino',
    selectAccount: 'Selecciona una cuenta',
    addValidPayment: 'Agrega al menos un pago válido.',
    differentPaymentAccounts: 'Cada pago debe usar una cuenta diferente.',
    invalidPaymentRow: 'Pago #{n}: fila inválida.',
    paymentAccountAmountRequired: 'Pago #{n}: cuenta y monto son requeridos.',
    paymentExceedsAvailable: 'Pago #{n}: excede el disponible en la cuenta.',
    paymentSumMismatch: 'La suma de pagos no coincide con el monto.',
    subtotalMismatch: 'El subtotal no coincide con el monto.',
    addValidLine: 'Agrega al menos una línea válida',
    selectCurrencyAndType: 'Selecciona moneda y tipo',

    // Accounts
    accountCreated: 'Cuenta creada',
    accountCreateError: 'Error al crear cuenta',
    defaultCurrencyUpdated: 'Moneda por defecto actualizada',

    // Providers
    providerCreated: 'Proveedor creado',
    fieldsRequired: 'Completa los campos requeridos',

    // Taxes
    taxLoadError: 'Error cargando impuestos',

    // Categories
    categoryLoadError: 'Error cargando categorías de ítems',
    txCategoryLoadError: 'Error cargando categorías de transacción',

    // Account types / currencies
    accountTypeError: 'Error cargando tipos de cuenta',
    currencyLoadError: 'Error cargando monedas',

    // Jars
    jarDeleted: 'Cántaro eliminado',
    jarSaved: 'Cántaros guardados correctamente',
    jarSaveError: 'Error guardando cántaros',
    templateLoadError: 'No se pudieron cargar plantillas',
    templateNoJars: 'La plantilla seleccionada no define jarras',
    templateApplied: 'Plantilla "{name}" aplicada',
    categoryLoadErrorUser: 'No se pudieron cargar tus categorías',
    leverageNotConfigured: 'Configura "Apalancamiento desde" para este cántaro.',
    leverageSameJar: 'El cántaro origen no puede ser el mismo.',
    leverageAlreadyApplied: 'El apalancamiento ya fue aplicado en este periodo.',
    leverageNoChange: 'No se pudo apalancar (sin cambios).',
    leverageApplied: 'Apalancamiento aplicado correctamente',
    leverageError: 'Error al aplicar apalancamiento',
    validAmount: 'Ingresa un monto válido',
    usageRegistered: 'Uso registrado exitosamente',
    usageError: 'Error al registrar uso',
    invalidElement: 'Elemento no válido',
    totalMustBe100: 'El total debe sumar 100% antes de guardar',
    userNotAuth: 'Usuario no autenticado',

    // Rates
    rateUpdated: 'Tasa {code} actualizada a {rate}',
    rateUpdateError: 'Error actualizando tasa',

    // CRUD
    invalidId: 'ID no válido',
    recordDeleted: 'Registro eliminado',
    deleteError: 'Error al eliminar',
    missingFields: 'Faltan: {fields}',
  },

  // Transactions form — DS-32 billetera implícita
  form: {
    account: 'Cuenta',
    accountOrigin: 'Cuenta origen',
    accountDestination: 'Cuenta destino',
    category: 'Categoría',
    concept: 'Concepto',
    amount: 'Monto',
    date: 'Fecha',
    provider: 'Proveedor',
    save: 'Guardar',
    cancel: 'Cancelar',
  },
};
