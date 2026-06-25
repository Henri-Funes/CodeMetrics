import React, { useMemo, useState } from 'react';
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
import { formatPoints, formatScore } from '../../../shared/utils/formatters.js';
import './EmployeeDashboard.css';

const { Paragraph, Text, Title } = Typography;

const scoreColorByStatus = {
  excellent: '#1dd1a1',
  good: '#00e5ff',
  regular: '#feca57',
  low: '#ff6b6b'
};

export function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const [dismissedNotifications, setDismissedNotifications] = useState([]);
  const { loading, error, latestReview, performanceTimeline, wallet, kpiCards, scoreStatus, notifications, reload } =
    useEmployeeDashboardController(currentUser);

  const visibleNotifications = useMemo(
    () => notifications.filter((notification) => !dismissedNotifications.includes(notification.key)),
    [notifications, dismissedNotifications]
  );

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
    <Space className="employee-dashboard" orientation="vertical" size={12} style={{ width: '100%' }}>
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

      {visibleNotifications.map((notification) => (
        <Alert
          key={notification.key}
          showIcon
          type={notification.type}
          message={notification.message}
          description={notification.description}
          closable
          onClose={() => setDismissedNotifications((current) => [...current, notification.key])}
        />
      ))}

      <Card className="employee-dashboard__card employee-dashboard__card--compact">
        <Space orientation="vertical" size={2}>
          <Text type="secondary">Empleado activo</Text>
          <Title level={4} style={{ margin: 0 }}>
            {currentUser.name}
          </Title>
          <Text type="secondary">
            {currentUser.department} - {currentUser.position}
          </Text>
        </Space>
      </Card>

      <Row gutter={[12, 12]} align="stretch">
        <Col xs={24} lg={16} className="employee-dashboard__col">
          <Card
            className="employee-dashboard__card"
            title="Desempeño del ultimo periodo"
            extra={
              latestReview?.periodId?.label ? (
                <Tag color="cyan">{latestReview.periodId.label}</Tag>
              ) : (
                <Tag color="default">Sin periodo</Tag>
              )
            }
          >
            {latestReview ? (
              <Space orientation="vertical" size={10} style={{ width: '100%' }}>
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

        <Col xs={24} lg={8} className="employee-dashboard__col">
          <Card className="employee-dashboard__card" title="Billetera de puntos">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
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

      <Row gutter={[12, 12]} align="stretch">
        <Col xs={24} lg={14} className="employee-dashboard__col">
          <Card className="employee-dashboard__card employee-dashboard__card--kpis" title="KPIs">
            {kpiCards.length > 0 ? (
              <Space className="employee-dashboard__kpis-list" orientation="vertical" size={8} style={{ width: '100%' }}>
                {kpiCards.map((kpi) => (
                  <div key={kpi.key} className="employee-dashboard__kpi">
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

        <Col xs={24} lg={10} className="employee-dashboard__col">
          <Card className="employee-dashboard__card" title="Historial de desempeño">
            {performanceTimeline.length ? (
              <Timeline
                items={performanceTimeline.map((entry) => ({
                  color: entry.color,
                  children: (
                    <Space orientation="vertical" size={0} className="employee-dashboard__timeline-item">
                      <Text strong>{entry.period}</Text>
                      <Text>
                        Puntaje: <Text strong>{formatScore(entry.score)}</Text> / 100
                      </Text>
                      <Text type="secondary">Puntos: {formatPoints(entry.pointsAwarded)}</Text>
                    </Space>
                  )
                }))}
              />
            ) : (
              <Empty description="Aun no hay evaluaciones historicas." />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
