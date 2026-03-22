/**
 * Определяет базовый URL для API на основе текущего хоста.
 * 
 * Dev-режим (localhost или LAN IP):
 * - localhost:5173 → http://localhost:5010
 * - 192.168.x.x:5173 → http://192.168.x.x:5010
 * 
 * Production:
 * - Использует VITE_API_BASE_URL из .env или относительный путь /api
 */
export function getApiBaseUrl(): string {
  const isDev = import.meta.env.DEV;
  
  // Production - используем переменную окружения или относительный путь
  if (!isDev) {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL as string;
    }
    // В проде API на том же домене
    return window.location.origin;
  }

  // Dev-режим: определяем по текущему хосту
  const host = window.location.hostname;
  const port = '5010';

  // localhost
  if (host === 'localhost' || host === '127.0.0.1') {
    return `http://localhost:${port}`;
  }

  // Локальная сеть (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  if (
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
  ) {
    return `http://${host}:${port}`;
  }

  // Fallback
  return `http://localhost:${port}`;
}
