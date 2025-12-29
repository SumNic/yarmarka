import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '@/router/routes'
import { useAuthStore } from '@/store/auth/useAuthStore'

const { Title, Text } = Typography

type FormValues = {
  email: string
}

export function RequestPasswordResetPage() {
  const { requestPasswordReset, isLoading, error } = useAuthStore()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const onFinish = async (values: FormValues) => {
    await requestPasswordReset(values)
    setIsSubmitted(true)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <Card style={{ width: 420, maxWidth: '100%' }}>
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            Восстановление пароля
          </Title>

          {error ? <Alert type="error" title={error} showIcon /> : null}

          {isSubmitted ? (
            <Alert
              type="success"
              showIcon
              title="Если такой email зарегистрирован, мы отправили письмо со ссылкой для восстановления."
            />
          ) : (
            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="you@mail.ru" autoComplete="email" />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={isLoading} block>
                Отправить ссылку
              </Button>
            </Form>
          )}

          <Text type="secondary">
            Вспомнили пароль? <Link to={routes.login}>Войти</Link>
          </Text>
        </Space>
      </Card>
    </div>
  )
}
