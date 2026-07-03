/**
 * API helper for Playwright tests.
 * Reads the auth token written by global-setup.ts and provides typed POST/GET helpers.
 */
import type { APIRequestContext } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const AUTH_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.auth.json');

export function getStoredToken(): string | null {
  if (existsSync(AUTH_FILE)) {
    try {
      return (JSON.parse(readFileSync(AUTH_FILE, 'utf8')) as { token: string }).token;
    } catch {
      return null;
    }
  }
  return null;
}

export function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function apiPost(
  request: APIRequestContext,
  path: string,
  token: string,
  body: unknown,
) {
  return request.post(path, {
    headers: authHeaders(token),
    data: body,
  });
}

export async function apiGet(
  request: APIRequestContext,
  path: string,
  token: string,
  params?: Record<string, string>,
) {
  return request.get(path, {
    headers: authHeaders(token),
    params,
  });
}

/** Assert response is OK and return parsed JSON data */
export async function expectOk(response: Awaited<ReturnType<typeof apiPost>>) {
  const body = await response.json() as { status: string; data?: unknown; message?: string; code?: number };
  if (body.status !== 'OK') {
    throw new Error(
      `API responded with status=${body.status} message="${body.message}" code=${body.code}\n` +
      `data=${JSON.stringify(body.data)}`
    );
  }
  return body.data as Record<string, unknown>;
}
