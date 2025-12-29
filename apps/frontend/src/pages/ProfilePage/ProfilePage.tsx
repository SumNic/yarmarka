import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Space,
  Typography,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/router/routes";
import { api } from "@/shared/api/api";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { ChangePasswordForm } from "./ChangePasswordForm";
import "./ProfilePage.css";

const { Title, Text } = Typography;

type ProfileFormValues = {
  name?: string;
  country?: string;
  region?: string;
  district?: string;
  settlement?: string;
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading, error, refreshMe, logout } = useAuthStore();

  const [form] = Form.useForm<ProfileFormValues>();
  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const initialValues = useMemo<ProfileFormValues>(() => {
    return {
      name: user?.name,
      country: user?.country,
      region: user?.region,
      district: user?.district,
      settlement: user?.settlement,
    };
  }, [user]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue(initialValues);
  }, [form, initialValues, user]);

  async function handleSave() {
    if (!user?.id) return;

    setSaveError(null);
    setIsSaving(true);

    try {
      const values = await form.validateFields();

      await api.users.update(user.id, {
        name: values.name,
        country: values.country,
        region: values.region,
        district: values.district,
        settlement: values.settlement,
      });

      setIsEdit(false);
      await refreshMe();
    } catch (e) {
      if (e instanceof Error) {
        setSaveError(e.message);
      } else if (typeof e === "string") {
        setSaveError(e);
      } else {
        // validateFields кидает объект, если ошибки валидации — это не показываем как "ошибка сохранения"
        setSaveError(null);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    form.setFieldsValue(initialValues);
    setSaveError(null);
    setIsEdit(false);
  }

  const uploadProps: UploadProps = {
    accept: 'image/jpeg,image/png,image/webp',
    showUploadList: false,
    disabled: isUploadingPhoto || isLoading,
    beforeUpload: (file) => {
      const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

      if (!allowedTypes.has(file.type)) {
        setPhotoError('Поддерживаются только JPEG, PNG или WEBP')
        return false
      }

      const maxSizeBytes = 5 * 1024 * 1024
      if (file.size > maxSizeBytes) {
        setPhotoError('Максимальный размер файла — 5 МБ')
        return false
      }

      void (async () => {
        if (!user?.id) return

        setPhotoError(null)
        setIsUploadingPhoto(true)

        try {
          const res = await api.users.uploadPhoto(user.id, file as File)
          await api.users.update(user.id, { photoUrl: res.url })
          await refreshMe()
        } catch (e) {
          setPhotoError(e instanceof Error ? e.message : 'Не удалось загрузить фото')
        } finally {
          setIsUploadingPhoto(false)
        }
      })()

      return false
    },
  }

  if (isLoading && !user) {
    return (
      <div className="profilePage">
        <Card loading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profilePage">
        <Card>
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            <Title level={3} style={{ margin: 0 }}>
              Профиль
            </Title>
            <Text type="secondary">Нужно войти, чтобы увидеть профиль.</Text>
            <Space wrap>
              <Button type="primary" onClick={() => navigate(routes.login)}>
                Войти
              </Button>
              <Button onClick={() => navigate(routes.register)}>
                Регистрация
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div className="profilePage">
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <Card>
          <Space
            align="center"
            wrap
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Space align="center">
              <Space align="center" size={12}>
                <Upload {...uploadProps}>
                  <div className="profileAvatar">
                    <Avatar
                      size={64}
                      src={user.photoUrl}
                      className="profileAvatar__image"
                    >
                      {(user.name ?? "U").slice(0, 1).toUpperCase()}
                    </Avatar>

                    <div className="profileAvatar__overlay">
                      <span>Изменить</span>
                    </div>
                  </div>
                </Upload>
              </Space>

              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {user.name ?? "Пользователь"}
                </Title>
                <Text type="secondary">{user.email ?? ""}</Text>
              </div>
            </Space>
            <Space wrap>
              <Button onClick={() => navigate(routes.adCreate)}>
                Создать объявление
              </Button>
              <Button danger loading={isLoading} onClick={() => logout()}>
                Выйти
              </Button>
            </Space>
          </Space>
        </Card>

        {error ? <Alert type="error" title={error} showIcon /> : null}
        {photoError ? <Alert type="error" title={photoError} showIcon /> : null}
        {saveError ? <Alert type="error" title={saveError} showIcon /> : null}

        <Card
          title="Данные"
          extra={
            <Space wrap>
              {isEdit ? (
                <>
                  <Button onClick={handleCancel} disabled={isSaving}>
                    Отмена
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleSave}
                    loading={isSaving}
                  >
                    Сохранить
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEdit(true)}>Редактировать</Button>
              )}
            </Space>
          }
        >
          {isEdit ? (
            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues}
              requiredMark={false}
            >
              <Form.Item
                label="Имя"
                name="name"
                rules={[{ max: 120, message: "Максимум 120 символов" }]}
              >
                <Input placeholder="Как к вам обращаться" />
              </Form.Item>

              <Form.Item
                label="Страна"
                name="country"
                rules={[{ max: 120, message: "Максимум 120 символов" }]}
              >
                <Input placeholder="Например: Россия" />
              </Form.Item>

              <Form.Item
                label="Регион"
                name="region"
                rules={[{ max: 120, message: "Максимум 120 символов" }]}
              >
                <Input placeholder="Например: Московская область" />
              </Form.Item>

              <Form.Item
                label="Район"
                name="district"
                rules={[{ max: 120, message: "Максимум 120 символов" }]}
              >
                <Input placeholder="Например: Истринский" />
              </Form.Item>

              <Form.Item
                label="Поселение"
                name="settlement"
                rules={[{ max: 200, message: "Максимум 200 символов" }]}
              >
                <Input placeholder="Название поселения (если есть)" />
              </Form.Item>

              <Descriptions column={1} size="small">
                <Descriptions.Item label="Email подтверждён">
                  {user.isEmailVerified ? "Да" : "Нет"}
                </Descriptions.Item>
              </Descriptions>
            </Form>
          ) : (
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Страна">
                {user.country ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Регион">
                {user.region ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Район">
                {user.district ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Поселение">
                {user.settlement ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Email подтверждён">
                {user.isEmailVerified ? "Да" : "Нет"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>

        <ChangePasswordForm />
      </Space>
    </div>
  );
}
