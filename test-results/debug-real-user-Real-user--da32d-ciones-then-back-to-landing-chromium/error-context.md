# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: debug-real-user.spec.ts >> Real user navigation debug >> Click to funciones then back to landing
- Location: e2e/debug-real-user.spec.ts:59:3

# Error details

```
TimeoutError: page.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('a:has-text("OW Finance")')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic: v1.0.22
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "OW Finance — inicio" [ref=e6] [cursor=pointer]:
          - /url: /app/
          - img [ref=e7]:
            - generic [ref=e8]: OW
            - generic [ref=e9]: Finance
        - navigation [ref=e10]:
          - link "Cómo funciona" [ref=e11] [cursor=pointer]:
            - /url: /#como-funciona
          - link "Funciones" [active] [ref=e12] [cursor=pointer]:
            - /url: /app/funciones
          - link "Lite & Pro" [ref=e13] [cursor=pointer]:
            - /url: /#modos
          - link "Planes" [ref=e14] [cursor=pointer]:
            - /url: /app/planes
        - generic [ref=e15]:
          - button "Cambiar a oscuro" [ref=e16] [cursor=pointer]:
            - generic [ref=e17]: dark_mode
          - link "Iniciar sesión" [ref=e18] [cursor=pointer]:
            - /url: /app/login
          - link "Crear cuenta" [ref=e19] [cursor=pointer]:
            - /url: /app/register
          - button "Menú" [ref=e20] [cursor=pointer]:
            - generic [ref=e21]: menu
    - main [ref=e22]:
      - generic [ref=e23]:
        - generic [ref=e25]:
          - paragraph [ref=e26]: Funciones
          - heading "Todo lo que OW Finance hace por tu dinero." [level=1] [ref=e27]:
            - text: Todo lo que OW Finance
            - text: hace por tu dinero.
          - paragraph [ref=e28]: Cántaros, sueños, registro inteligente y análisis claro. Lo esencial en Lite; el control total en Pro.
          - generic [ref=e29]:
            - link "Cántaros" [ref=e30] [cursor=pointer]:
              - /url: "#cantaros"
            - link "Sueños" [ref=e31] [cursor=pointer]:
              - /url: "#suenos"
            - link "Transacciones" [ref=e32] [cursor=pointer]:
              - /url: "#transacciones"
            - link "Análisis" [ref=e33] [cursor=pointer]:
              - /url: "#analisis"
            - link "Cuentas & monedas" [ref=e34] [cursor=pointer]:
              - /url: "#cuentas"
            - link "Lite vs Pro" [ref=e35] [cursor=pointer]:
              - /url: "#comparativa"
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e41]: savings
            - heading "Cántaros" [level=2] [ref=e42]
            - paragraph [ref=e43]: Tu dinero vive en cántaros con propósito en vez de una cuenta única. Cada ingreso se reparte automáticamente; cada gasto baja el cántaro que le toca.
            - list [ref=e44]:
              - listitem [ref=e45]:
                - generic [ref=e46]: check_circle
                - text: Reparto por porcentaje o monto fijo
              - listitem [ref=e47]:
                - generic [ref=e48]: check_circle
                - text: Plantilla rápida 55 / 10 / 10 / 10 / 10
              - listitem [ref=e49]:
                - generic [ref=e50]: check_circle
                - text: Meta de ahorro por cántaro con avance visible
              - listitem [ref=e51]:
                - generic [ref=e52]: check_circle
                - text: Transferencias entre cántaros
            - link "Ver cántaros en acción arrow_forward" [ref=e53] [cursor=pointer]:
              - /url: /app/
              - text: Ver cántaros en acción
              - generic [ref=e54]: arrow_forward
          - generic [ref=e56]:
            - generic [ref=e58]:
              - generic [ref=e60]: shield
              - generic [ref=e61]:
                - generic [ref=e62]: Necesidades básicas
                - generic [ref=e63]: 55%
              - generic [ref=e64]: $ 1,815.00
            - generic [ref=e68]:
              - generic [ref=e70]: celebration
              - generic [ref=e71]:
                - generic [ref=e72]: Diversión
                - generic [ref=e73]: 10%
              - generic [ref=e74]: $ 132.00
            - generic [ref=e78]:
              - generic [ref=e80]: savings
              - generic [ref=e81]:
                - generic [ref=e82]: Ahorro
                - generic [ref=e83]: 10%
              - generic [ref=e84]: $ 2,940.00
        - generic [ref=e89]:
          - generic [ref=e91]:
            - generic [ref=e92]:
              - generic [ref=e93]: Sueños
              - generic [ref=e94]:
                - generic [ref=e95]: flag
                - text: Meta combinada $ 87,000
            - generic [ref=e96]:
              - generic [ref=e98]:
                - generic [ref=e99]: Casa propia
                - generic [ref=e100]: $ 12,400 / 60,000
              - generic [ref=e104]:
                - generic [ref=e105]: Maestría en Europa
                - generic [ref=e106]: $ 18,500 / 27,000
          - generic [ref=e109]:
            - generic [ref=e111]: flag
            - heading "Sueños" [level=2] [ref=e112]
            - paragraph [ref=e113]: Define metas concretas — una casa, un viaje, un posgrado — y deja que tu cántaro de ahorro las alimente.
            - list [ref=e114]:
              - listitem [ref=e115]:
                - generic [ref=e116]: check_circle
                - text: Una meta por sueño, con monto y avance claros.
              - listitem [ref=e117]:
                - generic [ref=e118]: check_circle
                - text: Progreso combinado de todos tus sueños.
              - listitem [ref=e119]:
                - generic [ref=e120]: check_circle
                - text: Marca prioridades y enfoca el ahorro.
        - generic [ref=e122]:
          - generic [ref=e123]:
            - paragraph [ref=e124]: Transacciones
            - heading "Cinco formas de registrar. Una acción primaria." [level=2] [ref=e125]:
              - text: Cinco formas de registrar.
              - text: Una acción primaria.
          - generic [ref=e126]:
            - generic [ref=e127]:
              - generic [ref=e129]: edit
              - heading "Escribe" [level=3] [ref=e130]
              - paragraph [ref=e131]: "\"Café 4.50 y taxi 12\" — lo interpretamos y lo dividimos en cántaros."
            - generic [ref=e132]:
              - generic [ref=e134]: mic
              - heading "Dicta por voz" [level=3] [ref=e135]
              - paragraph [ref=e136]: Habla con naturalidad. Ideal para anotar mientras caminas.
            - generic [ref=e137]:
              - generic [ref=e139]: photo_camera
              - heading "Foto del recibo" [level=3] [ref=e140]
              - paragraph [ref=e141]: Toma una foto y extraemos comercio, monto, fecha e ítems.
            - generic [ref=e142]:
              - generic [ref=e144]: bolt
              - heading "Automático" [level=3] [ref=e145]
              - paragraph [ref=e146]: Recurrentes y reglas que registran lo predecible por ti.
            - generic [ref=e147]:
              - generic [ref=e149]: upload_file
              - heading "Carga masiva" [level=3] [ref=e150]
              - paragraph [ref=e151]: Importa un extracto completo con vista previa.
            - generic [ref=e152]:
              - heading "Un botón Agregar, siempre a mano." [level=3] [ref=e153]
              - paragraph [ref=e154]: Sin menús que estorben. Registro en segundos.
        - generic [ref=e157]:
          - generic [ref=e158]:
            - generic [ref=e160]: bar_chart
            - heading "Análisis" [level=2] [ref=e161]
            - paragraph [ref=e162]: ¿En qué se fue? Respuesta en un vistazo. Navegador de gastos que reparte tu mes por cántaro, contrasta lo gastado contra tu presupuesto y te avisa lo que se pasó.
            - list [ref=e163]:
              - listitem [ref=e164]:
                - generic [ref=e165]: check_circle
                - text: Distribución por cántaro con donut y leyenda.
              - listitem [ref=e166]:
                - generic [ref=e167]: check_circle
                - text: Presupuesto vs. real, resaltando sobre-gastos.
              - listitem [ref=e168]:
                - generic [ref=e169]: check_circle
                - text: Navega por mes, trimestre o año con un toque.
          - generic [ref=e172]:
            - generic [ref=e174]:
              - generic [ref=e175]: $ 2,360
              - generic [ref=e176]: Gastado
            - generic [ref=e177]:
              - generic [ref=e178]:
                - generic [ref=e180]: Necesidades
                - generic [ref=e181]: $ 897
              - generic [ref=e182]:
                - generic [ref=e184]: Diversión
                - generic [ref=e185]: $ 472
              - generic [ref=e186]:
                - generic [ref=e188]: Transporte
                - generic [ref=e189]: $ 378
              - generic [ref=e190]:
                - generic [ref=e192]: Salud
                - generic [ref=e193]: $ 330
              - generic [ref=e194]:
                - generic [ref=e196]: Otros
                - generic [ref=e197]: $ 283
        - generic [ref=e200]:
          - generic [ref=e203]:
            - generic [ref=e204]: Disponible · USD
            - generic [ref=e205]: $ 12,480.50
            - generic [ref=e206]:
              - generic [ref=e207]:
                - generic [ref=e208]: VES
                - generic [ref=e209]: "746.84"
              - generic [ref=e210]:
                - generic [ref=e211]: EUR
                - generic [ref=e212]: "0.92"
          - generic [ref=e213]:
            - generic [ref=e215]: account_balance_wallet
            - heading "Cuentas & monedas" [level=2] [ref=e216]
            - paragraph [ref=e217]: USD, EUR y VES en simultáneo, con tasa al vuelo. En Pro, administra múltiples cuentas (banco, tarjeta, efectivo) y transfiere entre ellas cambiando de moneda.
            - list [ref=e218]:
              - listitem [ref=e219]:
                - generic [ref=e220]: check_circle
                - text: Multi-moneda en tiempo real.
              - listitem [ref=e221]:
                - generic [ref=e222]: check_circle
                - text: Cuentas bancarias, tarjetas y efectivo.
              - listitem [ref=e223]:
                - generic [ref=e224]: check_circle
                - text: Transferencias cross-currency con impuestos.
        - generic [ref=e226]:
          - generic [ref=e227]:
            - paragraph [ref=e228]: Comparativa
            - heading "Lite vs Pro. Mismo producto, más capas." [level=2] [ref=e229]
          - table [ref=e231]:
            - rowgroup [ref=e232]:
              - row "Característica view_agenda Lite dashboard Pro" [ref=e233]:
                - columnheader "Característica" [ref=e234]
                - columnheader "view_agenda Lite" [ref=e235]:
                  - generic [ref=e236]:
                    - generic [ref=e237]: view_agenda
                    - text: Lite
                - columnheader "dashboard Pro" [ref=e238]:
                  - generic [ref=e239]:
                    - generic [ref=e240]: dashboard
                    - text: Pro
            - rowgroup [ref=e241]:
              - row "Cántaros" [ref=e242]:
                - cell "Cántaros" [ref=e243]
              - row "Reparto automático check check" [ref=e244]:
                - cell "Reparto automático" [ref=e245]
                - cell "check" [ref=e246]:
                  - generic [ref=e247]: check
                - cell "check" [ref=e248]:
                  - generic [ref=e249]: check
              - row "Metas de ahorro check check" [ref=e250]:
                - cell "Metas de ahorro" [ref=e251]
                - cell "check" [ref=e252]:
                  - generic [ref=e253]: check
                - cell "check" [ref=e254]:
                  - generic [ref=e255]: check
              - row "Transferencias entre cántaros check check" [ref=e256]:
                - cell "Transferencias entre cántaros" [ref=e257]
                - cell "check" [ref=e258]:
                  - generic [ref=e259]: check
                - cell "check" [ref=e260]:
                  - generic [ref=e261]: check
              - row "Transacciones" [ref=e262]:
                - cell "Transacciones" [ref=e263]
              - row "Registro por texto check check" [ref=e264]:
                - cell "Registro por texto" [ref=e265]
                - cell "check" [ref=e266]:
                  - generic [ref=e267]: check
                - cell "check" [ref=e268]:
                  - generic [ref=e269]: check
              - row "Registro por voz check check" [ref=e270]:
                - cell "Registro por voz" [ref=e271]
                - cell "check" [ref=e272]:
                  - generic [ref=e273]: check
                - cell "check" [ref=e274]:
                  - generic [ref=e275]: check
              - row "Foto de recibo (OCR) check check" [ref=e276]:
                - cell "Foto de recibo (OCR)" [ref=e277]
                - cell "check" [ref=e278]:
                  - generic [ref=e279]: check
                - cell "check" [ref=e280]:
                  - generic [ref=e281]: check
              - row "Automático / recurrentes check check" [ref=e282]:
                - cell "Automático / recurrentes" [ref=e283]
                - cell "check" [ref=e284]:
                  - generic [ref=e285]: check
                - cell "check" [ref=e286]:
                  - generic [ref=e287]: check
              - row "Carga masiva remove check" [ref=e288]:
                - cell "Carga masiva" [ref=e289]
                - cell "remove" [ref=e290]:
                  - generic [ref=e291]: remove
                - cell "check" [ref=e292]:
                  - generic [ref=e293]: check
              - row "Ítems por línea close check" [ref=e294]:
                - cell "Ítems por línea" [ref=e295]
                - cell "close" [ref=e296]:
                  - generic [ref=e297]: close
                - cell "check" [ref=e298]:
                  - generic [ref=e299]: check
              - row "Cuentas & Monedas" [ref=e300]:
                - cell "Cuentas & Monedas" [ref=e301]
              - row "Multi-moneda (USD/EUR/VES) check check" [ref=e302]:
                - cell "Multi-moneda (USD/EUR/VES)" [ref=e303]
                - cell "check" [ref=e304]:
                  - generic [ref=e305]: check
                - cell "check" [ref=e306]:
                  - generic [ref=e307]: check
              - row "Múltiples cuentas (banco, tarjeta, efectivo) close check" [ref=e308]:
                - cell "Múltiples cuentas (banco, tarjeta, efectivo)" [ref=e309]
                - cell "close" [ref=e310]:
                  - generic [ref=e311]: close
                - cell "check" [ref=e312]:
                  - generic [ref=e313]: check
              - row "Transferencias cross-currency close check" [ref=e314]:
                - cell "Transferencias cross-currency" [ref=e315]
                - cell "close" [ref=e316]:
                  - generic [ref=e317]: close
                - cell "check" [ref=e318]:
                  - generic [ref=e319]: check
              - row "Impuestos (IGTF) close check" [ref=e320]:
                - cell "Impuestos (IGTF)" [ref=e321]
                - cell "close" [ref=e322]:
                  - generic [ref=e323]: close
                - cell "check" [ref=e324]:
                  - generic [ref=e325]: check
              - row "Análisis" [ref=e326]:
                - cell "Análisis" [ref=e327]
              - row "Distribución por cántaro check check" [ref=e328]:
                - cell "Distribución por cántaro" [ref=e329]
                - cell "check" [ref=e330]:
                  - generic [ref=e331]: check
                - cell "check" [ref=e332]:
                  - generic [ref=e333]: check
              - row "Presupuesto vs. real check check" [ref=e334]:
                - cell "Presupuesto vs. real" [ref=e335]
                - cell "check" [ref=e336]:
                  - generic [ref=e337]: check
                - cell "check" [ref=e338]:
                  - generic [ref=e339]: check
              - row "Drill-down por categoría / cuenta close check" [ref=e340]:
                - cell "Drill-down por categoría / cuenta" [ref=e341]
                - cell "close" [ref=e342]:
                  - generic [ref=e343]: close
                - cell "check" [ref=e344]:
                  - generic [ref=e345]: check
              - row "Insights con IA close check" [ref=e346]:
                - cell "Insights con IA" [ref=e347]
                - cell "close" [ref=e348]:
                  - generic [ref=e349]: close
                - cell "check" [ref=e350]:
                  - generic [ref=e351]: check
          - generic [ref=e352]:
            - generic [ref=e353]:
              - generic [ref=e354]: check
              - text: Disponible
            - generic [ref=e355]:
              - generic [ref=e356]: remove
              - text: Simplificado
            - generic [ref=e357]:
              - generic [ref=e358]: close
              - text: No disponible
        - generic [ref=e361]:
          - paragraph [ref=e362]: Empieza hoy
          - heading "Pon tu dinero en claro este mes." [level=2] [ref=e363]
          - paragraph [ref=e364]: Crea tu primer cántaro en menos de un minuto. Gratis para empezar, sin tarjeta.
          - generic [ref=e365]:
            - link "Crear cuenta gratis arrow_forward" [ref=e366] [cursor=pointer]:
              - /url: /app/register
              - text: Crear cuenta gratis
              - generic [ref=e367]: arrow_forward
            - link "Ver planes" [ref=e368] [cursor=pointer]:
              - /url: /app/planes
    - contentinfo [ref=e369]:
      - generic [ref=e370]:
        - generic [ref=e371]:
          - generic [ref=e372]:
            - link "OW Finance" [ref=e373] [cursor=pointer]:
              - /url: /app/
              - img [ref=e374]:
                - generic [ref=e375]: OW
                - generic [ref=e376]: Finance
            - paragraph [ref=e377]: Finanzas personales calmadas. Reparte, ahorra y entiende tu dinero — en Lite o en Pro.
            - generic [ref=e378]:
              - link "Descargar APK Dev (Beta)" [ref=e379] [cursor=pointer]:
                - /url: https://appfinanzasdev.blockshift.website/downloads/owfinance-dev.apk
                - generic [ref=e380]: android
                - text: Android DEV
              - link "Descargar APK Stage" [ref=e381] [cursor=pointer]:
                - /url: https://appfinanzas.blockshift.website/downloads/owfinance-stage.apk
                - generic [ref=e382]: android
                - text: Android Stage
          - generic [ref=e383]:
            - heading "Producto" [level=4] [ref=e384]
            - list [ref=e385]:
              - listitem [ref=e386]:
                - link "Cántaros" [ref=e387] [cursor=pointer]:
                  - /url: /app/funciones#cantaros
              - listitem [ref=e388]:
                - link "Sueños" [ref=e389] [cursor=pointer]:
                  - /url: /app/funciones#suenos
              - listitem [ref=e390]:
                - link "Análisis" [ref=e391] [cursor=pointer]:
                  - /url: /app/funciones#analisis
              - listitem [ref=e392]:
                - link "Lite & Pro" [ref=e393] [cursor=pointer]:
                  - /url: /#modos
          - generic [ref=e394]:
            - heading "Empezar" [level=4] [ref=e395]
            - list [ref=e396]:
              - listitem [ref=e397]:
                - link "Crear cuenta" [ref=e398] [cursor=pointer]:
                  - /url: /app/register
              - listitem [ref=e399]:
                - link "Iniciar sesión" [ref=e400] [cursor=pointer]:
                  - /url: /app/login
              - listitem [ref=e401]:
                - link "Planes" [ref=e402] [cursor=pointer]:
                  - /url: /app/planes
          - generic [ref=e403]:
            - heading "Recursos" [level=4] [ref=e404]
            - list [ref=e405]:
              - listitem [ref=e406]:
                - link "Funciones" [ref=e407] [cursor=pointer]:
                  - /url: /app/funciones
              - listitem [ref=e408]:
                - link "Matriz Lite vs Pro" [ref=e409] [cursor=pointer]:
                  - /url: /app/matriz
        - generic [ref=e410]:
          - generic [ref=e411]: © 2026 OW Finance. Todos los derechos reservados.
          - generic [ref=e412]:
            - link "Privacidad" [ref=e413] [cursor=pointer]:
              - /url: "#"
            - link "Términos" [ref=e414] [cursor=pointer]:
              - /url: "#"
            - link "Contacto" [ref=e415] [cursor=pointer]:
              - /url: "#"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE = 'https://owfinances.com';
  4  | 
  5  | test.describe('Real user navigation debug', () => {
  6  |   test('Full flow: load landing → click Planes → check what happens', async ({ page }) => {
  7  |     const logs: string[] = [];
  8  |     page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  9  |     page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));
  10 | 
  11 |     await page.goto(`${BASE}/app/`, { waitUntil: 'networkidle' });
  12 |     await page.waitForTimeout(2000);
  13 |     
  14 |     console.log('=== STEP 1: Landing loaded ===');
  15 |     console.log(`URL: ${page.url()}`);
  16 |     console.log(`Logs so far: ${logs.filter(l => l.includes('error') || l.includes('Error')).join('; ') || 'none'}`);
  17 | 
  18 |     const landingContent = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
  19 |     console.log(`Landing #q-app length: ${landingContent.length}`);
  20 | 
  21 |     await page.click('a:has-text("Planes")');
  22 |     await page.waitForTimeout(3000);
  23 | 
  24 |     console.log('\n=== STEP 2: After clicking Planes ===');
  25 |     console.log(`URL: ${page.url()}`);
  26 |     
  27 |     const planesContent = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
  28 |     console.log(`Planes #q-app length: ${planesContent.length}`);
  29 |     console.log(`Planes first 300 chars: ${planesContent.substring(0, 300)}`);
  30 | 
  31 |     const allErrors = logs.filter(l => l.includes('[error]') || l.includes('[PAGE_ERROR]'));
  32 |     console.log(`\nAll errors: ${allErrors.length > 0 ? allErrors.join('\n') : 'none'}`);
  33 | 
  34 |     expect(planesContent.length).toBeGreaterThan(50);
  35 |   });
  36 | 
  37 |   test('Direct load /app/planes with full logging', async ({ page }) => {
  38 |     const logs: string[] = [];
  39 |     page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  40 |     page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));
  41 | 
  42 |     await page.goto(`${BASE}/app/planes`, { waitUntil: 'networkidle' });
  43 |     await page.waitForTimeout(3000);
  44 | 
  45 |     console.log(`URL: ${page.url()}`);
  46 |     const content = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
  47 |     console.log(`#q-app length: ${content.length}`);
  48 |     console.log(`#q-app first 500: ${content.substring(0, 500)}`);
  49 | 
  50 |     const errors = logs.filter(l => l.includes('[error]') || l.includes('[PAGE_ERROR]'));
  51 |     console.log(`Errors: ${errors.length > 0 ? errors.join('\n') : 'none'}`);
  52 | 
  53 |     const vueWarnings = logs.filter(l => l.includes('warn') || l.includes('[Vue]'));
  54 |     console.log(`Vue warnings: ${vueWarnings.length > 0 ? vueWarnings.join('\n') : 'none'}`);
  55 |     
  56 |     expect(content.length).toBeGreaterThan(50);
  57 |   });
  58 | 
  59 |   test('Click to funciones then back to landing', async ({ page }) => {
  60 |     const logs: string[] = [];
  61 |     page.on('pageerror', err => logs.push(err.message));
  62 | 
  63 |     await page.goto(`${BASE}/app/`, { waitUntil: 'networkidle' });
  64 |     await page.waitForTimeout(1500);
  65 |     
  66 |     await page.click('a:has-text("Funciones")');
  67 |     await page.waitForTimeout(2000);
  68 |     const funcUrl = page.url();
  69 |     const funcContent = await page.locator('#q-app').innerHTML().catch(() => '');
  70 |     console.log(`Funciones: url=${funcUrl} content=${funcContent.length}`);
  71 | 
> 72 |     await page.click('a:has-text("OW Finance")');
     |                ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  73 |     await page.waitForTimeout(2000);
  74 |     const homeUrl = page.url();
  75 |     const homeContent = await page.locator('#q-app').innerHTML().catch(() => '');
  76 |     console.log(`Back home: url=${homeUrl} content=${homeContent.length}`);
  77 |     
  78 |     console.log(`Page errors: ${logs.length > 0 ? logs.join('; ') : 'none'}`);
  79 |     
  80 |     expect(funcContent.length).toBeGreaterThan(50);
  81 |     expect(homeContent.length).toBeGreaterThan(50);
  82 |   });
  83 | });
  84 | 
```