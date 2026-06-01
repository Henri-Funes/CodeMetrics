import { ApiOutlined, CloudServerOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Badge, Card, Layout, Space, Statistic, Typography } from 'antd';

import { useHomeController } from '../controllers/useHomeController.js';
import './HomePage.css';

const { Content, Header } = Layout;
const { Text, Title } = Typography;

export function HomePage() {
  const { metrics, health } = useHomeController();

  return (
    <Layout className="home-shell">
      <Header className="home-header">
        <Space size={12}>
          <CloudServerOutlined className="home-header__icon" />
          <Text className="home-header__brand">CodeMetrics</Text>
        </Space>
        <Badge
          status={health.status === 'ok' ? 'success' : 'warning'}
          text={`API ${health.status}`}
        />
      </Header>

      <Content className="home-content">
        <section className="home-hero">
          <div>
            <Text className="home-hero__eyebrow">SGDLI</Text>
            <Title>Gestion del desempeno e incentivos laborales</Title>
            <Text className="home-hero__copy">
              Base academica lista para crecer con React, Ant Design, Express,
              MongoDB y contenedores Docker.
            </Text>
          </div>
          <Card className="home-status-card">
            <Space orientation="vertical" size={16}>
              <Space>
                <ApiOutlined />
                <Text strong>Backend</Text>
                <Badge
                  status={health.status === 'ok' ? 'success' : 'warning'}
                  text={health.loading ? 'checking' : health.status}
                />
              </Space>
              <Space>
                <DatabaseOutlined />
                <Text strong>MongoDB</Text>
                <Badge
                  status={health.database === 'connected' ? 'success' : 'warning'}
                  text={health.database}
                />
              </Space>
            </Space>
          </Card>
        </section>

        <section className="home-metrics">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <Statistic title={metric.label} value={metric.value} />
              <Text type="secondary">{metric.detail}</Text>
            </Card>
          ))}
        </section>
      </Content>
    </Layout>
  );
}
