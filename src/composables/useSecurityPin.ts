import { api } from 'boot/axios';

interface ApiEnvelope<T> {
  status: string;
  code: number;
  message?: string;
  data?: T;
}

export async function fetchPinStatus(): Promise<boolean> {
  const res = await api.get<ApiEnvelope<{ has_pin: boolean }>>('/user/security/pin-status');
  return !!res.data.data?.has_pin;
}

export async function setPin(pin: string, password: string): Promise<void> {
  await api.put('/user/security/pin', { pin, password });
}

export async function verifyPin(pin: string): Promise<boolean> {
  try {
    const res = await api.post<ApiEnvelope<{ valid: boolean }>>('/user/security/pin/verify', { pin });
    return !!res.data.data?.valid;
  } catch {
    return false;
  }
}

export async function removePin(password: string): Promise<void> {
  await api.delete('/user/security/pin', { data: { password } });
}
