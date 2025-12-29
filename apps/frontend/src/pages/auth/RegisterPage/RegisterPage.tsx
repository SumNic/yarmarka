import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { routes } from '@/router/routes'
import { useAuthStore } from '@/store/auth/useAuthStore'
import './RegisterPage.css'

const { Title, Text } = Typography

type RegisterFormValues = {
  name: string
  email: string
  password: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()

  const onFinish = async (values: RegisterFormValues) => {
    const success = await register(values)
    if (success) navigate(routes.profile)
  }

  return (
    <div className="registerPage">
      <Card className="registerPage__card">
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            Регистрация
          </Title>

          {error ? <Alert type="error" title={error} showIcon /> : null}

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item name="name" label="Имя" rules={[{ required: true }]}>
              <Input placeholder="Иван" autoComplete="name" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="you@mail.ru" autoComplete="email" />
            </Form.Item>
            <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Минимум 6 символов" autoComplete="new-password" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={isLoading} block>
              Создать аккаунт
            </Button>
          </Form>

          <Text type="secondary">
            Уже есть аккаунт? <Link to={routes.login}>Войти</Link>
          </Text>
        </Space>
      </Card>
    </div>
  )
}
