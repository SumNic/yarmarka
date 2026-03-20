import {
  Button,
  Card,
  Carousel,
  Col,
  Image,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ListingType } from "@/router/routes";
import { api } from "@/shared/api/api";
import { DEFAULT_IMAGE } from "@/utils/constants";
import "./AdViewPage.css";

const { Title, Text } = Typography;

type AdData = {
  id?: number;
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  salary?: number;
  photoUrls?: string[];
};

function ensureListingType(value: unknown): ListingType {
  return value === "services" || value === "jobs" ? value : "products";
}

export function AdViewPage() {
  const navigate = useNavigate();
  const params = useParams();

  const type = ensureListingType(params.type);
  const id = params.id ? Number(params.id) : null;

  const [data, setData] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      if (type === "products") return api.products.get(id);
      if (type === "services") return api.services.get(id);
      return api.jobs.get(id);
    };

    load()
      .then((res) => {
        if (cancelled) return;

        const x =
          typeof res === "object" && res !== null
            ? (res as Record<string, unknown>)
            : {};

        setData({
          id: typeof x.id === "number" ? x.id : undefined,
          title: typeof x.title === "string" ? x.title : undefined,
          description:
            typeof x.description === "string" ? x.description : undefined,
          category:
            typeof x.category === "string" ? x.category : undefined,
          price: typeof x.price === "number" ? x.price : undefined,
          salary: typeof x.salary === "number" ? x.salary : undefined,
          photoUrls: Array.isArray(x.photoUrls)
            ? x.photoUrls.filter(
                (u): u is string => typeof u === "string"
              )
            : [],
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Не удалось загрузить объявление"
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, type]);

  if (loading) {
    return (
      <div className="adViewPage__loading">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="adViewPage__error">
        <Text type="danger">{error ?? "Объявление не найдено"}</Text>
      </div>
    );
  }

  return (
    <div className="adViewPage">
      <Row className="adViewPage__row" gutter={[24, 24]}>
        <Col xs={24} md={12} className="adViewPage__col">
          <div className="adViewPage__carouselWrapper">
            {data.photoUrls && data.photoUrls.length > 0 ? (
              <Image.PreviewGroup>
                <Carousel
                  className="adViewPage__carousel"
                  dots
                  draggable
                  arrows
                >
                  {data.photoUrls.map((url, i) => (
                    <div key={i} className="adViewPage__slide">
                      <div className="adViewPage__imageWrap">
                        <img
                          src={url}
                          className="adViewPage__image"
                          alt=""
                        />
                      </div>
                    </div>
                  ))}
                </Carousel>
              </Image.PreviewGroup>
            ) : (
              <div className="adViewPage__slide">
                <div className="adViewPage__imageWrap">
                  <img
                    src={DEFAULT_IMAGE}
                    className="adViewPage__image"
                    alt=""
                  />
                </div>
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={12} className="adViewPage__col">
          <Card className="adViewPage__card">
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Title level={3} className="adViewPage__title">{data.title || "Без названия"}</Title>

              {data.category && (
                <span className="adViewPage__category">Категория: {data.category}</span>
              )}

              {typeof data.price === "number" ? (
                <Title level={4} className="adViewPage__price">Цена: {data.price}</Title>
              ) : typeof data.salary === "number" ? (
                <Title level={4} className="adViewPage__price">Оплата: {data.salary}</Title>
              ) : null}

              {data.description ? (
                <div className="adViewPage__description">{data.description}</div>
              ) : (
                <Text type="secondary">Описание не указано</Text>
              )}

              <Space className="adViewPage__actions">
                <Button className="adViewPage__backBtn" onClick={() => navigate(-1)}>Назад</Button>
                <Button
                  className="adViewPage__editBtn"
                  type="primary"
                  onClick={() =>
                    navigate(`/ads/${type}/${data.id}/edit`)
                  }
                >
                  Редактировать
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
