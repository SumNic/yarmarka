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
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ListingType } from "@/router/routes";
import { api } from "@/shared/api/api";
import { DEFAULT_IMAGE } from "@/utils/constants";
import { useAuthStore } from "@/store/auth/useAuthStore";
import "./AdViewPage.css";

const { Title, Text } = Typography;

type AdData = {
  id?: number;
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  salary?: number;
  currency?: string;
  photoUrls?: string[];
  userId?: number;
};

type UserContactData = {
  id?: number;
  name?: string;
  phone?: string | null;
  contactEmail?: string | null;
  email?: string;
  photoUrl?: string | null;
  about?: string | null;
  country?: string;
  region?: string;
  district?: string;
  settlement?: string;
  estate?: string;
};

function ensureListingType(value: unknown): ListingType {
  return value === "services" || value === "jobs" ? value : "products";
}

const currencySymbols: Record<string, string> = {
  RUB: '₽',
  BYN: 'Br',
  UAH: '₴',
  KZT: '₸',
};

function formatPrice(amount: number, currency?: string): string {
  const symbol = currency ? currencySymbols[currency] || currency : '₽';
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + symbol;
}

export function AdViewPage() {
  const navigate = useNavigate();
  const params = useParams();
  const user = useAuthStore((state) => state.user);

  const type = ensureListingType(params.type);
  const id = params.id ? Number(params.id) : null;

  const [data, setData] = useState<AdData | null>(null);
  const [seller, setSeller] = useState<UserContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactType, setContactType] = useState<'phone' | 'email' | null>(null);
  const [contactRevealed, setContactRevealed] = useState(false);

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
      .then(async (res) => {
        if (cancelled) return;

        const x =
          typeof res === "object" && res !== null
            ? (res as Record<string, unknown>)
            : {};

        const adData: AdData = {
          id: typeof x.id === "number" ? x.id : undefined,
          title: typeof x.title === "string" ? x.title : undefined,
          description:
            typeof x.description === "string" ? x.description : undefined,
          category:
            typeof x.category === "string" ? x.category : undefined,
          price: typeof x.price === "number" ? x.price : undefined,
          salary: typeof x.salary === "number" ? x.salary : undefined,
          currency: typeof x.currency === "string" ? x.currency : undefined,
          photoUrls: Array.isArray(x.photoUrls)
            ? x.photoUrls.filter(
                (u): u is string => typeof u === "string"
              )
            : [],
          userId: typeof x.userId === "number" ? x.userId : undefined,
        };

        setData(adData);

        // Load seller info
        if (adData.userId) {
          try {
            const sellerData = await api.users.get(adData.userId);
            if (!cancelled) {
              setSeller(sellerData as unknown as UserContactData);
            }
          } catch (e) {
            console.error('Failed to load seller info:', e);
          }
        }

        // Check if favorite
        if (user?.id) {
          try {
            let checkFn;
            if (type === "products") checkFn = api.favorites.checkProduct;
            else if (type === "services") checkFn = api.favorites.checkService;
            else checkFn = api.favorites.checkJob;
            
            if (checkFn && adData.id) {
              const result = await checkFn(adData.id);
              if (!cancelled) {
                setIsFavorite(!!result.isFavorite);
              }
            }
          } catch (e) {
            console.error('Failed to check favorite:', e);
          }
        }
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
  }, [id, type, user?.id]);

  const handleFavoriteClick = async () => {
    if (!user?.id || !data?.id) return;
    
    setFavoriteLoading(true);
    try {
      let actionFn;
      if (type === "products") {
        actionFn = isFavorite ? api.favorites.removeProduct : api.favorites.addProduct;
      } else if (type === "services") {
        actionFn = isFavorite ? api.favorites.removeService : api.favorites.addService;
      } else {
        actionFn = isFavorite ? api.favorites.removeJob : api.favorites.addJob;
      }
      
      if (actionFn) {
        await actionFn(data.id);
        setIsFavorite(!isFavorite);
      }
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleContactClick = (type: 'phone' | 'email') => {
    setContactType(type);
    setContactRevealed(false);
    setContactModalOpen(true);
  };

  const handleRevealContact = () => {
    setContactRevealed(true);
  };

  const handleCallClick = () => {
    if (seller?.phone) {
      window.location.href = `tel:${seller.phone.replace(/\s/g, '')}`;
    }
  };

  const handleWriteClick = () => {
    if (seller?.contactEmail || seller?.email) {
      const email = seller.contactEmail || seller.email;
      const subject = encodeURIComponent(`По поводу объявления: ${data?.title}`);
      window.location.href = `mailto:${email}?subject=${subject}`;
    }
  };

  const getContactValue = () => {
    if (!seller) return '';
    if (contactType === 'phone') return seller.phone || 'Не указан';
    if (contactType === 'email') return seller.contactEmail || seller.email || 'Не указан';
    return '';
  };

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

  const showPrice = typeof data.price === "number" || typeof data.salary === "number";
  const priceValue = typeof data.price === "number" ? data.price : data.salary;
  const priceLabel = typeof data.price === "number" ? "Цена:" : "Оплата:";

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
              <div className="adViewPage__header">
                <Title level={3} className="adViewPage__title">{data.title || "Без названия"}</Title>
                <Button
                  type="text"
                  className={`adViewPage__favoriteBtn ${isFavorite ? 'active' : ''}`}
                  onClick={handleFavoriteClick}
                  loading={favoriteLoading}
                  disabled={!user}
                  icon={
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={isFavorite ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  }
                />
              </div>

              {data.category && (
                <span className="adViewPage__category">Категория: {data.category}</span>
              )}

              {showPrice && (
                <Title level={4} className="adViewPage__price">
                  {priceLabel} {formatPrice(priceValue || 0, data.currency)}
                </Title>
              )}

              <div className="adViewPage__contacts">
                <Space wrap>
                  {seller?.phone && (
                    <Button
                      type="primary"
                      className="adViewPage__contactBtn"
                      onClick={() => handleContactClick('phone')}
                    >
                      Позвонить
                    </Button>
                  )}
                  {(seller?.contactEmail || seller?.email) && (
                    <Button
                      className="adViewPage__contactBtn"
                      onClick={() => handleContactClick('email')}
                    >
                      Написать
                    </Button>
                  )}
                </Space>
              </div>

              {data.description ? (
                <div className="adViewPage__description">
                  <Title level={5}>Описание</Title>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{data.description}</div>
                </div>
              ) : (
                <Text type="secondary">Описание не указано</Text>
              )}

              {/* Блок с информацией о создателе */}
              {seller && (
                <div className="adViewPage__sellerInfo">
                  <Title level={5}>О создателе объявления</Title>
                  <div className="adViewPage__sellerCard">
                    <div className="adViewPage__sellerAvatar">
                      {seller.photoUrl ? (
                        <img src={seller.photoUrl} alt={seller.name || 'Аватар'} />
                      ) : (
                        <div className="adViewPage__sellerAvatarPlaceholder">
                          {(seller.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="adViewPage__sellerDetails">
                      <Text strong className="adViewPage__sellerName">{seller.name || 'Без имени'}</Text>
                      {seller.about && (
                        <Text className="adViewPage__sellerAbout">{seller.about}</Text>
                      )}
                      <Button
                        type="primary"
                        size="small"
                        className="adViewPage__sellerAdsBtn"
                        onClick={() => navigate(`/seller/${seller.id}`)}
                      >
                        Все объявления
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Space className="adViewPage__actions">
                {data.userId === user?.id && (
                  <Button
                    className="adViewPage__editBtn"
                    type="primary"
                    onClick={() =>
                      navigate(`/ads/${type}/${data.id}/edit`)
                    }
                  >
                    Редактировать
                  </Button>
                )}
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title={contactType === 'phone' ? 'Телефон' : 'Email'}
        open={contactModalOpen}
        onCancel={() => setContactModalOpen(false)}
        footer={null}
        centered
      >
        <div className="adViewPage__contactModal">
          {!contactRevealed ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text style={{ display: 'block', marginBottom: '16px' }}>
                Нажмите кнопку, чтобы показать {contactType === 'phone' ? 'телефон' : 'email'}
              </Text>
              <Button
                type="primary"
                size="large"
                onClick={handleRevealContact}
              >
                Показать {contactType === 'phone' ? 'телефон' : 'email'}
              </Button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text strong style={{ fontSize: '18px', display: 'block', marginBottom: '16px' }}>
                {getContactValue()}
              </Text>
              {contactType === 'phone' && seller?.phone && (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleCallClick}
                  block
                >
                  Позвонить
                </Button>
              )}
              {contactType === 'email' && (seller?.contactEmail || seller?.email) && (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleWriteClick}
                  block
                >
                  Написать письмо
                </Button>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
