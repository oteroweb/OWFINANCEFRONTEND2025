import type { Page } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

export const TEST_USER = {
  email: process.env.PLAYWRIGHT_TEST_EMAIL ?? 'user@demo.com',
  password: process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'S$ratoga.1990',
};

// Must match the path written by e2e/global-setup.ts (one level up from this helpers/ dir)
const AUTH_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.auth.json');
const API_BASE = 'https://owfinances.com/api/v1';

// Read auth from file (written by global-setup). Falls back to direct API call if file missing.
async function getAuth(): Promise<{ token: string; user: unknown; role: string }> {
  if (existsSync(AUTH_FILE)) {
    return JSON.parse(readFileSync(AUTH_FILE, 'utf8')) as { token: string; user: unknown; role: string };
  }
  // Fallback: direct API call (may hit rate limiting if run in parallel)
  const email = TEST_USER.email;
  const password = TEST_USER.password;
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json()) as { token: string; role: string; data: unknown };
  if (!body.token) throw new Error(`Login failed: ${JSON.stringify(body)}`);
  return { token: body.token, user: body.data, role: body.role };
}

// NOTE: vueRouterBase='/' — SPA is at http://localhost:3000/ not /app/.
// Browser-form login is blocked by CORS (localhost origin rejected by prod API).
// Token is obtained server-side (no CORS) and injected into localStorage.
export async function login(page: Page) {
  if (!process.env.PLAYWRIGHT_TEST_EMAIL) return; // no-op if no credentials

  const auth = await getAuth();

  // Inject token into localStorage so router guard picks it up on next navigation.
  // Use '/' relative path — Playwright resolves against baseURL (localhost or prod).
  await page.goto('/');
  await page.evaluate(
    ({ token, user, role }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
    },
    auth,
  );

  // Navigate to app — router guard calls loadFromStorage() and authorizes
  await page.goto('/user');
  await page.waitForURL(/\/user/, { timeout: 15000 });
}
