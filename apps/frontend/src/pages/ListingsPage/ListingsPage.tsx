import {
  Button,
  Card,
  Carousel,
  Drawer,
  Input,
  Segmented,
  Select,
  Space,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ListingType } from "@/router/routes";
import { api } from "@/shared/api/api";
import "./ListingsPage.css";
import { DEFAULT_IMAGE } from "@/utils/constants";
import { useAuthStore } from "@/store/auth/useAuthStore";

const { Title, Text } = Typography;

type ListingTypeExtended = ListingType | 'all';

type ListingItem = {
  id?: number;
  title?: string;
  description?: string;
  price?: number;
  salary?: number;
  category?: string;
  userId?: number;
  photoUrls?: string[];
  createdAt?: string;
  isFavorite?: boolean;
  currency?: string;
  type?: ListingType;
};

function toListingItems(payload: unknown, type?: ListingType): ListingItem[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((x) =>
      typeof x === "object" && x !== null
        ? (x as Record<string, unknown>)
        : null
    )
    .filter((x): x is Record<string, unknown> => x !== null)
    .map((x) => ({
      id: typeof x.id === "number" ? x.id : undefined,
      title: typeof x.title === "string" ? x.title : undefined,
      description:
        typeof x.description === "string" ? x.description : undefined,
      price: typeof x.price === "number" ? x.price : undefined,
      salary: typeof x.salary === "number" ? x.salary : undefined,
      category: typeof x.category === "string" ? x.category : undefined,
      userId: typeof x.userId === "number" ? x.userId : undefined,
      photoUrls: Array.isArray(x.photoUrls)
        ? x.photoUrls.filter((u): u is string => typeof u === "string")
        : [],
      createdAt: typeof x.createdAt === "string" ? x.createdAt : undefined,
      currency: typeof x.currency === "string" ? x.currency : undefined,
      type: (x._adType as ListingType) || type,
    }));
}

async function loadByType(type: ListingTypeExtended) {
  if (type === "products") {
    const data = await api.products.list();
    return { data, type: "products" as ListingType };
  }
  if (type === "services") {
    const data = await api.services.list();
    return { data, type: "services" as ListingType };
  }
  if (type === "jobs") {
    const data = await api.jobs.list();
    return { data, type: "jobs" as ListingType };
  }
  // Для 'all' загружаем все объявления с указанием типа
  const [products, services, jobs] = await Promise.all([
    api.products.list(),
    api.services.list(),
    api.jobs.list(),
  ]);
  
  // Добавляем тип к каждому объявлению
  const productsWithType = (products as any[]).map(p => ({ ...p, _adType: 'products' }));
  const servicesWithType = (services as any[]).map(s => ({ ...s, _adType: 'services' }));
  const jobsWithType = (jobs as any[]).map(j => ({ ...j, _adType: 'jobs' }));
  
  return { 
    data: [...productsWithType, ...servicesWithType, ...jobsWithType], 
    type: null // смешанный тип
  };
}

