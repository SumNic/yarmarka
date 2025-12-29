import { Alert, Avatar, Button, Card, Descriptions, Space, Typography } from 'antd'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '@/router/routes'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { ChangePasswordForm } from './ChangePasswordForm'
import './ProfilePage.css'

const { Title, Text } = Typography

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, isLoading, error, refreshMe, logout } = useAuthStore()

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  if (isLoading && !user) {
    return (
      <div className="profilePage">
        <Card loading />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profilePage">
        <Card>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Title level={3} style={{ margin: 0 }}>
              Профиль
            </Title>
            <Text type="secondary">Нужно войти, чтобы увидеть профиль.</Text>
            <Space wrap>
              <Button type="primary" onClick={() => navigate(routes.login)}>
                Войти
              </Button>
              <Button onClick={() => navigate(routes.register)}>Регистрация</Button>
            </Space>
          </Space>
        </Card>
      </div>
    )
  }

  return (
    <div className="profilePage">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <Space align="center" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space align="center">
              <Avatar size={64} src={user.photoUrl}>
                {(user.name ?? 'U').slice(0, 1).toUpperCase()}
              </Avatar>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {user.name ?? 'Пользователь'}
                </Title>
                <Text type="secondary">{user.email ?? ''}</Text>
              </div>
            </Space>
            <Space wrap>
              <Button onClick={() => navigate(routes.adCreate)}>Создать объявление</Button>
              <Button danger loading={isLoading} onClick={() => logout()}>
                Выйти
              </Button>
            </Space>
          </Space>
        </Card>

        {error ? <Alert type="error" message={error} showIcon /> : null}

        <Card title="Данные">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Страна">{user.country ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Регион">{user.region ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Район">{user.district ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Поселение">{user.settlement ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Email подтверждён">{user.isEmailVerified ? 'Да' : 'Нет'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <ChangePasswordForm />
      </Space>
    </div>
  )
}
