import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { useState } from "react";
import "./SupportPage.css";
import type { components } from "@/utils/api";
import { api } from "@/shared/api/api";

const { Title, Paragraph, Text } = Typography;

export function SupportPage() {
  const [isSent, setIsSent] = useState(false);
  const [sendMessageError, setSendMessageError] = useState<string | null>(null);

  const onFinish = async (
    values: components["schemas"]["SupportMessageDto"]
  ) => {
    setSendMessageError(null);
    try {
      await api.support.sendMessage(values);
      setIsSent(true);
    } catch (e) {
      setSendMessageError(
        e instanceof Error ? e.message : "Не удалось загрузить объявления"
      );
    }
  };

  return (
    <div className="supportPage">
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <Card>
          <Title level={3} style={{ margin: 0 }}>
            Техподдержка
          </Title>
          <Paragraph style={{ marginTop: 8 }}>
            Если вопрос срочный — напишите сообщение, мы увидим его и свяжемся.
          </Paragraph>
        </Card>

        <Card>
          {isSent ? (
            <Alert
              type="success"
              showIcon
              title="Сообщение принято. Спасибо!"
            />
          ) : null}
          {sendMessageError ? (
            <Alert
              type="error"
              showIcon
              title={`${sendMessageError}` || "Не удалось отправить сообщение"}
            />
          ) : null}

          {!isSent && !sendMessageError && (
            <Form
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              style={{ marginTop: 12 }}
            >
              <Form.Item
                name="message"
                label="Сообщение"
                rules={[{ required: true }]}
              >
                <Input.TextArea
                  rows={6}
                  placeholder="Опишите проблему или предложение."
                />
              </Form.Item>
              <Space wrap>
                <Button type="primary" htmlType="submit">
                  Отправить
                </Button>
                <Text type="secondary">
                  В будущем здесь появится база знаний и FAQ.
                </Text>
              </Space>
            </Form>
          )}
        </Card>
      </Space>
    </div>
  );
}
