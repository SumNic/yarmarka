import { Avatar, Button, Card, Descriptions, Empty, Space, Spin, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/shared/api/api";
import "./SellerProfilePage.css";

const { Title, Text } = Typography;

type AdItem = {
  id?: number;
  title?: string;
  description?: string;
  price?: number | string;
  photoUrls?: string[];
  type?: 'product' | 'service' | 'job' | 'resume';
};

type SellerData = {
  id?: number;
  name?: string;
  photoUrl?: string | null;
  about?: string | null;
  country?: string;
  region?: string;
  district?: string;
  settlement?: string;
  estate?: string;
};

export function SellerProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [products, setProducts] = useState<AdItem[]>([]);
  const [services, setServices] = useState<AdItem[]>([]);
  const [jobs, setJobs] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load seller info
        const sellerData = await api.users.get(Number(id));
        setSeller(sellerData as unknown as SellerData);

        // Load seller's ads
        const [productsData, servicesData, jobsData] = await Promise.all([
          api.products.list(),
          api.services.list(),
          api.jobs.list(),
        ]);

        // Filter by userId
        const userId = Number(id);
        setProducts(
          (productsData as any[]).filter(p => p.userId === userId).map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: p.price,
            photoUrls: p.photoUrls,
            type: 'product' as const,
          }))
        );
        setServices(
          (servicesData as any[]).filter(s => s.userId === userId).map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            price: s.price,
            photoUrls: s.photoUrls,
            type: 'service' as const,
          }))
        );
        setJobs(
          (jobsData as any[]).filter(j => j.userId === userId).map(j => ({
            id: j.id,
            title: j.title,
            description: j.description,
            price: j.salary,
            photoUrls: j.photoUrls,
            type: 'job' as const,
          }))
        );
      } catch (e) {
        setError('Не удалось загрузить данные продавца');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const renderAdsList = (items: AdItem[], type: 'product' | 'service' | 'job') => {
    if (items.length === 0) {
      return <Empty description="Нет объявлений в этой категории" />;
    }

    return (
      <div className="sellerProfilePage__grid">
        {items.map((item, idx) => (
          <div
            key={item.id ?? `idx-${idx}`}
            className="sellerProfilePage__gridItem"
            onClick={() => {
              if (item.id) {
                navigate(`/ads/${type}s/${item.id}`);
              }
            }}
          >
            <Card hoverable className="sellerProfilePage__card">
              <div className="sellerProfilePage__imageWrap">
                {item.photoUrls && item.photoUrls.length > 0 ? (
                  <img
                    src={item.photoUrls[0]}
                    alt={item.title || ''}
                    className="sellerProfilePage__image"
                  />
                ) : (
                  <div className="sellerProfilePage__imagePlaceholder">
                    {type === 'product' ? '📦' : type === 'service' ? '🛠️' : '💼'}
                  </div>
                )}
              </div>
              <div className="sellerProfilePage__cardBody">
                <Title level={5} className="sellerProfilePage__cardTitle" ellipsis={{ rows: 2 }}>
                  {item.title || 'Без названия'}
                </Title>
                {item.price && (
                  <Text strong className="sellerProfilePage__price">
                    {typeof item.price === 'number' ? item.price.toLocaleString('ru-RU') : item.price} ₽
                  </Text>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="sellerProfilePage">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="sellerProfilePage">
        <Empty description={error || 'Продавец не найден'} />
      </div>
    );
  }

  return (
    <div className="sellerProfilePage">
      <Card className="sellerProfilePage__header">
        <div className="sellerProfilePage__profile">
          <div className="sellerProfilePage__avatar">
            {seller.photoUrl ? (
              <img src={seller.photoUrl} alt={seller.name || 'Аватар'} />
            ) : (
              <div className="sellerProfilePage__avatarPlaceholder">
                {(seller.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="sellerProfilePage__info">
            <Title level={2} className="sellerProfilePage__name">{seller.name || 'Без имени'}</Title>
            {seller.about && (
              <Text className="sellerProfilePage__about">{seller.about}</Text>
            )}
          </div>
        </div>

        <Descriptions column={2} size="small" className="sellerProfilePage__location">
          {seller.country && (
            <Descriptions.Item label="Страна">{seller.country}</Descriptions.Item>
          )}
          {seller.region && (
            <Descriptions.Item label="Регион">{seller.region}</Descriptions.Item>
          )}
          {seller.district && (
            <Descriptions.Item label="Район">{seller.district}</Descriptions.Item>
          )}
          {seller.settlement && (
            <Descriptions.Item label="Поселение">{seller.settlement}</Descriptions.Item>
          )}
          {seller.estate && (
            <Descriptions.Item label="Родовое поместье">{seller.estate}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Объявления продавца" className="sellerProfilePage__ads">
        <Tabs
          items={[
            {
              key: 'products',
              label: 'Товары',
              children: renderAdsList(products, 'product'),
            },
            {
              key: 'services',
              label: 'Услуги',
              children: renderAdsList(services, 'service'),
            },
            {
              key: 'jobs',
              label: 'Вакансии',
              children: renderAdsList(jobs, 'job'),
            },
          ]}
        />
      </Card>
    </div>
  );
}
