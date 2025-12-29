import { Navigate, Route, Routes } from 'react-router-dom'
import { routes } from './routes'

import { AppLayout } from '@/shared/layout/AppLayout/AppLayout'
import { HomePage } from '@/pages/HomePage/HomePage'
import { ListingsPage } from '@/pages/ListingsPage/ListingsPage'
import { LoginPage } from '@/pages/auth/LoginPage/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage/RegisterPage'
import { RequestPasswordResetPage } from '@/pages/auth/RequestPasswordResetPage/RequestPasswordResetPage'
import { ConfirmPasswordResetPage } from '@/pages/auth/ConfirmPasswordResetPage/ConfirmPasswordResetPage'
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage'
import { AdEditorPage } from '@/pages/AdEditorPage/AdEditorPage'
import { SupportPage } from '@/pages/SupportPage/SupportPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.listings} element={<ListingsPage />} />
        <Route path={routes.login} element={<LoginPage />} />
        <Route path={routes.register} element={<RegisterPage />} />
        <Route path={routes.requestPasswordReset} element={<RequestPasswordResetPage />} />
        <Route path={routes.confirmPasswordReset} element={<ConfirmPasswordResetPage />} />
        <Route path={routes.profile} element={<ProfilePage />} />
        <Route path={routes.adCreate} element={<AdEditorPage mode="create" />} />
        <Route path={routes.adEdit} element={<AdEditorPage mode="edit" />} />
        <Route path={routes.support} element={<SupportPage />} />

        <Route path="*" element={<Navigate to={routes.home} replace />} />
      </Route>
    </Routes>
  )
}
