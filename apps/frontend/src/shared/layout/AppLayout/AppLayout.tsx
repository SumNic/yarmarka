import { Layout, Menu, Typography, Button, Space } from 'antd'
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