export function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const initialType =
    (searchParams.get("type") as ListingTypeExtended | null) ?? "all";

  const [type, setType] = useState<ListingTypeExtended>(initialType);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ListingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{
    country?: string;
    region?: string;
    district?: string;
    subcategory?: string;
  }>({});
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<{ name: string }[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(false);

  const loadFavorites = async (itemsList: ListingItem[]) => {
    if (!user?.id) return itemsList;
    try {
      const favs = await Promise.all(
        itemsList
          .filter((item) => item.id)
          .map(async (item) => {
            let isFav = false;
            try {
              if (type === "products") {
                const res = await (api.favorites as any)?.checkProduct?.(item.id!);
                isFav = res?.isFavorite;
              } else if (type === "services") {
                const res = await (api.favorites as any)?.checkService?.(item.id!);
                isFav = res?.isFavorite;
              } else {
                const res = await (api.favorites as any)?.checkJob?.(item.id!);
                isFav = res?.isFavorite;
              }
            } catch {
              // ignore
            }
            return { ...item, isFavorite: isFav };
          })
      );
      return favs;
    } catch {
      return itemsList;
    }
  };

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
    
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
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

  const toggleFavorite = async (itemId: number, isFavorite: boolean) => {
    if (!user?.id) return;
    try {
      if (type === "products") {
        if (isFavorite) {
          await (api.favorites as any)?.removeProduct?.(itemId);
        } else {
          await (api.favorites as any)?.addProduct?.(itemId);
        }
      } else if (type === "services") {
        if (isFavorite) {
          await (api.favorites as any)?.removeService?.(itemId);
        } else {
          await (api.favorites as any)?.addService?.(itemId);
        }
      } else {
        if (isFavorite) {
          await (api.favorites as any)?.removeJob?.(itemId);
        } else {
          await (api.favorites as any)?.addJob?.(itemId);
        }
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isFavorite: !isFavorite } : item
        )
      );
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await loadByType(type);
        if (cancelled) return;
        
        const itemsList = toListingItems(result.data);
        const itemsWithFavs = await loadFavorites(itemsList);
        if (cancelled) return;
        setItems(itemsWithFavs);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Не удалось загрузить объявления"
        );
        setItems([]);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [type]);

  // Load filter data
  useEffect(() => {
    const loadFilterData = async () => {
      setFiltersLoading(true);
      try {
        const [countriesData, subcategoriesData] = await Promise.all([
          api.locations.getCountries(),
          type === 'all' 
            ? api.subcategories.list()
            : type === 'products'
            ? api.subcategories.getProducts()
            : type === 'services'
            ? api.subcategories.getServices()
            : api.subcategories.getJobs(),
        ]);
        setCountries(countriesData);
        setSubcategories(subcategoriesData as { name: string }[]);
      } catch (e) {
        console.error('Failed to load filter data:', e);
      } finally {
        setFiltersLoading(false);
      }
    };
    loadFilterData();
  }, [type]);

  useEffect(() => {
    // Load regions when country changes in filter
    const country = filters.country;
    if (!country) {
      setRegions([]);
      return;
    }

    const loadRegions = async () => {
      try {
        const regionsData = await api.locations.getRegionsByCountry(country);
        setRegions(regionsData);
      } catch (e) {
        console.error('Failed to load regions:', e);
        setRegions([]);
      }
    };
    loadRegions();
  }, [filters.country]);

  const filtered = useMemo(() => {
    let result = items;

    // Search query filter
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((x) => {
        const title = (x.title ?? "").toLowerCase();
        const description = (x.description ?? "").toLowerCase();
        return title.includes(q) || description.includes(q);
      });
    }

    // Location filters
    if (filters.country) {
      result = result.filter((x) => x.userId); // TODO: filter by actual user country
    }
    if (filters.region) {
      result = result.filter((x) => x.userId); // TODO: filter by actual user region
    }
    if (filters.district) {
      result = result.filter((x) => x.userId); // TODO: filter by actual user district
    }

    // Subcategory filter
    if (filters.subcategory) {
      result = result.filter((x) => x.category === filters.subcategory);
    }

    return result;
  }, [items, query, filters]);

  return (
    <div className="listingsPage">
      <Space className="listingsPage__top" orientation="vertical" size={12}>
        <Title level={3} className="listingsPage__title">
          Объявления
        </Title>

        <Space wrap>
          <Segmented<ListingTypeExtended>
            value={type}
            options={[
              { label: "Все", value: "all" },
              { label: "Товары", value: "products" },
              { label: "Услуги", value: "services" },
              { label: "Работа", value: "jobs" },
            ]}
            onChange={(v) => {
              setType(v);
              setSearchParams(v === "all" ? {} : { type: v });
            }}
          />
          <Input
            className="listingsPage__search"
            placeholder="Поиск по названию или описанию"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            allowClear
          />
          <Button onClick={() => setFilterOpen(true)}>
            Фильтры
          </Button>
        </Space>

        {error ? <Text type="danger">{error}</Text> : null}
      </Space>

      <div className="listingsPage__grid">
        {filtered.length > 0 ? (
          filtered.map((item, idx) => (
            <div
              key={item.id ?? `idx-${idx}`}
              className="listingsPage__gridItem"
              onClick={(e) => {
                if (!item.id) return;
                if ((e.target as HTMLElement).closest(".listingsPage__favoriteBtn")) {
                  e.stopPropagation();
                  return;
                }
                const urlType = item.type || 'products';
                window.location.href = `/ads/${urlType}/${item.id}`;
              }}
            >
              <Card hoverable className="listingsPage__card">
                <div className="listingsPage__imageWrap">
                  {item.photoUrls && item.photoUrls.length > 0 ? (
                    <Carousel
                      className="listingsPage__carousel"
                      dots
                      draggable
                      arrows
                    >
                      {item.photoUrls.map((url, i) => (
                        <div key={i} className="listingsPage__slide">
                          <img
                            src={url}
                            className="listingsPage__image"
                            alt={item.title || ""}
                          />
                        </div>
                      ))}
                    </Carousel>
                  ) : (
                    <img
                      src={DEFAULT_IMAGE}
                      className="listingsPage__image"
                      alt="Без изображения"
                    />
                  )}
                </div>
                <div className="listingsPage__cardFooter">
                  <div className="listingsPage__price">
                    {formatPrice(item.price, item.salary, item.currency)}
                  </div>
                  <Button
                    type="text"
                    className={`listingsPage__favoriteBtn ${item.isFavorite ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.id) toggleFavorite(item.id, !!item.isFavorite);
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
                <Title level={5} className="listingsPage__cardTitle">
                  {item.title || "Без названия"}
                </Title>
                <div className="listingsPage__cardDate">
                  {formatDate(item.createdAt)}
                </div>
              </Card>
            </div>
          ))
        ) : (
          <div className="listingsPage__empty">
            <Text type="secondary">
              Пока нет объявлений. Вы можете создать первое.
            </Text>
          </div>
        )}
      </div>

      <Drawer
        title="Фильтры"
        placement="right"
        onClose={() => setFilterOpen(false)}
        open={filterOpen}
        size={360}
      >
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Местоположение</Text>
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Select
                placeholder="Страна"
                allowClear
                showSearch
                style={{ width: '100%' }}
                options={countries.map(c => ({ label: c, value: c }))}
                value={filters.country}
                onChange={(value) => setFilters({ ...filters, country: value, region: undefined, district: undefined })}
                loading={filtersLoading}
              />
              <Select
                placeholder="Регион"
                allowClear
                showSearch
                style={{ width: '100%' }}
                disabled={!filters.country}
                options={regions.map(r => ({ label: r, value: r }))}
                value={filters.region}
                onChange={(value) => setFilters({ ...filters, region: value, district: undefined })}
                loading={filtersLoading}
              />
              <Input
                placeholder="Район"
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              />
            </Space>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Подкатегория</Text>
            <Select
              placeholder="Выберите подкатегорию"
              allowClear
              showSearch
              style={{ width: '100%' }}
              options={subcategories.map(s => ({ label: s.name, value: s.name }))}
              value={filters.subcategory}
              onChange={(value) => setFilters({ ...filters, subcategory: value })}
              loading={filtersLoading}
            />
          </div>

          <Space style={{ width: '100%' }} orientation="vertical">
            <Button
              type="primary"
              block
              onClick={() => {
                // Apply filters - TODO: implement actual filtering logic
                setFilterOpen(false);
              }}
            >
              Применить
            </Button>
            <Button
              block
              onClick={() => {
                setFilters({});
                setFilterOpen(false);
              }}
            >
              Сбросить
            </Button>
          </Space>
        </Space>
      </Drawer>
    </div>
  );
}
