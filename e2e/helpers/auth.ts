import type { Page } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const AUTH_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_BASE = 'https://owfinances.com/api/v1';

export const USERS = {
  /** Lite plan, 1 cuenta USD — tests base (default si no se especifica) */
  lite: {
    email: process.env.PLAYWRIGHT_TEST_EMAIL ?? 'usertestlite@demo.com',
    password: process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'S$ratoga.1990',
    authFile: '.auth.lite.json',
  },
  /** Pro plan, 2 cuentas USD+VES — tests Pro + multi-moneda */
  pro: {
    email: 'usertestpro@demo.com',
    password: 'S$ratoga.1990',
    authFile: '.auth.pro.json',
  },
} as const;

export type UserKey = keyof typeof USERS;

async function fetchAuth(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json()) as { token?: string; role?: string; data?: unknown; message?: string };
  if (!body.token) throw new Error(`Login failed for ${email}: ${body.message ?? JSON.stringify(body)}`);
  return { token: body.token, user: body.data, role: body.role ?? 'user' };
}

function getAuthFile(userKey: UserKey): string {
  return path.join(AUTH_DIR, USERS[userKey].authFile);
}

function readCachedAuth(userKey: UserKey) {
  const file = getAuthFile(userKey);
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, 'utf8')) as { token: string; user: unknown; role: string };
  }
  return null;
}

/**
 * Login a specific user (lite | pro).
 * Reads from cached .auth.<user>.json written by global-setup, or fetches fresh token.
 */
export async function login(page: Page, userKey: UserKey = 'lite') {
  const user = USERS[userKey];
  if (!user) throw new Error(`Unknown userKey: ${userKey}`);

  let auth = readCachedAuth(userKey);
  if (!auth) {
    auth = await fetchAuth(user.email, user.password);
  }

  await page.goto('/');
  await page.evaluate(
    ({ token, userData, role }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', role);
    },
    { token: auth.token, userData: auth.user, role: auth.role },
  );

  await page.goto('/user');
  await page.waitForURL(/\/user/, { timeout: 15000 });
}

/** Alias legacy — mantiene compatibilidad con tests que no pasan userKey */
export const TEST_USER = USERS.lite;
