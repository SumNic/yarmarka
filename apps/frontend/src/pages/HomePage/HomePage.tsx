import { Button, Card, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { routes } from '@/router/routes'
import './HomePage.css'

const { Title, Paragraph } = Typography

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="homePage">
      {/* Hero Section */}
      <div className="homePage__hero">
        <div className="homePage__heroContent">
          <span className="homePage__icon">🌾</span>
          <Title level={1} className="homePage__title">
            Родовая Ярмарка
          </Title>
          <Paragraph className="homePage__subtitle">
            Онлайн‑пространство объявлений для товаров, услуг и работы в родовых поместьях
          </Paragraph>

          <div className="homePage__mission">
            <Paragraph>
              Это не маркетплейс и не гонка за охватами. Это живая ярмарка — место встречи людей, 
              хозяйств и семей, объединённых ценностями земли, рода и взаимного доверия.
            </Paragraph>
          </div>

          <div className="homePage__actions">
            <Button type="primary" onClick={() => navigate(routes.listings)}>
              Перейти к объявлениям
            </Button>
            <Button onClick={() => navigate(routes.adCreate)}>Разместить объявление</Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="homePage__features">
        <Card className="homePage__featureCard">
          <span className="homePage__featureIcon">🤝</span>
          <Title level={4}>Свои люди</Title>
          <Paragraph>
            Каждое объявление — это человек, семья или хозяйство. Мы исходим из доверия и ясных намерений.
          </Paragraph>
        </Card>
        <Card className="homePage__featureCard">
          <span className="homePage__featureIcon">🍃</span>
          <Title level={4}>Минимум шума</Title>
          <Paragraph>
            Без агрессивной рекламы и баннеров. Внимание — ценный ресурс.
          </Paragraph>
        </Card>
        <Card className="homePage__featureCard">
          <span className="homePage__featureIcon">🌳</span>
          <Title level={4}>Долгий путь</Title>
          <Paragraph>
            Проект создаётся на годы: устойчиво, просто и с уважением к людям.
          </Paragraph>
        </Card>
      </div>

      {/* Values Section */}
      <div className="homePage__values">
        <Title level={3} className="homePage__valuesTitle">Наши ценности</Title>
        <div className="homePage__valuesGrid">
          <div className="homePage__valueItem">
            <div className="homePage__valueNumber">1</div>
            <span className="homePage__valueLabel">Доверие</span>
          </div>
          <div className="homePage__valueItem">
            <div className="homePage__valueNumber">2</div>
            <span className="homePage__valueLabel">Честность</span>
          </div>
          <div className="homePage__valueItem">
            <div className="homePage__valueNumber">3</div>
            <span className="homePage__valueLabel">Уважение</span>
          </div>
          <div className="homePage__valueItem">
            <div className="homePage__valueNumber">4</div>
            <span className="homePage__valueLabel">Забота о земле</span>
          </div>
        </div>
      </div>
    </div>
  )
}
