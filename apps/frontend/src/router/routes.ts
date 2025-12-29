export const routes = {
  home: '/',
  listings: '/listings',
  login: '/auth/login',
  register: '/auth/register',
  requestPasswordReset: '/auth/request-password-reset',
  confirmPasswordReset: '/auth/reset-password',
  profile: '/profile',
  adCreate: '/ads/new',
  adEdit: '/ads/:type/:id/edit',
  support: '/support',
} as const

export type ListingType = 'products' | 'services' | 'jobs'
