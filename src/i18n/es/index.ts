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
