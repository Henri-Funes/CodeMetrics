import React from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Timeline,
  Typography
} from 'antd';
import { TrophyOutlined, WalletOutlined } from '@ant-design/icons';

import { useAuth } from '../../../app/AuthContext';
import { useEmployeeDashboardController } from '../controllers/useEmployeeDashboardController.js';
import { formatDate, formatPoints, formatScore } from '../../../shared/utils/formatters.js';

const { Paragraph, Text, Title } = Typography;

const scoreColorByStatus = {
  excellent: '#1dd1a1',
  good: '#00e5ff',
  regular: '#feca57',
  low: '#ff6b6b'
};

export function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const { loading, error, latestReview, wallet, kpiCards, scoreStatus, reload } =
    useEmployeeDashboardController(currentUser);

  if (currentUser.role !== 'employee') {
    return (
      <Alert
        showIcon
        type="info"
        message="Selecciona un usuario con rol empleado para ver este dashboard."
      />
    );
  }

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {error ? (
        <Alert
          showIcon
          type="error"
          message={error}
          action={
            <Button size="small" onClick={() => reload()}>
              Reintentar
            </Button>
          }
        />
      ) : null}

      <Card>
        <Space direction="vertical" size={4}>
          <Text type="secondary">Empleado activo</Text>
          <Title level={4} style={{ margin: 0 }}>
            {currentUser.name}
          </Title>
          <Text type="secondary">
            {currentUser.department} - {currentUser.position}
          </Text>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Desempeno del ultimo periodo"
            extra={
              latestReview?.periodId?.label ? (
                <Tag color="cyan">{latestReview.periodId.label}</Tag>
              ) : (
                <Tag color="default">Sin periodo</Tag>
              )
            }
          >
            {latestReview ? (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Progress
                  type="dashboard"
                  percent={Math.round(Number(latestReview.finalScore))}
                  strokeColor={scoreColorByStatus[scoreStatus]}
                  format={(percent) => `${percent}/100`}
                />
                <Paragraph style={{ marginBottom: 0 }}>
                  Puntaje final: <Text strong>{formatScore(latestReview.finalScore)}</Text>
                </Paragraph>
                <Paragraph style={{ marginBottom: 0 }}>
                  Nota: {latestReview.notes || 'Sin observaciones para este periodo.'}
                </Paragraph>
              </Space>
            ) : (
              <Empty description="No hay evaluaciones disponibles para este empleado." />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Merit Wallet">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Statistic
                title="Saldo actual"
                value={wallet?.balance ?? 0}
                formatter={(value) => formatPoints(value)}
                prefix={<WalletOutlined />}
              />
              <Statistic
                title="Puntos ganados en ultimo periodo"
                value={latestReview?.pointsAwarded ?? 0}
                formatter={(value) => formatPoints(value)}
                prefix={<TrophyOutlined />}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="KPIs">
            {kpiCards.length > 0 ? (
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                {kpiCards.map((kpi) => (
                  <div key={kpi.key}>
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <Text>{kpi.label}</Text>
                      <Text strong>{formatScore(kpi.value)}</Text>
                    </Space>
                    <Progress percent={Math.round(kpi.value)} strokeColor={kpi.color} />
                  </div>
                ))}
              </Space>
            ) : (
              <Empty description="No hay KPIs para mostrar." />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Ultimos movimientos">
            {wallet?.recentTransactions?.length ? (
              <Timeline
                items={wallet.recentTransactions.slice(0, 5).map((transaction) => ({
                  color: transaction.points > 0 ? 'green' : 'red',
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text strong>
                        {transaction.points > 0 ? '+' : ''}
                        {formatPoints(transaction.points)}
                      </Text>
                      <Text type="secondary">{formatDate(transaction.createdAt)}</Text>
                      <Text type="secondary">{transaction.type}</Text>
                    </Space>
                  )
                }))}
              />
            ) : (
              <Empty description="No hay transacciones recientes." />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
