import type { components, paths } from '@/utils/api'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export type ApiErrorPayload = {
  statusCode: number
  message: string | string[]
  timestamp?: string
  path?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function buildUrl(baseUrl: string | undefined, path: string, query?: Record<string, unknown>) {
  const normalizedBase = (baseUrl ?? '').replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(normalizedBase + normalizedPath, normalizedBase ? undefined : window.location.origin)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

type RequestOptions = {
  query?: Record<string, unknown>
  body?: unknown
  headers?: Record<string, string>
}

let accessToken: string | null = null
let refreshPromise: Promise<void> | null = null

function setAccessTokenFromPayload(payload: unknown) {
  if (!isRecord(payload)) return
  const maybeToken = payload['access_token']
  if (typeof maybeToken === 'string') {
    accessToken = maybeToken
  }
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshUrl = buildUrl(import.meta.env.VITE_API_BASE_URL as string | undefined, '/api/auth/refresh')
        const res = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include',
        })

        if (!res.ok) {
          accessToken = null
          const text = await res.text().catch(() => '')
          throw new Error(text || `HTTP ${res.status}`)
        }

        const contentType = res.headers.get('content-type') ?? ''
        if (contentType.includes('application/json')) {
          const json = (await res.json()) as unknown
          setAccessTokenFromPayload(json)
        }
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

function resetAccessToken() {
  accessToken = null
}

async function doFetch<TResponse>(
  method: HttpMethod,
  path: string,
  options?: RequestOptions,
  runtime?: { skipAuthRetry?: boolean },
): Promise<TResponse> {
  const url = buildUrl(import.meta.env.VITE_API_BASE_URL as string | undefined, path, options?.query)

  const headers: Record<string, string> = {
    ...(options?.headers ?? {}),
  }

  if (accessToken && headers.Authorization === undefined) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  let body: BodyInit | undefined
  if (options?.body !== undefined) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
    body = JSON.stringify(options.body)
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: 'include',
  })
  
  // Если access-token устарел, пробуем один раз обновить через refresh-cookie и повторить запрос.
  if (res.status === 401 && runtime?.skipAuthRetry !== true && path !== '/api/auth/refresh' && path !== '/api/auth/login') {
    await refreshAccessToken()
    return doFetch<TResponse>(method, path, options, { skipAuthRetry: true })
  }

  // ❗ НОРМАЛИЗАЦИЯ ОШИБКИ
  if (!res.ok) {
    let payload: ApiErrorPayload | null = null

    const contentType = res.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      payload = (await res.json()) as ApiErrorPayload
    } else {
      const text = await res.text().catch(() => '')
      payload = { statusCode: res.status, message: text || 'Ошибка запроса' }
    }

    const message = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message

    const error = new Error(message)
    ;(error as any).statusCode = payload.statusCode
    ;(error as any).data = payload

    throw error
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const json = (await res.json()) as unknown
    setAccessTokenFromPayload(json)
    return json as TResponse
  }

  return (undefined as TResponse)
}

async function request<TResponse>(
  method: HttpMethod,
  path: string,
  options?: RequestOptions,
): Promise<TResponse> {
  return doFetch<TResponse>(method, path, options)
}

export const api = {
  auth: {
    register: (dto: components['schemas']['RegisterDto']) =>
      request<string>('POST', '/api/auth/register', { body: dto }),
    login: (dto: components['schemas']['LoginDto']) => request<string>('POST', '/api/auth/login', { body: dto }),
    refresh: () => request<unknown>('POST', '/api/auth/refresh'),
    me: () => request<unknown>('GET', '/api/auth/me'),
    logout: async () => {
      try {
        await request<void>('POST', '/api/auth/logout')
      } finally {
        resetAccessToken()
      }
    },
    resendConfirmation: (dto: components['schemas']['ResendConfirmationDto']) =>
      request<void>('POST', '/api/auth/resend-confirmation', { body: dto }),

    changePassword: (dto: components['schemas']['ChangePasswordDto']) =>
      request<void>('POST', '/api/auth/change-password', { body: dto }),

    requestPasswordReset: (dto: components['schemas']['RequestPasswordResetDto']) =>
      request<{ status: 'ok' }>('POST', '/api/auth/request-password-reset', { body: dto }),

    confirmPasswordReset: (dto: components['schemas']['ConfirmPasswordResetDto']) =>
      request<void>('POST', '/api/auth/confirm-password-reset', { body: dto }),
  },

  products: {
    list: () => request<unknown>('GET', '/api/products'),
    get: (id: number) => request<unknown>('GET', `/api/products/${id}`),
    create: (dto: components['schemas']['CreateProductDto']) => request<void>('POST', '/api/products', { body: dto }),
    update: (id: number, dto: components['schemas']['UpdateProductDto']) =>
      request<void>('PATCH', `/api/products/${id}`, { body: dto }),
  },

  services: {
    list: () => request<unknown>('GET', '/api/services'),
    get: (id: number) => request<unknown>('GET', `/api/services/${id}`),
    create: (dto: components['schemas']['CreateServiceDto']) => request<void>('POST', '/api/services', { body: dto }),
    update: (id: number, dto: components['schemas']['UpdateServiceDto']) =>
      request<void>('PATCH', `/api/services/${id}`, { body: dto }),
  },

  jobs: {
    list: () => request<unknown>('GET', '/api/jobs'),
    get: (id: number) => request<unknown>('GET', `/api/jobs/${id}`),
    create: (dto: components['schemas']['CreateJobDto']) => request<void>('POST', '/api/jobs', { body: dto }),
    update: (id: number, dto: components['schemas']['UpdateJobDto']) => request<void>('PATCH', `/api/jobs/${id}`, { body: dto }),
  },

  // type-safety hint: keep linkage to generated OpenAPI paths
  _paths: null as unknown as paths,
}

export type ApiUser = {
  id?: number
  email?: string
  name?: string
  country?: string
  region?: string
  district?: string
  isEmailVerified?: boolean
  isEstate?: boolean
  estateType?: 'INDIVIDUAL' | 'SETTLEMENT'
  settlement?: string
  photoUrl?: string
}

export function parseApiUser(payload: unknown): ApiUser {
  if (!isRecord(payload)) return {}
  return {
    id: typeof payload.id === 'number' ? payload.id : undefined,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    country: typeof payload.country === 'string' ? payload.country : undefined,
    region: typeof payload.region === 'string' ? payload.region : undefined,
    district: typeof payload.district === 'string' ? payload.district : undefined,
    isEmailVerified: typeof payload.isEmailVerified === 'boolean' ? payload.isEmailVerified : undefined,
    isEstate: typeof payload.isEstate === 'boolean' ? payload.isEstate : undefined,
    estateType:
      payload.estateType === 'INDIVIDUAL' || payload.estateType === 'SETTLEMENT' ? payload.estateType : undefined,
    settlement: typeof payload.settlement === 'string' ? payload.settlement : undefined,
    photoUrl: typeof payload.photoUrl === 'string' ? payload.photoUrl : undefined,
  }
}
