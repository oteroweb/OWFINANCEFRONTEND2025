/* ─── i18n — bilingual (ES / EN) ────────────────────────────────────────
 * Spanish is the source language and the KEY. t('Disponible') returns the
 * Spanish string as-is when lang==='es', or its English translation.
 * Missing keys fall back to the key itself (so untranslated = Spanish).
 *
 * window.I18N.lang   — current language ('es' | 'en')
 * window.t(key)      — translate
 * window.setLang(l)  — set language + re-render the app
 * ──────────────────────────────────────────────────────────────────────── */
/* global window */

const I18N_EN = {
  /* ── Toolbar ── */
  'Modo': 'Mode', 'Tema': 'Theme', 'Vista': 'View', 'Idioma': 'Language',
  'Light': 'Light', 'Dark': 'Dark', 'Desktop': 'Desktop', 'Móvil': 'Mobile',

  /* ── Header / greeting ── */
  'Buenas tardes': 'Good afternoon', 'Buenas tardes,': 'Good afternoon,', 'Buenos días': 'Good morning', 'Buenas noches': 'Good evening',

  /* ── Hero ── */
  'Disponible': 'Available', 'Agregar': 'Add',
  'Ingresos · este mes': 'Income · this month',
  'Gastos · este mes': 'Spent · this month',
  'Neto · este mes': 'Net · this month',
  'Al': 'As of', 'hoy, 2:42 PM': 'today, 2:42 PM', 'vs. mes ant.': 'vs. last mo.',

  /* ── Nav (Lite + Pro) ── */
  'Inicio': 'Home', 'Movs': 'Activity', 'Cántaros': 'Jars', 'Sueños': 'Dreams',
  'Deudas': 'Debts', 'Ajustes': 'Settings', 'Transacciones': 'Transactions',
  'Configuración': 'Settings',

  /* ── Section headers / common ── */
  'Ver todos': 'See all', 'Ver todas': 'See all', 'Ver análisis': 'View analysis',
  'Movimientos recientes': 'Recent activity', 'Gastos por categoría': 'Spending by category',
  'Sin transacciones todavía.': 'No transactions yet.',
  'Cuentas': 'Accounts',

  /* ── Jars ── */
  'Necesidades básicas': 'Basic needs', 'Diversión': 'Fun', 'Ahorro': 'Savings',
  'Educación': 'Education', 'Reservas': 'Reserves',
  '55% del ingreso': '55% of income', '10% del ingreso': '10% of income',
  'de': 'of', 'Meta:': 'Goal:', 'disp.': 'avail.',
  '68% usado': '68% used', '73% usado': '73% used', '42% usado': '42% used',
  'Meta 59%': 'Goal 59%', 'Acumula': 'Accruing',
  'Tu dinero, repartido': 'Your money, allocated',
  'Total en cántaros · USD': 'Total in jars · USD',
  'cántaros activos · 1 requiere atención': 'active jars · 1 needs attention',
  'Nuevo cántaro': 'New jar',

  /* ── Pro KPIs ── */
  'Ingresos · mes': 'Income · mo', 'Gastos · mes': 'Spent · mo',
  'Tasa de ahorro': 'Savings rate', 'Meta: 40%': 'Goal: 40%',

  /* ── Spending breakdown ── */
  'Vivienda': 'Housing', 'Supermercado': 'Groceries', 'Transporte': 'Transport',
  'Entretenimiento': 'Entertainment', 'Salud': 'Health', 'Servicios': 'Utilities',
  'Restaurantes': 'Dining', 'Ingresos': 'Income', 'Otros': 'Other',

  /* ── Accounts panel ── */
  'Patrimonio neto · USD': 'Net worth · USD', 'Total adeudado · USD': 'Total owed · USD',
  'Agregar cuenta': 'Add account', 'Registrar deuda': 'Add debt',
  'Cuenta corriente': 'Checking', 'Cuenta ahorros': 'Savings', 'Caja': 'Cash',
  'Vence:': 'Due:', 'cuota': 'installment', 'Próx. pago:': 'Next payment:',
  'Pendiente': 'Pending', 'Vence pronto': 'Due soon', 'Vencido': 'Overdue', 'Activo': 'Active',

  /* ── Debts ── */
  'Deudas y planes de pago': 'Debts & payment plans', 'Total pendiente': 'Total outstanding',
  'Próximas cuotas · 30d': 'Upcoming · 30d', 'Estado': 'Status', 'Todo al día': 'All on track',
  'Pagar cuota': 'Pay installment', 'Nuevo plan': 'New plan',
  'Al día': 'On track', 'Próximo': 'Upcoming', 'Atrasado': 'Late', 'Pagado': 'Paid',
  'Cuota': 'Installment', 'Próxima:': 'Next:', 'Planes Cashea': 'Cashea plans',
  '0% interés': '0% interest', 'Otras deudas': 'Other debts', 'Tarjeta': 'Card',
  'Préstamo': 'Loan', 'Personal': 'Personal',

  /* ── Dreams ── */
  'Total ahorrado en sueños': 'Total saved in dreams', 'Meta combinada': 'Combined goal',
  'Progreso global': 'Overall progress', 'Aportar': 'Contribute', 'Nuevo sueño': 'New dream',
  'Faltan': 'Remaining',

  /* ── Transactions route ── */
  'Mayo': 'May', 'Todas': 'All', 'Gastos': 'Expenses',
  'Buscar concepto, monto…': 'Search description, amount…',

  /* ── Month navigator + account filter ── */
  'Hoy': 'Today',
  'Enero': 'January', 'Febrero': 'February', 'Marzo': 'March', 'Abril': 'April',
  'Junio': 'June', 'Julio': 'July', 'Agosto': 'August', 'Septiembre': 'September',
  'Octubre': 'October', 'Noviembre': 'November', 'Diciembre': 'December',
  'Ene': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Abr': 'Apr', 'May': 'May', 'Jun': 'Jun',
  'Jul': 'Jul', 'Ago': 'Aug', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dic': 'Dec',
  'Cuentas': 'Accounts', 'cuenta': 'account', 'cuentas': 'accounts',
  'Todas las cuentas': 'All accounts', 'Filtrar por cuenta': 'Filter by account',
  'Buscar cuenta…': 'Search account…', 'Solo USD': 'USD only', 'Solo VES': 'VES only',
  'Con deuda': 'With debt', 'combinado': 'combined', 'Listo': 'Done',
  'Ajustar saldo': 'Adjust balance', 'Recalcular saldo': 'Recalculate balance',
  'Recalculando…': 'Recalculating…', 'ajustado': 'adjusted',
  'Seleccionar varias': 'Select multiple', 'Seleccionar todo': 'Select all', 'seleccionadas': 'selected',
  'Recalcular': 'Recalculate', 'cuentas actualizadas': 'accounts updated',
  'Saldo ajustado': 'Balance adjusted', 'Saldo actualizado': 'Balance updated',
  'Selecciona una sola cuenta para ajustar': 'Select a single account to adjust',
  'Guardar': 'Save', 'Cancelar': 'Cancel', 'Opciones de cuenta': 'Account options',
  'Mis cuentas': 'My accounts', 'Venezolanas': 'Venezuelan', 'Tarjetas y deudas': 'Cards & debts',

  /* ── Config ── */
  'Preferencias': 'Preferences',
  'Cuenta': 'Account', 'Perfil': 'Profile', 'Cuentas vinculadas': 'Linked accounts',
  'Exportar datos': 'Export data', 'Visualización': 'Display',
  'Ocultar saldos por defecto': 'Hide balances by default', 'Divisa predeterminada': 'Default currency',
  'Pantalla de inicio': 'Home screen', 'Notificaciones': 'Notifications',
  'Resumen semanal': 'Weekly digest', 'Alertas de dinero ocioso': 'Idle money alerts',
  'Alerta de sobrepresupuesto': 'Over-budget alert', 'Cerrar sesión': 'Sign out',
  'Tasas de cambio': 'Exchange rates',
  'Oficial (BCV)': 'Official (BCV)', 'Tasa actual': 'Current rate', 'aplica': 'applied',
  'por encima del BCV': 'above BCV', 'por debajo del BCV': 'below BCV',
  'Ver historial': 'View history', 'Historial de tasas': 'Rate history',
  'Fecha': 'Date', 'BCV': 'BCV', 'Actual': 'Current',
  '· BCV oficial + tasa del momento · se aplican en todo Pro': '· Official BCV + spot rate · applied across Pro',
  '· Ingresa manualmente · se aplican en todo Pro': '· Enter manually · applied across Pro',
  '3 tarjetas · 2 bancos': '3 cards · 2 banks', 'Inicio': 'Home',
  'Tu tasa de ahorro es 42%. Hay $540 inactivos que podrías mover al jar de emergencia.': 'Your savings rate is 42%. There is $540 idle you could move to the emergency jar.',

  /* ── App preferences (Settings) ── */
  'Aplicación': 'Application', 'Modo de la app': 'App mode',
  'Lite · simple y enfocado': 'Lite · simple and focused',
  'Pro · panel completo multi-cuenta': 'Pro · full multi-account dashboard',
  'Interfaz y formatos': 'Interface and formats',
  'Vista previa': 'Preview', 'Tamaño de pantalla': 'Screen size',
  'PC': 'PC', 'Tablet': 'Tablet', 'Celular': 'Phone',

  /* ── Notifications ── */
  'sin leer': 'unread', 'Marcar todas': 'Mark all read',
  'Ver todas las notificaciones': 'See all notifications',
  'Cuota Cashea por vencer': 'Cashea installment due soon',
  'iPhone 15 · $148.50 vence en 2 días (28 mar).': 'iPhone 15 · $148.50 due in 2 days (Mar 28).',
  'Dinero ocioso detectado': 'Idle money detected',
  'Tienes $1,240 sin asignar a ningún cántaro hace 9 días.': 'You have $1,240 unassigned to any jar for 9 days.',
  '¡Meta de sueño más cerca!': 'Dream goal getting closer!',
  'Vacaciones Margarita llegó al 72% de tu objetivo.': 'Margarita Vacation reached 72% of your goal.',
  'Cántaro Diversión al 90%': 'Fun jar at 90%',
  'Has usado $270 de $300 este mes. Cuida el límite.': "You've used $270 of $300 this month. Mind the limit.",
  'Pago recibido': 'Payment received',
  'Banesco · +$820.00 acreditado a Cuenta principal.': 'Banesco · +$820.00 credited to Main account.',
  'Tu resumen semanal está listo': 'Your weekly digest is ready',
  'Gastaste 8% menos que la semana pasada. Buen ritmo.': 'You spent 8% less than last week. Good pace.',
  'Hace 2 h': '2 h ago', 'Hace 5 h': '5 h ago', 'Ayer': 'Yesterday',
  'Hace 2 d': '2 d ago', 'Hace 3 d': '3 d ago', 'Hace 4 d': '4 d ago',

  /* ── Quick modal ── */
  'Acción rápida': 'Quick action', '¿Qué quieres registrar?': 'What do you want to record?',
  'Tipo de movimiento': 'Entry type', 'Paso 1 de 2': 'Step 1 of 2', 'Paso 2 de 2': 'Step 2 of 2',
  '¿Cómo lo querés ingresar?': 'How do you want to enter it?',
  'O registrá un movimiento especial': 'Or record a special entry',
  'Gasto': 'Expense', 'Ingreso': 'Income', 'Transferir': 'Transfer',
  'Pago de deuda': 'Debt payment', 'Aporte a sueño': 'Dream contribution', 'Aporte a jar': 'Jar contribution',
  'Cuota Cashea, tarjeta, préstamo o personal.': 'Cashea installment, card, loan or personal.',
  'Sumá al ahorro de una meta de largo plazo.': 'Add to a long-term goal.',
  'Movimiento hacia un jar de corto plazo.': 'Move into a short-term jar.',
  'Escribir': 'Write', 'Nota de voz': 'Voice note', 'Foto de factura': 'Invoice photo', 'Auto IA': 'Auto AI',
  'Completá monto, comercio y categoría paso a paso.': 'Fill amount, merchant and category step by step.',
  'Dictá la transacción — la IA la transcribe y categoriza.': 'Dictate it — AI transcribes and categorizes.',
  'Sacá la foto y se extraen todos los datos del recibo.': 'Snap it and all receipt data is extracted.',
  'Pegá un mensaje o describí en lenguaje natural.': 'Paste a message or describe in natural language.',
  'Transcripción IA': 'AI transcription', 'Beta': 'Beta',
  '¿Tenés una duda? Hablá con el Asesor IA': 'Got a question? Talk to the AI Advisor',

  /* ── Smart modal ── */
  'Nuevo movimiento': 'New entry', 'Carga masiva': 'Bulk import',
  '¿Qué pasó con tu dinero?': 'What happened with your money?',
  'Voz': 'Voice', 'Foto': 'Photo',
  'Pre-rellenado por IA desde': 'Pre-filled by AI from', 'revisa y confirma': 'review and confirm',
  'Duplicar': 'Duplicate', 'copia': 'copy',
  'Vas a registrar': "You're about to record", 'Guardando…': 'Saving…', 'Registrado': 'Recorded',
  'Confirmar y registrar': 'Confirm and record', 'Deshacer': 'Undo', 'Movimiento registrado': 'Transaction recorded',
  'Escuchando…': 'Listening…', 'Toca para dictar': 'Tap to dictate',
  'Di monto, comercio y cuenta. La IA transcribe y arma el movimiento.': 'Say amount, merchant and account. AI transcribes and builds the entry.',
  'Sube o arrastra una factura': 'Upload or drag an invoice',
  'OCR extrae monto, comercio, fecha e ítems': 'OCR extracts amount, merchant, date and items',
  'Monto': 'Amount', 'Comercio': 'Merchant', 'Ítems': 'Items', 'Fecha': 'Date',
  "Pega o describe: 'Pagué $730 en VES a 40.5, mercado del mes con Mercantil, categoría supermercado'": "Paste or describe: 'Paid $730 in VES at 40.5, monthly groceries with Mercantil, category groceries'",
  'No pude interpretar el texto. Sé más específico con monto y concepto.': "Couldn't parse the text. Be more specific with amount and description.",
  'Analizar con IA': 'Analyze with AI', 'Analizando…': 'Analyzing…',
  'voz': 'voice', 'foto de factura': 'invoice photo', 'texto': 'text',

  /* ── Transaction form ── */
  'Ajuste': 'Adjustment',
  '¿De qué cántaro sale?': 'Which jar does it come from?', 'Elige un cántaro': 'Pick a jar',
  'Se reparte automáticamente': 'Split automatically',
  'Concepto (opcional)': 'Note (optional)', 'Ej: Mercado del super': 'e.g. Grocery run',
  'Hoy': 'Today', 'Ayer': 'Yesterday', 'Otra fecha…': 'Other date…',
  'Categoría (opcional)': 'Category (optional)', 'Categoría': 'Category', 'Categoría': 'Category',
  'Registrar ingreso': 'Record income', 'Registrar gasto': 'Record expense',
  'Cuenta a ajustar': 'Account to adjust', 'Saldo objetivo': 'Target balance',
  'Saldo actual:': 'Current balance:', 'Se creará un ajuste de': 'An adjustment of',
  'Motivo': 'Reason', 'Ej: Sincronización con banco': 'e.g. Bank sync',
  'Desde (origen)': 'From (source)', 'Hacia (destino)': 'To (destination)',
  'Cruce de moneda ·': 'Currency crossing ·', 'tasa': 'rate', 'Envías': 'You send', 'Llega': 'Arrives',
  'Ej: Traspaso a ahorros': 'e.g. Transfer to savings',
  'Total (suma de ítems)': 'Total (sum of items)', 'Cuenta de origen': 'Source account',
  'Sin categoría': 'No category', 'Repartir por %': 'Split by %', 'Sin cántaro': 'No jar',
  'Cántaro (opcional)': 'Jar (optional)', 'Cántaro': 'Jar', 'Proveedor': 'Provider', 'Sin proveedor': 'No provider',
  'Pago múltiple': 'Multiple payment', 'Varias cuentas': 'Several accounts',
  'Detalle / factura': 'Detail / invoice', 'Ítems + impuestos': 'Items + taxes',
  'Afecta el saldo': 'Affects balance', 'Desactiva para movimientos informativos': 'Turn off for informational entries',
  'Ver': 'Show', 'Ocultar': 'Hide',
  'Cancelar': 'Cancel', 'Registrar transferencia': 'Record transfer', 'Aplicar ajuste': 'Apply adjustment',
  'Pagos': 'Payments', 'Añadir cuenta': 'Add account', 'Ítems de la factura': 'Invoice items',
  'Añadir ítem': 'Add item', 'Sin impuesto': 'No tax',

  /* ── Bulk import ── */
  'Carga masiva (dry-run)': 'Bulk import (dry-run)',
  'Pega filas:': 'Paste rows:',
  '. Verás una vista previa antes de aplicar.': '. You will see a preview before applying.',
  'Procesar (vista previa)': 'Process (preview)',
  'Filas válidas': 'Valid rows', 'Con error': 'With error', 'Neto': 'Net',
  'Concepto': 'Description', 'Cuenta': 'Account', 'Revisar': 'Review', 'Error': 'Error',
  '← Editar filas': '← Edit rows', 'Aplicar': 'Apply', 'transacciones': 'transactions',

  /* ── Route headers ── */
  'Lo que estás construyendo': "What you're building",
  'Total acumulado · USD': 'Total accumulated · USD',
  'sueños activos · meta combinada': 'active dreams · combined goal',
  'del camino': 'of the way',
  'Mantén el control de lo que debes': 'Stay on top of what you owe',
  'Total pendiente · USD': 'Total outstanding · USD',
  'planes activos ·': 'active plans ·', 'en Cashea ·': 'on Cashea ·',
  'todo al día': 'all on track', 'Próximas cuotas (30 días):': 'Upcoming installments (30 days):',

  /* ── Misc data ── */
  'Pendiente': 'Outstanding',
  'pagado': 'paid', 'atrasada': 'overdue', '/mes': '/mo',
  'Cantidad': 'Quantity', 'Impuesto': 'Tax', 'Ítem': 'Item',
  'Banco': 'Bank', 'Efectivo': 'Cash', 'Cashea': 'Cashea',
  'Asesor Financiero IA': 'AI Financial Advisor', 'EN LÍNEA': 'ONLINE',
  'Finance': 'Finance', 'Menú': 'Menu', 'Asesor IA': 'AI Advisor',
  '. Verás una vista previa antes de aplicar.': '. You will see a preview before applying.',
  'Pega filas:': 'Paste rows:', 'fecha, concepto, monto, cuenta, categoría': 'date, description, amount, account, category',
  'No pude conectar. Intenta de nuevo.': "Couldn't connect. Try again.",
};

window.I18N = window.I18N || { lang: 'es' };
window.I18N_EN = I18N_EN;

window.t = function t(key) {
  if (key == null) return key;
  if (window.I18N.lang === 'es') return key;
  return I18N_EN[key] != null ? I18N_EN[key] : key;
};

window.setLang = function setLang(lang) {
  window.I18N.lang = (lang === 'en') ? 'en' : 'es';
  document.documentElement.setAttribute('lang', window.I18N.lang);
  if (typeof window.renderApp === 'function') window.renderApp();
};
