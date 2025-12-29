import { Alert, Button, Card, Form, Input, InputNumber, Segmented, Space, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ListingType } from '@/router/routes'
import { routes } from '@/router/routes'
import { api } from '@/shared/api/api'
import { useAuthStore } from '@/store/auth/useAuthStore'
import './AdEditorPage.css'

const { Title, Text } = Typography

type Props = {
  mode: 'create' | 'edit'
}

type FormValues = {
  type: ListingType
  title: string
  description?: string
  category?: string
  price?: number
  salary?: number
}

function ensureListingType(value: unknown): ListingType {
  return value === 'services' || value === 'jobs' ? value : 'products'
}

export function AdEditorPage(props: Props) {
  const navigate = useNavigate()
  const params = useParams()
  const { user, refreshMe } = useAuthStore()

  const [form] = Form.useForm<FormValues>()

  const mode = props.mode
  const typeFromParams = ensureListingType(params.type)
  const idFromParams = params.id ? Number(params.id) : undefined

  const [type, setType] = useState<ListingType>(typeFromParams)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const canEdit = Boolean(user?.id)

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  useEffect(() => {
    if (mode === 'create') {
      form.setFieldsValue({ type, title: '', description: '', category: '', price: undefined, salary: undefined })
    }
  }, [mode, form, type])

  const showPrice = useMemo(() => type === 'products' || type === 'services', [type])
  const showSalary = useMemo(() => type === 'jobs', [type])

  useEffect(() => {
    if (mode !== 'edit') return
    if (!idFromParams) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      if (typeFromParams === 'products') return api.products.get(idFromParams)
      if (typeFromParams === 'services') return api.services.get(idFromParams)
      return api.jobs.get(idFromParams)
    }

    load()
      .then((data) => {
        if (cancelled) return
        const x = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
        const title = typeof x.title === 'string' ? x.title : ''
        const description = typeof x.description === 'string' ? x.description : ''
        const category = typeof x.category === 'string' ? x.category : ''
        const price = typeof x.price === 'number' ? x.price : undefined
        const salary = typeof x.salary === 'number' ? x.salary : undefined

        setType(typeFromParams)
        form.setFieldsValue({ type: typeFromParams, title, description, category, price, salary })
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Не удалось загрузить объявление')
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [mode, idFromParams, typeFromParams, form])

  const onSubmit = async (values: FormValues) => {
    setError(null)

    if (!user?.id) {
      setError('Нужно войти, чтобы создавать/редактировать объявления')
      return
    }

    setIsLoading(true)
    try {
      if (values.type === 'products') {
        if (mode === 'create') {
          await api.products.create({
            title: values.title,
            description: values.description,
            category: values.category,
            price: values.price ?? 0,
            userId: user.id,
            photoUrls: [],
          })
        } else if (idFromParams) {
          await api.products.update(idFromParams, {
            title: values.title,
            description: values.description,
            category: values.category,
            price: values.price,
            userId: user.id,
          })
        }
      }

      if (values.type === 'services') {
        if (mode === 'create') {
          await api.services.create({
            title: values.title,
            description: values.description,
            category: values.category,
            price: values.price,
            userId: user.id,
          })
        } else if (idFromParams) {
          await api.services.update(idFromParams, {
            title: values.title,
            description: values.description,
            category: values.category,
            price: values.price,
            userId: user.id,
          })
        }
      }

      if (values.type === 'jobs') {
        if (mode === 'create') {
          await api.jobs.create({
            title: values.title,
            description: values.description,
            category: values.category,
            salary: values.salary,
            userId: user.id,
          })
        } else if (idFromParams) {
          await api.jobs.update(idFromParams, {
            title: values.title,
            description: values.description,
            category: values.category,
            salary: values.salary,
            userId: user.id,
          })
        }
      }

      navigate(routes.listings)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="adEditorPage">
      <Card loading={isLoading}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            {mode === 'create' ? 'Создать объявление' : 'Редактировать объявление'}
          </Title>

          {!canEdit ? (
            <Alert
              type="warning"
              showIcon
              message="Нужно войти, чтобы размещать объявления"
              action={
                <Button size="small" type="primary" onClick={() => navigate(routes.login)}>
                  Войти
                </Button>
              }
            />
          ) : null}

          {error ? <Alert type="error" message={error} showIcon /> : null}

          <Form<FormValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{ type, title: '' }}
            onFinish={onSubmit}
          >
            <Form.Item label="Тип" name="type" rules={[{ required: true }]}>
              <Segmented<ListingType>
                value={type}
                options={[
                  { label: 'Товары', value: 'products' },
                  { label: 'Услуги', value: 'services' },
                  { label: 'Работа', value: 'jobs' },
                ]}
                onChange={(v) => {
                  setType(v)
                  form.setFieldValue('type', v)
                }}
              />
            </Form.Item>

            <Form.Item name="title" label="Название" rules={[{ required: true }]}>
              <Input placeholder="Например: Мёд липовый / Плотник на сезон" />
            </Form.Item>

            <Form.Item name="description" label="Описание">
              <Input.TextArea rows={5} placeholder="Коротко и по делу. Людям важно понять, кто вы и что предлагаете." />
            </Form.Item>

            <Form.Item name="category" label="Категория">
              <Input placeholder="Еда / Строительство / Обучение..." />
            </Form.Item>

            {showPrice ? (
              <Form.Item name="price" label="Цена">
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            ) : null}

            {showSalary ? (
              <Form.Item name="salary" label="Оплата">
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            ) : null}

            <Space wrap>
              <Button type="primary" htmlType="submit" disabled={!canEdit} loading={isLoading}>
                Сохранить
              </Button>
              <Button onClick={() => navigate(-1)}>Назад</Button>
              <Text type="secondary">
                Родовая Ярмарка — про ясность и доверие: лучше меньше текста, но честно.
              </Text>
            </Space>
          </Form>
        </Space>
      </Card>
    </div>
  )
}
