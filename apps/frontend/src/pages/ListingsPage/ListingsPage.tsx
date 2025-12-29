import { Button, Card, Col, Input, Row, Segmented, Space, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ListingType } from '@/router/routes'
import { routes } from '@/router/routes'
import { api } from '@/shared/api/api'
import './ListingsPage.css'

const { Title, Text } = Typography

type ListingItem = {
  id?: number
  title?: string
  description?: string
  price?: number
  salary?: number
  category?: string
  userId?: number
}

function toListingItems(payload: unknown): ListingItem[] {
  if (!Array.isArray(payload)) return []
  return payload
    .map((x) => (typeof x === 'object' && x !== null ? (x as Record<string, unknown>) : null))
    .filter((x): x is Record<string, unknown> => x !== null)
    .map((x) => ({
      id: typeof x.id === 'number' ? x.id : undefined,
      title: typeof x.title === 'string' ? x.title : undefined,
      description: typeof x.description === 'string' ? x.description : undefined,
      price: typeof x.price === 'number' ? x.price : undefined,
      salary: typeof x.salary === 'number' ? x.salary : undefined,
      category: typeof x.category === 'string' ? x.category : undefined,
      userId: typeof x.userId === 'number' ? x.userId : undefined,
    }))
}

async function loadByType(type: ListingType) {
  if (type === 'products') return api.products.list()
  if (type === 'services') return api.services.list()
  return api.jobs.list()
}

export function ListingsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialType = (searchParams.get('type') as ListingType | null) ?? 'products'

  const [type, setType] = useState<ListingType>(initialType)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ListingItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set('type', type)
      return prev
    })
  }, [type, setSearchParams])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const data = await loadByType(type)
        if (cancelled) return
        setItems(toListingItems(data))
        setError(null)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Не удалось загрузить объявления')
        setItems([])
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [type])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((x) => {
      const title = (x.title ?? '').toLowerCase()
      const description = (x.description ?? '').toLowerCase()
      return title.includes(q) || description.includes(q)
    })
  }, [items, query])

  return (
    <div className="listingsPage">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Space className="listingsPage__top" direction="vertical" size={12}>
            <Title level={3} className="listingsPage__title">
              Объявления
            </Title>

            <Space wrap>
              <Segmented<ListingType>
                value={type}
                options={[
                  { label: 'Товары', value: 'products' },
                  { label: 'Услуги', value: 'services' },
                  { label: 'Работа', value: 'jobs' },
                ]}
                onChange={(v) => setType(v)}
              />
              <Input
                className="listingsPage__search"
                placeholder="Поиск по названию или описанию"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                allowClear
              />
              <Button type="primary" onClick={() => navigate(routes.adCreate)}>
                Создать объявление
              </Button>
            </Space>

            {error ? <Text type="danger">{error}</Text> : null}
          </Space>
        </Col>

        <Col xs={24}>
          <Row gutter={[16, 16]}>
            {filtered.map((item, idx) => (
              <Col key={item.id ?? `idx-${idx}`} xs={24} md={12} lg={8}>
                  <Card
                  title={item.title || 'Без названия'}

                  extra={
                    item.id ? (
                      <Button
                        size="small"
                        onClick={() => navigate(`/ads/${type}/${item.id}/edit`)}
                        disabled={!item.id}
                      >
                        Редактировать
                      </Button>
                    ) : null
                  }
                >
                  {item.category ? <div className="listingsPage__meta">Категория: {item.category}</div> : null}
                  {typeof item.price === 'number' ? (
                    <div className="listingsPage__meta">Цена: {item.price}</div>
                  ) : typeof item.salary === 'number' ? (
                    <div className="listingsPage__meta">Оплата: {item.salary}</div>
                  ) : null}
                  {item.description ? (
                    <div className="listingsPage__desc">{item.description}</div>
                  ) : (
                    <div className="listingsPage__desc listingsPage__desc--empty">Описание не указано</div>
                  )}
                </Card>
              </Col>
            ))}

            {filtered.length === 0 ? (
              <Col xs={24}>
                <Card>
                  <Text type="secondary">Пока нет объявлений. Вы можете создать первое.</Text>
                </Card>
              </Col>
            ) : null}
          </Row>
        </Col>
      </Row>
    </div>
  )
}
