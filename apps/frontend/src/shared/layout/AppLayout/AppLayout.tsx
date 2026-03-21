import { useState } from 'react'
import { Layout, Menu, Typography, Button, Space, Drawer } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { routes } from '@/router/routes'
import { useAuthStore } from '@/store/auth/useAuthStore'
import './AppLayout.css'

const { Header, Content, Footer } = Layout

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems: MenuProps['items'] = [
    { key: routes.home, label: 'Главная' },
    { key: routes.listings, label: 'Объявления' },
    { key: routes.support, label: 'Техподдержка' },
  ]

  const authButtons = user ? (
    <Space size="small">
      <Button type="primary" size="small" onClick={() => navigate(routes.profile)}>
        {user.name || 'Профиль'}
      </Button>
    </Space>
  ) : (
    <Space size="small">
      <Button size="small" onClick={() => navigate(routes.login)}>
        Войти
      </Button>
      <Button type="primary" size="small" onClick={() => navigate(routes.register)}>
        Регистрация
      </Button>
    </Space>
  )

  const selectedKeys = menuItems
    ?.map((i) => i?.key)
    .filter((key): key is string => typeof key === 'string')
    .filter((key) => location.pathname === key || location.pathname.startsWith(key + '/'))

  const handleMenuClick = (key: string) => {
    navigate(key)
    setMobileMenuOpen(false)
  }

  return (
    <Layout className="appLayout">
      <Header className="appLayout__header">
        <div className="appLayout__brand" onClick={() => navigate(routes.home)}>
          <span className="appLayout__brandIcon">🌿</span>
          <Typography.Text className="appLayout__brandText">Родовая Ярмарка</Typography.Text>
        </div>
        <Menu
          className="appLayout__menu"
          mode="horizontal"
          theme="light"
          selectedKeys={selectedKeys?.length ? selectedKeys : [routes.home]}
          items={menuItems}
          onClick={(e) => navigate(e.key)}
        />
        <Button
          className="appLayout__mobile-menu-btn"
          type="text"
          size="large"
          onClick={() => setMobileMenuOpen(true)}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          }
        />
        <Drawer
          title="Меню"
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
        >
          <Menu
            mode="vertical"
            theme="light"
            selectedKeys={selectedKeys?.length ? selectedKeys : [routes.home]}
            items={menuItems}
            onClick={(e) => handleMenuClick(e.key)}
          />
          <div style={{ marginTop: 16 }}>{authButtons}</div>
        </Drawer>
        {authButtons}
      </Header>

      <Content className="appLayout__content">
        <Outlet />
      </Content>

      <Footer className="appLayout__footer">
        <Typography.Text type="secondary">Родовая ярмарка — место встречи людей, хозяйств и семей.</Typography.Text>
      </Footer>
    </Layout>
  )
}
