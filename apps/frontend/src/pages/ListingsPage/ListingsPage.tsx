import {
  Button,
  Card,
  Carousel,
  Input,
  Segmented,
  Space,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ListingType } from "@/router/routes";
import { routes } from "@/router/routes";
import { api } from "@/shared/api/api";
import "./ListingsPage.css";
import { DEFAULT_IMAGE } from "@/utils/constants";

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
    }));
}

async function loadByType(type: ListingType) {
  if (type === "products") return api.products.list();
  if (type === "services") return api.services.list();
  return api.jobs.list();
}

export function ListingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialType =
    (searchParams.get("type") as ListingType | null) ?? "products";

  const [type, setType] = useState<ListingType>(initialType);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ListingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        setItems(toListingItems(data));
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
          <Button type="primary" onClick={() => navigate(routes.adCreate)}>
            Создать объявление
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
              onClick={() => {
                if (!item.id) return;
                navigate(`/ads/${type}/${item.id}`);
              }}
            >
              <Card hoverable className="listingsPage__card">
                <div className="listingsPage__imageWrap">
                  {item.photoUrls && item.photoUrls.length > 0 ? (
                    <Carousel
                      className="adView__carousel"
                      dots
                      draggable
                      arrows
                    >
                      {item.photoUrls.map((url, i) => (
                        <div key={i} className="adView__slide">
                          <div className="adView__imageWrap">
                            <img
                              src={url}
                              className="adView__image"
                              alt={item.title || ""}
                            />
                          </div>
                        </div>
                      ))}
                    </Carousel>
                  ) : (
                    <div className="adView__imageWrap">
                      <img
                        src={DEFAULT_IMAGE}
                        className="adView__image"
                        alt="Без изображения"
                      />
                    </div>
                  )}
                </div>
                <Title level={5} style={{ marginBottom: 4 }}>
                  {item.title || "Без названия"}
                </Title>
                {typeof item.price === "number" ? (
                  <div className="listingsPage__price">Цена: {item.price}</div>
                ) : typeof item.salary === "number" ? (
                  <div className="listingsPage__price">
                    Оплата: {item.salary}
                  </div>
                ) : null}
              </Card>
            </div>
          ))
        ) : (
          <div className="listingsPage__gridItem">
            <Card>
              <Text type="secondary">
                Пока нет объявлений. Вы можете создать первое.
              </Text>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
