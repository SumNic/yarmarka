import { Alert, Button, Card, Form, Input, Space } from 'antd'
import { useAuthStore } from '@/store/auth/useAuthStore'

type FormValues = {
  currentPassword: string
  newPassword: string
}

export function ChangePasswordForm() {
  const { changePassword, isLoading, error } = useAuthStore()

  const onFinish = async (values: FormValues) => {
    await changePassword(values)
  }

  return (
    <Card title="Смена пароля">
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="currentPassword" label="Текущий пароль" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Новый пароль"
            rules={[{ required: true, min: 6, message: 'Минимум 6 символов' }]}
          >
            <Input.Password placeholder="••••••••" autoComplete="new-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isLoading}>
            Сменить пароль
          </Button>
        </Form>
      </Space>
    </Card>
  )
}
