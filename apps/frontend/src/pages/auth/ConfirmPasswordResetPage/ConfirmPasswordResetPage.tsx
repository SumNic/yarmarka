import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { routes } from '@/router/routes'
import { useAuthStore } from '@/store/auth/useAuthStore'

const { Title, Text } = Typography

type FormValues = {
  newPassword: string
}

export function ConfirmPasswordResetPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])

  const { confirmPasswordReset, isLoading, error } = useAuthStore()
  const [isDone, setIsDone] = useState(false)

  const onFinish = async (values: FormValues) => {
    await confirmPasswordReset({ token, newPassword: values.newPassword })
    setIsDone(true)
  }

  const isTokenMissing = !token

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <Card style={{ width: 420, maxWidth: '100%' }}>
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            Установка нового пароля
          </Title>

          {isTokenMissing ? (
            <Alert type="error" showIcon title="Ссылка некорректна: отсутствует токен." />
          ) : null}

          {error ? <Alert type="error" title={error} showIcon /> : null}

          {isDone ? (
            <Alert
              type="success"
              showIcon
              title="Пароль обновлён. Теперь вы можете войти с новым паролем."
              action={
                <Button type="primary" size="small" onClick={() => navigate(routes.login)}>
                  Войти
                </Button>
              }
            />
          ) : (
            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item
                name="newPassword"
                label="Новый пароль"
                rules={[{ required: true, min: 6, message: 'Минимум 6 символов' }]}
              >
                <Input.Password placeholder="••••••••" autoComplete="new-password" disabled={isTokenMissing} />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={isLoading} block disabled={isTokenMissing}>
                Сохранить пароль
              </Button>
            </Form>
          )}

          <Text type="secondary">
            <Link to={routes.login}>Вернуться ко входу</Link>
          </Text>
        </Space>
      </Card>
    </div>
  )
}
