/* global React */
/* ─── Análisis data — June 2026, mirrors the live expense screen ──────────
 * Spend & budget per cántaro, KPIs, drill-down groups and insights for the
 * "Navegador financiero" route (Lite + Pro). Chart colors are explicit hues
 * (not theme tokens) so the donut keeps its hierarchy in light & dark. */

const AN_JARS = [
  { id:'needs',  name:'Necesidades básicas',       spent:45.40, budget:89.00, color:'#1E3A8A' },
  { id:'fun',    name:'Ocio / Diversión',          spent:37.48, budget:45.00, color:'#F59E0B' },
  { id:'give',   name:'Donaciones',                spent:26.17, budget:20.00, color:'#8B5CF6' },
  { id:'home',   name:'Hogar cómodo',              spent:24.26, budget:40.00, color:'#10B981' },
  { id:'social', name:'Sociales',                  spent:11.32, budget:18.00, color:'#0EA5E9' },
  { id:'health', name:'Salud',                     spent:9.92,  budget:30.00, color:'#EF4444' },
  { id:'car',    name:'Coche / Auto y transporte', spent:7.71,  budget:25.00, color:'#64748B' },
];
const AN_TOTAL  = AN_JARS.reduce((s,j)=>s+j.spent,0);
const AN_BUDGET = AN_JARS.reduce((s,j)=>s+j.budget,0);

const AN_KPIS = [
  { label:'Transacciones visibles', val:'29',          meta:'Periodo: Junio 2026',          color:'var(--fg-1)' },
  { label:'Gastos',                 val:'$162.26',      meta:'Convertido a USD',             color:'var(--expense-fg)' },
  { label:'Ingresos',               val:'$17.79M',      meta:'Incl. 1 movimiento atípico',   color:'var(--income-fg)', flag:true },
  { label:'Balance',                val:'$17.79M',      meta:'Resultado neto filtrado',      color:'var(--income-fg)' },
];

const AN_RANGES = ['Todo','Anual','Semestral','Trimestral','Mensual','Quincenal','Semanal','Diario','Personalizado'];

const AN_DETALLE = [
  { jar:'needs', name:'Necesidades básicas', count:6, total:45.40, subs:[
    { name:'Supermercado', count:3, total:13.81, tx:[
      { nm:'1167,75 carbo saludable vbrocoli', date:'06/04/2026, 10:09 PM', acct:'Banca amiga', cat:'Supermercado', amt:1.56, rate:'tasa 746.84', src:'Banca amiga: -1167.57' },
      { nm:'1506,50 avena', date:'06/02/2026, 11:47 PM', acct:'JL Banesco', cat:'Supermercado', amt:2.07, rate:'tasa 728.22', src:'JL Banesco: -1510.48' },
      { nm:'7.373,86 redvital mercado pago cashea', date:'06/01/2026, 07:25 PM', acct:'JL Banesco', cat:'Supermercado', amt:10.18, rate:'tasa 724.32', src:'JL Banesco: -7373.86' },
    ]},
    { name:'Proteína', count:3, total:31.59, tx:[
      { nm:'Proteina huevos carton', date:'06/02/2026, 11:49 PM', acct:'JL Banesco', cat:'Proteína', amt:2.75, rate:'tasa 728.22', src:'JL Banesco: -2006.00' },
      { nm:'Cashea Forum', date:'06/02/2026, 02:35 PM', acct:'JL Banesco', cat:'Proteína', amt:10.05, rate:'tasa 728.22', src:'JL Banesco: -7315.04' },
      { nm:'pollo milanesa 13,682.02', date:'06/01/2026, 07:31 PM', acct:'JL Banesco', cat:'Proteína', amt:18.79, rate:'tasa 728.22', src:'JL Banesco: -13682.02' },
    ]},
  ]},
  { jar:'fun', name:'Ocio / Diversión', count:5, total:37.48, subs:[
    { name:'Restaurantes', count:3, total:24.10, tx:[
      { nm:'Cena aniversario', date:'06/03/2026, 09:12 PM', acct:'BBVA', cat:'Restaurantes', amt:16.40, rate:'tasa 728.22', src:'BBVA: -11942.81' },
      { nm:'Café con equipo', date:'06/02/2026, 04:20 PM', acct:'Efectivo', cat:'Restaurantes', amt:4.20, rate:'tasa 728.22', src:'Efectivo: -3058.52' },
      { nm:'Heladería', date:'06/01/2026, 06:00 PM', acct:'BBVA', cat:'Restaurantes', amt:3.50, rate:'tasa 724.32', src:'BBVA: -2535.12' },
    ]},
    { name:'Streaming', count:2, total:13.38, tx:[
      { nm:'Netflix', date:'06/02/2026, 12:00 AM', acct:'Visa USD', cat:'Streaming', amt:8.99, rate:'USD desde USD', src:'Visa USD: -8.99' },
      { nm:'Spotify', date:'06/01/2026, 12:00 AM', acct:'Visa USD', cat:'Streaming', amt:4.39, rate:'USD desde USD', src:'Visa USD: -4.39' },
    ]},
  ]},
  { jar:'give', name:'Donaciones', count:2, total:26.17, subs:[
    { name:'Iglesia', count:1, total:20.00, tx:[
      { nm:'Diezmo mensual', date:'06/01/2026, 08:00 AM', acct:'JL Banesco', cat:'Iglesia', amt:20.00, rate:'tasa 724.32', src:'JL Banesco: -14486.40' },
    ]},
    { name:'Causas', count:1, total:6.17, tx:[
      { nm:'Colecta vecinal', date:'06/03/2026, 05:00 PM', acct:'Efectivo', cat:'Causas', amt:6.17, rate:'tasa 728.22', src:'Efectivo: -4493.10' },
    ]},
  ]},
];

const AN_FMT = n => '$' + n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function AN_CONIC(jars, total){
  let acc = 0; const stops = [];
  jars.forEach(j => { const a = acc/total*360; acc += j.spent; const b = acc/total*360; stops.push(`${j.color} ${a}deg ${b}deg`); });
  return `conic-gradient(${stops.join(',')})`;
}

Object.assign(window, { AN_JARS, AN_TOTAL, AN_BUDGET, AN_KPIS, AN_RANGES, AN_DETALLE, AN_FMT, AN_CONIC });
