import { Alert, Button, Card, Empty, Form, Input, Select, Space, Spin, Tabs, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/api/api";
import { useAuthStore } from "@/store/auth/useAuthStore";
import "./AdminPage.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

type LocationItem = {
  country: string;
  region?: string;
  locality?: string;
};

type SubcategoryItem = {
  name: string;
  type: 'product' | 'service' | 'job';
};

export function AdminPage() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [locationsForm] = Form.useForm();
  const [subcategoriesForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      await refreshMe();
      setLoading(false);
    };
    checkAdmin();
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!loading && user) {
      const isAdmin = user.roles?.some(r => r.value === 'ADMIN');
      if (!isAdmin) {
        message.error('Доступ только для администраторов');
        navigate('/listings');
      }
    }
  }, [user, loading, navigate]);

  const handleLocationsSubmit = async (values: { locationsJson: string }) => {
    setSubmitting(true);
    try {
      const locations = JSON.parse(values.locationsJson);
      if (!Array.isArray(locations)) {
        throw new Error('Должен быть массив объектов');
      }
      await api.locations.create(locations);
      message.success('Локации добавлены');
      locationsForm.resetFields();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Ошибка добавления локаций');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubcategoriesSubmit = async (values: { subcategoriesJson: string }) => {
    setSubmitting(true);
    try {
      const subcategories = JSON.parse(values.subcategoriesJson);
      if (!Array.isArray(subcategories)) {
        throw new Error('Должен быть массив объектов');
      }
      await api.subcategories.create(subcategories);
      message.success('Подкатегории добавлены');
      subcategoriesForm.resetFields();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Ошибка добавления подкатегорий');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="adminPage">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="adminPage">
        <Empty description="Доступ только для авторизованных пользователей">
          <Button type="primary" onClick={() => navigate('/auth/login')}>
            Войти
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="adminPage">
      <Title level={2}>Панель администратора</Title>

      <Tabs
        items={[
          {
            key: 'locations',
            label: 'Локации',
            children: (
              <Card title="Добавить локации" className="adminPage__card">
                <Form
                  form={locationsForm}
                  layout="vertical"
                  onFinish={handleLocationsSubmit}
                  requiredMark={false}
                >
                  <Alert
                    message="Формат данных"
                    description={
                      <pre style={{ margin: 0, fontSize: '12px' }}>
{`[
  {"country": "Россия", "region": "Московская область", "locality": "Истринский"},
  {"country": "Россия", "region": "Чувашия", "locality": "Алатырский"}
]`}
                      </pre>
                    }
                    type="info"
                    style={{ marginBottom: 16 }}
                  />

                  <Form.Item
                    label="JSON с локациями"
                    name="locationsJson"
                    rules={[
                      { required: true, message: 'Введите JSON' },
                      () => ({
                        validator: (_, value) => {
                          try {
                            JSON.parse(value);
                            return Promise.resolve();
                          } catch {
                            return Promise.reject(new Error('Некорректный JSON'));
                          }
                        },
                      }),
                    ]}
                  >
                    <TextArea rows={8} placeholder='[{"country": "Россия", "region": "...", "locality": "..."}]' />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                      Добавить
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'subcategories',
            label: 'Подкатегории',
            children: (
              <Card title="Добавить подкатегории" className="adminPage__card">
                <Form
                  form={subcategoriesForm}
                  layout="vertical"
                  onFinish={handleSubcategoriesSubmit}
                  requiredMark={false}
                >
                  <Alert
                    message="Формат данных"
                    description={
                      <pre style={{ margin: 0, fontSize: '12px' }}>
{`[
  {"name": "Эко-товары", "type": "product"},
  {"name": "Консультации", "type": "service"},
  {"name": "Разнорабочий", "type": "job"}
]`}
                      </pre>
                    }
                    type="info"
                    style={{ marginBottom: 16 }}
                  />

                  <Form.Item
                    label="JSON с подкатегориями"
                    name="subcategoriesJson"
                    rules={[
                      { required: true, message: 'Введите JSON' },
                      () => ({
                        validator: (_, value) => {
                          try {
                            JSON.parse(value);
                            return Promise.resolve();
                          } catch {
                            return Promise.reject(new Error('Некорректный JSON'));
                          }
                        },
                      }),
                    ]}
                  >
                    <TextArea rows={8} placeholder='[{"name": "...", "type": "product|service|job"}]' />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                      Добавить
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
