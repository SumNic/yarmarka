import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useState } from 'react'
import './SupportPage.css'

const { Title, Paragraph, Text } = Typography

type SupportFormValues = {
  email: string
  message: string
}

export function SupportPage() {
  const [isSent, setIsSent] = useState(false)

  const onFinish = async (_values: SupportFormValues) => {
    // На этом этапе бэкенд-эндпоинта нет — оставляем как мягкую заглушку.
    void _values
    setIsSent(true)
  }

  return (
    <div className="supportPage">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <Title level={3} style={{ margin: 0 }}>
            Техподдержка
          </Title>
          <Paragraph style={{ marginTop: 8 }}>
            На раннем этапе страница полезна, чтобы собрать обратную связь и снизить фрустрацию пользователей.
          </Paragraph>
          <Paragraph>
            Если вопрос срочный — напишите сообщение, мы увидим его и свяжемся. (Пока форма работает как заглушка —
            дальше подключим реальный канал.)
          </Paragraph>
        </Card>

        <Card>
          {isSent ? <Alert type="success" showIcon message="Сообщение принято. Спасибо!" /> : null}

          <Form layout="vertical" onFinish={onFinish} requiredMark={false} style={{ marginTop: 12 }}>
            <Form.Item name="email" label="Email для ответа" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="you@mail.ru" />
            </Form.Item>
            <Form.Item name="message" label="Сообщение" rules={[{ required: true }]}>
              <Input.TextArea rows={6} placeholder="Опишите проблему или предложение." />
            </Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit">
                Отправить
              </Button>
              <Text type="secondary">В будущем здесь появится база знаний и FAQ.</Text>
            </Space>
          </Form>
        </Card>
      </Space>
    </div>
  )
}
