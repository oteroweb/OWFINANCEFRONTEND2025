import type { FullConfig } from '@playwright/test';
import { writeFileSync, readFileSync, existsSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_BASE = 'https://owfinances.com/api/v1';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_TTL_MS = 60 * 60 * 1000; // reusar tokens por 1 hora para evitar rate-limit

function isFreshToken(filename: string): boolean {
  const file = path.join(DIR, filename);
  if (!existsSync(file)) return false;
  const age = Date.now() - statSync(file).mtimeMs;
  return age < TOKEN_TTL_MS;
}

async function loginAndCache(email: string, password: string, filename: string) {
  if (isFreshToken(filename)) {
    console.log(`✓ global-setup: reusing cached token for ${email}`);
    return JSON.parse(readFileSync(path.join(DIR, filename), 'utf8')).token as string;
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json()) as { token?: string; role?: string; data?: unknown; message?: string };
  if (!body.token) throw new Error(`Global setup: login failed for ${email} — ${body.message ?? JSON.stringify(body)}`);
  writeFileSync(
    path.join(DIR, filename),
    JSON.stringify({ token: body.token, user: body.data, role: body.role }),
  );
  console.log(`✓ global-setup: fresh token cached for ${email}`);
  return body.token;
}

export default async function globalSetup(_config: FullConfig) {
  const password = 'S$ratoga.1990';

  // Usuario lite (también cacheado en .auth.json para compatibilidad con api spec)
  const liteEmail = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'usertestlite@demo.com';
  const litePass  = process.env.PLAYWRIGHT_TEST_PASSWORD ?? password;
  const liteToken = await loginAndCache(liteEmail, litePass, '.auth.lite.json');

  // Copiar a .auth.json para compatibilidad con transaction-api.spec.ts
  writeFileSync(path.join(DIR, '.auth.json'), readFileSync(path.join(DIR, '.auth.lite.json')));

  // Usuario pro
  await loginAndCache('usertestpro@demo.com', password, '.auth.pro.json');

  void liteToken;
  console.log('✓ global-setup: lite + pro tokens ready');
}
