import { Button, Card, Col, Row, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { routes } from '@/router/routes'
import './HomePage.css'

const { Title, Paragraph } = Typography

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="homePage">
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24}>
          <Card className="homePage__hero">
            <Title level={2} className="homePage__title">
              Родовая Ярмарка
            </Title>
            <Paragraph className="homePage__subtitle">
              Онлайн‑пространство объявлений для товаров, услуг и работы в родовых поместьях.
            </Paragraph>

            <Paragraph className="homePage__mission">
              Это не маркетплейс и не гонка за охватами. Это живая ярмарка — место встречи людей, хозяйств и семей,
              объединённых ценностями земли, рода и взаимного доверия.
            </Paragraph>

            <Space wrap>
              <Button type="primary" onClick={() => navigate(routes.listings)}>
                Перейти к объявлениям
              </Button>
              <Button onClick={() => navigate(routes.adCreate)}>Разместить объявление</Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8} className="homePage__featureCol">
          <Card title="Свои люди" className="homePage__featureCard">
            <Paragraph>
              Каждое объявление — это человек, семья или хозяйство. Мы исходим из доверия и ясных намерений.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Минимум шума" className="homePage__featureCard">
            <Paragraph>Без агрессивной рекламы и баннеров. Внимание — ценный ресурс.</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Долгий путь" className="homePage__featureCard">
            <Paragraph>Проект создаётся на годы: устойчиво, просто и с уважением к людям.</Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
