import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { routes } from '@/router/routes'
import { useAuthStore } from '@/store/auth/useAuthStore'
import './LoginPage.css'

const { Title, Text } = Typography

type LoginFormValues = {
  email: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()

  const onFinish = async (values: LoginFormValues) => {
    const success = await login(values)    
    if (success) navigate(routes.profile)
    
  }

  return (
    <div className="loginPage">
      <Card className="loginPage__card">
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            Вход
          </Title>

          {error ? <Alert type="error" title={error} showIcon /> : null}

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="you@mail.ru" autoComplete="email" />
            </Form.Item>
            <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
              <Input.Password placeholder="••••••••" autoComplete="current-password" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={isLoading} block>
              Войти
            </Button>
          </Form>

          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            <Text type="secondary">
              Нет аккаунта? <Link to={routes.register}>Регистрация</Link>
            </Text>
            <Text type="secondary">
              Забыли пароль? <Link to={routes.requestPasswordReset}>Восстановить</Link>
            </Text>
          </Space>
        </Space>
      </Card>
    </div>
  )
}
