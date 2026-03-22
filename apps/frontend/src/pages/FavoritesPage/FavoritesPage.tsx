import { Card, Carousel, Empty, Spin, Tabs, Typography, Button } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/api/api";
import "./FavoritesPage.css";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { DEFAULT_IMAGE } from "@/utils/constants";

const { Title } = Typography;

type FavoriteItem = {
  id?: number;
  title?: string;
  description?: string;
  price?: number;
  salary?: number;
  category?: string;
  userId?: number;
  photoUrls?: string[];
  createdAt?: string;
  currency?: string;
  type?: 'product' | 'service' | 'job' | 'resume';
  isFavorite?: boolean;
};

type FavoriteEntry = {
  productId?: number;
  serviceId?: number;
  jobId?: number;
};

function toFavoriteItems(payload: unknown): FavoriteEntry[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((x) =>
      typeof x === "object" && x !== null
        ? (x as Record<string, unknown>)
        : null
    )
    .filter((x): x is Record<string, unknown> => x !== null)
    .map((x) => ({
      productId: typeof x.productId === "number" ? x.productId : undefined,
      serviceId: typeof x.serviceId === "number" ? x.serviceId : undefined,
      jobId: typeof x.jobId === "number" ? x.jobId : undefined,
    }));
}

const formatPrice = (price?: number, salary?: number, currency?: string) => {
  const amount = typeof price === "number" ? price : salary;
  if (typeof amount !== "number") return null;

  const currencyMap: Record<string, string> = {
    RUB: 'RUB',
    BYN: 'BYN',
    UAH: 'UAH',
    KZT: 'KZT',
  };

  const curr = currency && currencyMap[currency] ? currencyMap[currency] : 'RUB';
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: curr,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (createdAt?: string) => {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  const now = new Date();
  
  // Получаем даты без времени для сравнения дней
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = nowOnly.getTime() - dateOnly.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) {
    return `Сегодня в ${timeStr}`;
  } else if (diffDays === 1) {
    return `Вчера в ${timeStr}`;
  } else if (diffDays < 365) {
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });
  } else {
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  }
};

