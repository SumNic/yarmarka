import {
  Card,
  Carousel,
  Input,
  Segmented,
  Space,
  Typography,
  Button,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ListingType } from "@/router/routes";
import { api } from "@/shared/api/api";
import "./ListingsPage.css";
import { DEFAULT_IMAGE } from "@/utils/constants";
import { useAuthStore } from "@/store/auth/useAuthStore";

const { Title, Text } = Typography;

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
};

function toListingItems(payload: unknown): ListingItem[] {
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
    }));
}

async function loadByType(type: ListingType) {
  if (type === "products") return api.products.list();
  if (type === "services") return api.services.list();
  return api.jobs.list();
}

export function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const initialType =
    (searchParams.get("type") as ListingType | null) ?? "products";

  const [type, setType] = useState<ListingType>(initialType);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ListingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    const diffMs = now.getTime() - date.getTime();
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
    setSearchParams((prev) => {
      prev.set("type", type);
      return prev;
    });
  }, [type, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await loadByType(type);
        if (cancelled) return;
        const itemsList = toListingItems(data);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => {
      const title = (x.title ?? "").toLowerCase();
      const description = (x.description ?? "").toLowerCase();
      return title.includes(q) || description.includes(q);
    });
  }, [items, query]);

  return (
    <div className="listingsPage">
      <Space className="listingsPage__top" orientation="vertical" size={12}>
        <Title level={3} className="listingsPage__title">
          Объявления
        </Title>

        <Space wrap>
          <Segmented<ListingType>
            value={type}
            options={[
              { label: "Товары", value: "products" },
              { label: "Услуги", value: "services" },
              { label: "Работа", value: "jobs" },
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
                window.location.href = `/ads/${type}/${item.id}`;
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
    </div>
  );
}
