import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import { useTheme } from './hooks/useTheme'

import './index.css'
import 'antd/dist/reset.css'

import App from './App.tsx'

const lightTheme = {
  token: {
    colorPrimary: '#2e7d32',
    colorLink: '#2e7d32',
    colorLinkHover: '#4caf50',
    colorLinkActive: '#1b5e20',
    borderRadius: 10,
    borderRadiusLG: 16,
    borderRadiusXL: 24,
    colorBgLayout: '#faf8f5',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorText: '#1a1a1a',
    colorTextSecondary: '#5a5a5a',
    colorBorder: '#e8e4e0',
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 15,
    lineHeight: 1.5,
    controlHeight: 42,
    controlHeightLG: 48,
    controlHeightSM: 34,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 10px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  components: {
    Button: {
      borderRadius: 10,
      algorithm: true,
    },
    Card: {
      borderRadius: 16,
      borderRadiusLG: 24,
    },
    Input: {
      borderRadius: 10,
      borderRadiusLG: 16,
    },
    Segmented: {
      borderRadius: 10,
    },
    Menu: {
      borderRadius: 10,
    },
  },
}

const darkTheme = {
  ...lightTheme,
  algorithm: theme.darkAlgorithm,
  token: {
    ...lightTheme.token,
    colorBgLayout: '#1a1a1a',
    colorBgContainer: '#242424',
    colorBgElevated: '#2a2a2a',
    colorText: '#e0e0e0',
    colorTextSecondary: '#b0b0b0',
    colorBorder: '#3a3a3a',
  },
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme()

  return (
    <ConfigProvider
      locale={ruRU}
      theme={isDark ? darkTheme : lightTheme}
    >
      {children}
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