export function FavoritesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<FavoriteItem[]>([]);
  const [services, setServices] = useState<FavoriteItem[]>([]);
  const [jobs, setJobs] = useState<FavoriteItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleFavorite = async (itemId: number, isFavorite: boolean, type: 'product' | 'service' | 'job') => {
    if (!user?.id) return;
    try {
      if (type === 'product') {
        if (isFavorite) {
          await (api.favorites as any)?.removeProduct?.(itemId);
        }
      } else if (type === 'service') {
        if (isFavorite) {
          await (api.favorites as any)?.removeService?.(itemId);
        }
      } else {
        if (isFavorite) {
          await (api.favorites as any)?.removeJob?.(itemId);
        }
      }
      
      // Обновляем состояние
      const updateItems = (items: FavoriteItem[]) => 
        items.filter(item => item.id !== itemId);
      
      if (type === 'product') {
        setProducts(prev => updateItems(prev));
      } else if (type === 'service') {
        setServices(prev => updateItems(prev));
      } else {
        setJobs(prev => updateItems(prev));
      }
    } catch (e) {
      console.error('Failed to remove from favorites:', e);
    }
  };

  const loadFavoriteProducts = async () => {
    if (!user?.id) return [];
    try {
      const response = await api.favorites.list();
      const favorites = toFavoriteItems(response);
      const productIds = favorites.filter(f => f.productId).map(f => f.productId!) as number[];

      if (productIds.length === 0) return [];

      const allProducts = await api.products.list() as Record<string, unknown>[];
      return allProducts
        .filter((p) => productIds.includes(p.id as number))
        .map((p) => ({
          id: p.id as number,
          title: p.title as string,
          description: p.description as string,
          price: p.price as number,
          photoUrls: (p.photoUrls as string[]) || [],
          createdAt: p.createdAt as string,
          currency: p.currency as string,
          type: 'product' as const,
          isFavorite: true,
        }));
    } catch {
      return [];
    }
  };

  const loadFavoriteServices = async () => {
    if (!user?.id) return [];
    try {
      const response = await api.favorites.list();
      const favorites = toFavoriteItems(response);
      const serviceIds = favorites.filter(f => f.serviceId).map(f => f.serviceId!) as number[];

      if (serviceIds.length === 0) return [];

      const allServices = await api.services.list() as Record<string, unknown>[];
      return allServices
        .filter((s) => serviceIds.includes(s.id as number))
        .map((s) => ({
          id: s.id as number,
          title: s.title as string,
          description: s.description as string,
          price: s.price as number,
          photoUrls: (s.photoUrls as string[]) || [],
          createdAt: s.createdAt as string,
          currency: s.currency as string,
          type: 'service' as const,
          isFavorite: true,
        }));
    } catch {
      return [];
    }
  };

  const loadFavoriteJobs = async () => {
    if (!user?.id) return [];
    try {
      const response = await api.favorites.list();
      const favorites = toFavoriteItems(response);
      const jobIds = favorites.filter(f => f.jobId).map(f => f.jobId!) as number[];

      if (jobIds.length === 0) return [];

      const allJobs = await api.jobs.list() as Record<string, unknown>[];
      return allJobs
        .filter((j) => jobIds.includes(j.id as number))
        .map((j) => ({
          id: j.id as number,
          title: j.title as string,
          description: j.description as string,
          salary: j.salary as number,
          photoUrls: (j.photoUrls as string[]) || [],
          createdAt: j.createdAt as string,
          currency: j.currency as string,
          type: 'job' as const,
          isFavorite: true,
        }));
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const [productsData, servicesData, jobsData] = await Promise.all([
          loadFavoriteProducts(),
          loadFavoriteServices(),
          loadFavoriteJobs(),
        ]);
        
        setProducts(productsData);
        setServices(servicesData);
        setJobs(jobsData);
      } catch (e) {
        setError('Не удалось загрузить избранные объявления');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const renderFavoritesList = (items: FavoriteItem[], type: 'product' | 'service' | 'job') => {
    if (items.length === 0) {
      return <Empty description="Нет избранных объявлений в этой категории" />;
    }

    return (
      <div className="favoritesPage__grid">
        {items.map((item, idx) => (
          <div
            key={item.id ?? `idx-${idx}`}
            className="favoritesPage__gridItem"
            onClick={(e) => {
              if (!item.id) return;
              if ((e.target as HTMLElement).closest(".favoritesPage__favoriteBtn")) {
                e.stopPropagation();
                return;
              }
              navigate(`/ads/${type}s/${item.id}`);
            }}
          >
            <Card hoverable className="favoritesPage__card">
              <div className="favoritesPage__imageWrap">
                {item.photoUrls && item.photoUrls.length > 0 ? (
                  <Carousel
                    className="favoritesPage__carousel"
                    dots
                    draggable
                    arrows
                  >
                    {item.photoUrls.map((url, i) => (
                      <div key={i} className="favoritesPage__slide">
                        <img
                          src={url}
                          className="favoritesPage__image"
                          alt={item.title || ""}
                        />
                      </div>
                    ))}
                  </Carousel>
                ) : (
                  <img
                    src={DEFAULT_IMAGE}
                    className="favoritesPage__image"
                    alt="Без изображения"
                  />
                )}
              </div>
              <div className="favoritesPage__cardFooter">
                <div className="favoritesPage__price">
                  {formatPrice(item.price, item.salary, item.currency)}
                </div>
                <Button
                  type="text"
                  className={`favoritesPage__favoriteBtn ${item.isFavorite ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.id) toggleFavorite(item.id, !!item.isFavorite, type);
                  }}
                  icon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={item.isFavorite ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  }
                />
              </div>
              <Title level={5} className="favoritesPage__cardTitle">
                {item.title || "Без названия"}
              </Title>
              <div className="favoritesPage__cardDate">
                {formatDate(item.createdAt)}
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  if (!user?.id) {
    return (
      <div className="favoritesPage">
        <Empty
          description="Для просмотра избранных объявлений необходимо войти в систему"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/auth/login')}>
            Войти
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="favoritesPage">
      <Title level={2} className="favoritesPage__title">Избранное</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Empty description={error} />
      ) : (
        <Tabs
          items={[
            {
              key: 'products',
              label: 'Товары',
              children: renderFavoritesList(products, 'product'),
            },
            {
              key: 'services',
              label: 'Услуги',
              children: renderFavoritesList(services, 'service'),
            },
            {
              key: 'jobs',
              label: 'Вакансии',
              children: renderFavoritesList(jobs, 'job'),
            },
          ]}
        />
      )}
    </div>
  );
}
