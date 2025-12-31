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

const { Title, Text, Paragraph } = Typography;

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
      <div style={{ padding: 48, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: 48 }}>
        <Text type="danger">{error ?? "Объявление не найдено"}</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          {data.photoUrls && data.photoUrls.length > 0 ? (
            <Image.PreviewGroup>
              <Carousel
                className="adView__carousel"
                dots
                draggable
                arrows
              >
                {data.photoUrls.map((url, i) => (
                  <div key={i} className="adView__slide">
                    <div className="adView__imageWrap">
                      <img
                        src={url}
                        className="adView__image"
                        alt=""
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            </Image.PreviewGroup>
          ) : (
            <div className="adView__imageWrap">
              <img
                src={DEFAULT_IMAGE}
                className="adView__image"
                alt=""
              />
            </div>
          )}
        </Col>

        <Col xs={24} md={12}>
          <Card>
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Title level={3}>{data.title || "Без названия"}</Title>

              {data.category && (
                <Text type="secondary">Категория: {data.category}</Text>
              )}

              {typeof data.price === "number" ? (
                <Title level={4}>Цена: {data.price}</Title>
              ) : typeof data.salary === "number" ? (
                <Title level={4}>Оплата: {data.salary}</Title>
              ) : null}

              {data.description ? (
                <Paragraph>{data.description}</Paragraph>
              ) : (
                <Text type="secondary">Описание не указано</Text>
              )}

              <Space>
                <Button onClick={() => navigate(-1)}>Назад</Button>
                <Button
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
