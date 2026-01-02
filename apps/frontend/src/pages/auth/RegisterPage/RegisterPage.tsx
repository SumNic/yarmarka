import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { Link } from "react-router-dom";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/store/auth/useAuthStore";
import "./RegisterPage.css";
import { useEffect, useState } from "react";
import { ResendConfirmationStatus } from "@/utils/constants";

const { Title, Text } = Typography;

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export function RegisterPage() {
  const { register, isLoading, error, resendConfirmation, resendStatus } =
    useAuthStore();

  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [emailForResend, setEmailForResend] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const onFinish = async (values: RegisterFormValues) => {
    const success = await register(values);
    if (success) return setIsEmailNotVerified(true);
    setEmailForResend(values.email);
  };

  useEffect(() => {
      if (emailForResend && error === "EMAIL_EXISTS_NOT_VERIFIED") {      
      resendConfirmation(emailForResend);
    }
  }, [error]);

  // локальный таймер
  useEffect(() => {
    if (!resendStatus?.secondsLeft) return;

    setSecondsLeft(resendStatus.secondsLeft);

    const interval = setInterval(() => {
      setSecondsLeft((s) => (s && s > 1 ? s - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendStatus]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="registerPage">
      <Card className="registerPage__card">
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>
            Регистрация
          </Title>

          {error && error !== "EMAIL_EXISTS_NOT_VERIFIED" && (
            <Alert type="error" title={error} showIcon />
          )}

          {error === "EMAIL_EXISTS_NOT_VERIFIED" && (
            <Alert
              type="warning"
              showIcon
              title="Email уже зарегистрирован, но не подтверждён"
              description={
                resendStatus?.status !== ResendConfirmationStatus.COOLDOWN ? (
                  <Button
                    type="link"
                    onClick={() => resendConfirmation(emailForResend!)}
                  >
                    Отправить письмо ещё раз
                  </Button>
                ) : secondsLeft ? (
                  <Text type="secondary">
                    Повторная отправка возможна через {formatTime(secondsLeft)}
                  </Text>
                ) : (
                  <Button
                    type="link"
                    onClick={() => resendConfirmation(emailForResend!)}
                  >
                    Отправить письмо ещё раз
                  </Button>
                )
              }
            />
          )}

          {isEmailNotVerified ? (
            <Alert
              type="success"
              title={
                "Мы отправили письмо со ссылкой для подтверждения на ваш email. Перейдите по ссылке из письма, чтобы активировать аккаунт"
              }
              showIcon
            />
          ) : null}

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item name="name" label="Имя" rules={[{ required: true }]}>
              <Input placeholder="Иван" autoComplete="name" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="you@mail.ru" autoComplete="email" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
              />
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
  );
}
