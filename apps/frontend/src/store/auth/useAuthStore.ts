import { create } from 'zustand'
import { api, parseApiUser, type ApiUser } from '@/shared/api/api'

type AuthState = {
  user: ApiUser | null
  isLoading: boolean
  error: string | null

  refreshMe: () => Promise<void>
  login: (dto: { email: string; password: string }) => Promise<boolean>
  register: (dto: { email: string; password: string; name: string }) => Promise<boolean>
  logout: () => Promise<void>

  changePassword: (dto: { currentPassword: string; newPassword: string }) => Promise<void>
  requestPasswordReset: (dto: { email: string }) => Promise<void>
  confirmPasswordReset: (dto: { token: string; newPassword: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  refreshMe: async () => {
    set({ isLoading: true, error: null })
    try {
      // После перезагрузки страницы access-token живёт только в памяти.
      // Если есть refresh-cookie — сначала восстанавливаем access-token.
      await api.auth.refresh()

      const me = await api.auth.me()
      set({ user: parseApiUser(me), isLoading: false })
    } catch (_e) {
      // если не авторизован — это ок
      void _e
      set({ user: null, isLoading: false, error: null })
    }
  },

  login: async (dto) => {
    set({ isLoading: true, error: null })
    try {
      await api.auth.login({ email: dto.email, password: dto.password })
      await get().refreshMe()
      set({ isLoading: false })
      return true
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Ошибка авторизации' })
      return false
    }
  },

  register: async (dto) => {
    set({ isLoading: true, error: null })
    try {
      await api.auth.register({ email: dto.email, password: dto.password, name: dto.name })
      await get().refreshMe()
      set({ isLoading: false })
      return true
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Ошибка регистрации' })
      return false
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      await api.auth.logout()
    } finally {
      set({ user: null, isLoading: false })
    }
  },

  changePassword: async (dto) => {
    set({ isLoading: true, error: null })
    try {
      await api.auth.changePassword({ currentPassword: dto.currentPassword, newPassword: dto.newPassword })
      await get().logout()
      set({ isLoading: false })
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Ошибка смены пароля' })
    }
  },

  requestPasswordReset: async (dto) => {
    set({ isLoading: true, error: null })
    try {
      await api.auth.requestPasswordReset({ email: dto.email })
      set({ isLoading: false })
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Ошибка восстановления пароля' })
    }
  },

  confirmPasswordReset: async (dto) => {
    set({ isLoading: true, error: null })
    try {
      await api.auth.confirmPasswordReset({ token: dto.token, newPassword: dto.newPassword })
      await get().logout()
      set({ isLoading: false })
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Ошибка восстановления пароля' })
    }
  },
}))
