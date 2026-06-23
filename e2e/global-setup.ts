import type { FullConfig } from '@playwright/test';
import { writeFileSync } from 'fs';

const API_BASE = 'https://owfinances.com/api/v1';

export default async function globalSetup(_config: FullConfig) {
  if (!process.env.PLAYWRIGHT_TEST_EMAIL) return; // skip if no credentials

  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? '';

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json()) as { token?: string; role?: string; data?: unknown; message?: string };
  if (!body.token) throw new Error(`Global setup: login failed — ${body.message ?? JSON.stringify(body)}`);

  writeFileSync(
    new URL('./.auth.json', import.meta.url).pathname,
    JSON.stringify({ token: body.token, user: body.data, role: body.role }),
  );
}
