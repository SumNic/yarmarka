import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'

import './index.css'
import 'antd/dist/reset.css'

import App from './App.tsx'

const antdTheme = {
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={ruRU}
      theme={antdTheme}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
