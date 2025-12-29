import { Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { routes } from '@/router/routes'
import './AppLayout.css'

const { Header, Content, Footer } = Layout

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const items: MenuProps['items'] = [
    { key: routes.home, label: 'Главная' },
    { key: routes.listings, label: 'Объявления' },
    { key: routes.support, label: 'Техподдержка' },
    { key: routes.profile, label: 'Профиль' },
  ]

  const selectedKeys = items
    ?.map((i) => i?.key)
    .filter((key): key is string => typeof key === 'string')
    .filter((key) => location.pathname === key || location.pathname.startsWith(key + '/'))

  return (
    <Layout className="appLayout">
      <Header className="appLayout__header">
        <div className="appLayout__brand" onClick={() => navigate(routes.home)}>
          <Typography.Text className="appLayout__brandText">Родовая Ярмарка</Typography.Text>
        </div>
        <Menu
          className="appLayout__menu"
          mode="horizontal"
          theme="dark"
          selectedKeys={selectedKeys?.length ? selectedKeys : [routes.home]}
          items={items}
          onClick={(e) => navigate(e.key)}
        />
      </Header>

      <Content className="appLayout__content">
        <Outlet />
      </Content>

      <Footer className="appLayout__footer">
        <Typography.Text type="secondary">Живая ярмарка — место встречи людей, хозяйств и семей.</Typography.Text>
      </Footer>
    </Layout>
  )
}
