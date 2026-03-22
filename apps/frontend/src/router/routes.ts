export const routes = {
  home: '/about',
  listings: '/listings',
  favorites: '/favorites',
  seller: '/seller/:id',
  admin: '/admin',
  login: '/auth/login',
  register: '/auth/register',
  requestPasswordReset: '/auth/request-password-reset',
  confirmPasswordReset: '/auth/reset-password',
  profile: '/profile',
  adCreate: '/ads/new',
  adView: '/ads/:type/:id',
  adEdit: '/ads/:type/:id/edit',
} as const

export type ListingType = 'products' | 'services' | 'jobs'
