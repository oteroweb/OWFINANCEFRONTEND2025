# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes-comprehensive.spec.ts >> User routes — render after login >> /user/debts renders content after login
- Location: e2e/routes-comprehensive.spec.ts:67:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic: v1.0.22
  - generic [ref=e3]:
    - banner [ref=e4]:
      - toolbar [ref=e5]:
        - generic [ref=e6]: Ow Finance
    - generic [ref=e8]:
      - complementary [ref=e9]:
        - link "OW Finance" [ref=e10] [cursor=pointer]:
          - /url: /
          - img [ref=e11]:
            - generic [ref=e12]: OW
            - generic [ref=e13]: Finance
        - generic [ref=e14]:
          - heading "Tu dinero, repartido con propósito." [level=2] [ref=e15]:
            - text: Tu dinero, repartido
            - text: con propósito.
          - paragraph [ref=e16]: Entra para ver tus cántaros, alimentar tus sueños y registrar lo del día en segundos.
          - generic [ref=e17]:
            - generic [ref=e18]: Disponible · USD
            - generic [ref=e19]: $ 12,480.50
            - generic [ref=e20]:
              - generic [ref=e21]:
                - generic [ref=e22]: Necesidades
                - generic [ref=e23]: $ 1,815
              - generic [ref=e24]:
                - generic [ref=e25]: Ahorro
                - generic [ref=e26]: $ 2,940
              - generic [ref=e27]:
                - generic [ref=e28]: Diversión
                - generic [ref=e29]: $ 132
        - generic [ref=e30]: Lite o Pro · USD · EUR · VES · Claro y oscuro
      - main [ref=e31]:
        - generic [ref=e32]:
          - link "arrow_back Volver al inicio" [ref=e33] [cursor=pointer]:
            - /url: /
            - generic [ref=e34]: arrow_back
            - text: Volver al inicio
          - button "Cambiar a oscuro" [ref=e35] [cursor=pointer]:
            - generic [ref=e36]: dark_mode
        - generic [ref=e38]:
          - tablist [ref=e39]:
            - tab "Iniciar sesión" [ref=e40] [cursor=pointer]
            - tab "Crear cuenta" [ref=e41] [cursor=pointer]
          - heading "Hola de nuevo" [level=1] [ref=e42]
          - paragraph [ref=e43]: Entra para seguir con tus finanzas.
          - generic [ref=e44]:
            - generic [ref=e45]:
              - generic [ref=e46]: Correo
              - generic [ref=e47]:
                - generic [ref=e48]: mail
                - textbox "Correo" [ref=e49]:
                  - /placeholder: tu@correo.com
                  - text: user@demo.com
            - generic [ref=e50]:
              - generic [ref=e51]: Contraseña
              - generic [ref=e52]:
                - generic [ref=e53]: lock
                - textbox "Contraseña" [active] [ref=e54]:
                  - /placeholder: ••••••••
                  - text: S$ratoga.1990
                - generic [ref=e55] [cursor=pointer]: visibility_off
            - generic [ref=e56]:
              - generic [ref=e57] [cursor=pointer]:
                - checkbox "Recuérdame" [checked] [ref=e58]
                - text: Recuérdame
              - link "¿Olvidaste tu contraseña?" [ref=e59] [cursor=pointer]:
                - /url: "#"
            - button "Entrar arrow_forward" [ref=e60] [cursor=pointer]:
              - text: Entrar
              - generic [ref=e61]: arrow_forward
          - generic [ref=e62]: o continúa con
          - generic [ref=e63]:
            - link "Google" [ref=e64] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e65]: G
              - text: Google
            - link "Apple" [ref=e66] [cursor=pointer]:
              - /url: "#"
              - text: Apple
          - paragraph [ref=e68]:
            - text: ¿Aún no tienes cuenta?
            - link "Créala gratis" [ref=e69] [cursor=pointer]:
              - /url: /register
            - text: .
          - generic [ref=e70]: Descarga la app
          - generic [ref=e71]:
            - link "android DEV (Beta)" [ref=e72] [cursor=pointer]:
              - /url: https://appfinanzasdev.blockshift.website/downloads/owfinance-dev.apk
              - generic [ref=e73]: android
              - text: DEV (Beta)
            - link "android Stage" [ref=e74] [cursor=pointer]:
              - /url: https://appfinanzas.blockshift.website/downloads/owfinance-stage.apk
              - generic [ref=e75]: android
              - text: Stage
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE = 'https://owfinances.com';
  4  | 
  5  | const publicRoutes = [
  6  |   { path: '/', title: 'Inicio' },
  7  |   { path: '/funciones', title: 'Funciones' },
  8  |   { path: '/planes', title: 'Planes' },
  9  |   { path: '/matriz', title: 'Matriz' },
  10 |   { path: '/login', title: 'Login' },
  11 | ];
  12 | 
  13 | const userRoutes = [
  14 |   '/user/home',
  15 |   '/user/transactions',
  16 |   '/user/jars',
  17 |   '/user/config',
  18 |   '/user/expense-analysis',
  19 |   '/user/dreams',
  20 |   '/user/debts',
  21 |   '/user/categories',
  22 |   '/user/accounts',
  23 | ];
  24 | 
  25 | test.describe('Public routes — render check', () => {
  26 |   for (const route of publicRoutes) {
  27 |     test(`${route.path || '/'} renders content (not blank)`, async ({ page }) => {
  28 |       await page.goto(`${BASE}${route.path}`);
  29 |       await page.waitForTimeout(2000);
  30 | 
  31 |       const bodyHTML = await page.locator('body').innerHTML();
  32 |       const hasContent = bodyHTML.length > 200;
  33 |       const hasApp = await page.locator('#q-app').innerHTML().then(h => h.length > 50).catch(() => false);
  34 |       const hasBlankVue = await page.locator('#q-app:empty').count().then(c => c === 0);
  35 | 
  36 |       console.log(`[PUBLIC] ${route.path}: body=${bodyHTML.length} chars, #q-app has content=${hasApp}, not empty=${hasBlankVue}`);
  37 | 
  38 |       expect(hasContent, `Body should have content at ${route.path}`).toBe(true);
  39 |       expect(hasApp, `#q-app should have rendered content at ${route.path}`).toBe(true);
  40 |     });
  41 |   }
  42 | });
  43 | 
  44 | test.describe('User routes — redirect to login when not authed', () => {
  45 |   for (const route of userRoutes) {
  46 |     test(`${route} redirects to login for unauthenticated user`, async ({ page }) => {
  47 |       await page.goto(`${BASE}${route}`);
  48 |       await page.waitForTimeout(2000);
  49 |       const url = page.url();
  50 |       console.log(`[USER NO AUTH] ${route} → ${url}`);
  51 |       expect(url).toMatch(/\/login|\/app\/login/);
  52 |     });
  53 |   }
  54 | });
  55 | 
  56 | test.describe('User routes — render after login', () => {
  57 |   test.beforeEach(async ({ page }) => {
  58 |     await page.goto(`${BASE}/login`);
  59 |     await page.fill('input[type="email"]', 'user@demo.com');
  60 |     await page.fill('input[type="password"]', 'S$ratoga.1990');
  61 |     await page.locator('input[type="password"]').press('Enter');
> 62 |     await page.waitForURL(/\/user/, { timeout: 20000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
  63 |     await page.waitForTimeout(1000);
  64 |   });
  65 | 
  66 |   for (const route of userRoutes) {
  67 |     test(`${route} renders content after login`, async ({ page }) => {
  68 |       await page.goto(`${BASE}${route}`);
  69 |       await page.waitForTimeout(2000);
  70 | 
  71 |       const qApp = await page.locator('#q-app').innerHTML().then(h => h.length).catch(() => 0);
  72 |       const hasLayout = await page.locator('.lite-nav, .user-shell, .pro-layout').count().then(c => c > 0);
  73 | 
  74 |       console.log(`[USER AUTHED] ${route}: #q-app=${qApp} chars, hasLayout=${hasLayout}, url=${page.url()}`);
  75 | 
  76 |       expect(qApp, `#q-app should have content at ${route}`).toBeGreaterThan(50);
  77 |     });
  78 |   }
  79 | });
  80 | 
```