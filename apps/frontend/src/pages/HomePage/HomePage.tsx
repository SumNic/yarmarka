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
            Для тех, кто живёт мечтой о родовом поместье и сажает кедры для внуков
          </Paragraph>

          <div className="homePage__mission">
            <Paragraph>
              Здесь встречаются люди, объединённые мечтой о жизни на своей земле — 
              в любви, в согласии с природой, в заботе о детях и внуках.
            </Paragraph>
            <Paragraph>
              Каждое объявление — это не просто товар или услуга. Это история семьи, хозяйства, живого труда.
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
          <Title level={4}>Люди, а не покупатели</Title>
          <Paragraph>
            За каждым объявлением стоит семья, хозяйство, живой труд. Мы видим в каждом соседа и единомышленника.
          </Paragraph>
        </Card>
        <Card className="homePage__featureCard">
          <span className="homePage__featureIcon">🍃</span>
          <Title level={4}>Честность и простота</Title>
          <Paragraph>
            Нет скрытых платежей и навязанных услуг. Всё ясно и прозрачно — как в добром соседстве.
          </Paragraph>
        </Card>
        <Card className="homePage__featureCard">
          <span className="homePage__featureIcon">🌳</span>
          <Title level={4}>Жизнь на поколения</Title>
          <Paragraph>
            Проект создаётся на годы. Мы выбираем путь устойчивый, как кедр, — для детей и внуков.
          </Paragraph>
        </Card>
      </div>

      {/* Info Section */}
      <div className="homePage__info">
        <Card className="homePage__infoCard">
          <Title level={4}>Кто может размещать объявления</Title>
          <Paragraph>
            <strong>Товары, услуги, вакансии</strong> — только для тех, кто уже живёт в родовом поместье и создаёт пространство любви на своей земле.
          </Paragraph>
          <Paragraph>
            <strong>Ищу работу</strong> — доступно всем приверженцам идей о родовых поместьях, даже если вы пока только в пути к своей земле.
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
