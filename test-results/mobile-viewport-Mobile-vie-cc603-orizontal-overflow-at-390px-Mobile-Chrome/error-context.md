# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-viewport.spec.ts >> Mobile viewport 390px (OWF-115) >> Home — renders without horizontal overflow at 390px
- Location: e2e/mobile-viewport.spec.ts:18:3

# Error details

```
Error: Login failed: {"message":"Too Many Attempts."}
```

# Test source

```ts
  1  | import type { Page } from '@playwright/test';
  2  | 
  3  | export const TEST_USER = {
  4  |   email: process.env.PLAYWRIGHT_TEST_EMAIL ?? 'user@demo.com',
  5  |   password: process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'S$ratoga.1990',
  6  | };
  7  | 
  8  | const API_BASE = 'https://owfinances.com/api/v1';
  9  | 
  10 | // Module-level cache — one API login call per test run to avoid rate limiting
  11 | let _cachedAuth: { token: string; user: unknown; role: string } | null = null;
  12 | 
  13 | async function getAuth(email: string, password: string) {
  14 |   if (_cachedAuth) return _cachedAuth;
  15 |   const res = await fetch(`${API_BASE}/auth/login`, {
  16 |     method: 'POST',
  17 |     headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  18 |     body: JSON.stringify({ email, password }),
  19 |   });
  20 |   const body = (await res.json()) as { token: string; role: string; data: unknown };
> 21 |   if (!body.token) throw new Error(`Login failed: ${JSON.stringify(body)}`);
     |                          ^ Error: Login failed: {"message":"Too Many Attempts."}
  22 |   _cachedAuth = { token: body.token, user: body.data, role: body.role };
  23 |   return _cachedAuth;
  24 | }
  25 | 
  26 | // NOTE: Uses Node.js fetch (no CORS) to obtain token, then injects into localStorage.
  27 | // Browser-form login is blocked by CORS (localhost origin rejected by prod API).
  28 | export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  29 |   const auth = await getAuth(email, password);
  30 | 
  31 |   // Inject token into localStorage so router guard picks it up.
  32 |   // Use full URLs — vueRouterBase='/' so the SPA is at http://localhost:3000/ not /app/.
  33 |   // The /app/ prefix in old tests caused Vue Router 404s.
  34 |   await page.goto('http://localhost:3000/');
  35 |   await page.evaluate(
  36 |     ({ token, user, role }) => {
  37 |       localStorage.setItem('token', token);
  38 |       localStorage.setItem('user', JSON.stringify(user));
  39 |       localStorage.setItem('role', role);
  40 |     },
  41 |     auth,
  42 |   );
  43 | 
  44 |   // Navigate to app — router guard calls loadFromStorage() and authorizes
  45 |   await page.goto('http://localhost:3000/user');
  46 |   await page.waitForURL(/\/user/, { timeout: 15000 });
  47 | }
  48 | 
```