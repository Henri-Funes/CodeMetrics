import React from 'react';
import { Alert, Button, Card, Col, Row, Skeleton, Space, Statistic, Table, Tag, Typography } from 'antd';

import { useAdminDashboardController } from '../controllers/useAdminDashboardController.js';
import { toPeriodRows, toRedemptionSummaryRows, toTopPerformerRows } from '../models/admin.model.js';
import { formatDate, formatPoints, formatScore } from '../../../shared/utils/formatters.js';

const { Text } = Typography;

const statusColor = {
  pending: 'gold',
  approved: 'blue',
  rejected: 'volcano',
  delivered: 'green'
};

const periodStatusColor = {
  draft: 'default',
  calculated: 'processing',
  closed: 'success'
};

const periodStatusLabel = {
  draft: 'Borrador',
  calculated: 'Calculado',
  closed: 'Cerrado'
};

export function AdminDashboard() {
  const { loading, error, employeeSummary, performanceSummary, redemptionSummary, periods, reload } =
    useAdminDashboardController();

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  const topRows = toTopPerformerRows(performanceSummary?.topPerformers ?? []);
  const redemptionRows = toRedemptionSummaryRows(redemptionSummary ?? {});
  const periodRows = toPeriodRows(periods ?? []);

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
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

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic title="Empleados totales" value={employeeSummary?.total ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic title="Empleados activos" value={employeeSummary?.active ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic
              title="Puntos emitidos"
              value={performanceSummary?.summary?.totalPointsAwarded ?? 0}
              formatter={(value) => formatPoints(value)}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic
              title="Promedio de score"
              value={formatScore(performanceSummary?.summary?.averageScore ?? 0)}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Estado de periodos de desempeno">
        <Table
          size="small"
          rowKey="key"
          dataSource={periodRows}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          locale={{ emptyText: 'No hay periodos registrados.' }}
          columns={[
            {
              title: 'Periodo',
              dataIndex: 'label',
              key: 'label'
            },
            {
              title: 'Estado',
              dataIndex: 'status',
              key: 'status',
              render: (value) => (
                <Tag color={periodStatusColor[value] ?? 'default'}>
                  {periodStatusLabel[value] ?? value}
                </Tag>
              )
            },
            {
              title: 'Calculado',
              dataIndex: 'calculatedAt',
              key: 'calculatedAt',
              render: (value) => formatDate(value)
            },
            {
              title: 'Cerrado',
              dataIndex: 'closedAt',
              key: 'closedAt',
              render: (value) => formatDate(value)
            }
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="Top performers">
            <Table
              size="small"
              rowKey="key"
              dataSource={topRows}
              pagination={false}
              locale={{ emptyText: 'Sin evaluaciones para mostrar.' }}
              columns={[
                {
                  title: 'Empleado',
                  dataIndex: 'name',
                  key: 'name'
                },
                {
                  title: 'Area',
                  dataIndex: 'department',
                  key: 'department'
                },
                {
                  title: 'Periodo',
                  dataIndex: 'period',
                  key: 'period'
                },
                {
                  title: 'Score',
                  dataIndex: 'score',
                  key: 'score',
                  render: (value) => <Text strong>{formatScore(value)}</Text>
                },
                {
                  title: 'Puntos',
                  dataIndex: 'pointsAwarded',
                  key: 'pointsAwarded',
                  render: (value) => formatPoints(value)
                }
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card title="Estado de canjes">
            <Table
              size="small"
              rowKey="key"
              dataSource={redemptionRows}
              pagination={false}
              locale={{ emptyText: 'Sin datos de canjes.' }}
              columns={[
                {
                  title: 'Estado',
                  dataIndex: 'status',
                  key: 'status',
                  render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value}</Tag>
                },
                {
                  title: 'Tickets',
                  dataIndex: 'count',
                  key: 'count'
                },
                {
                  title: 'Puntos',
                  dataIndex: 'points',
                  key: 'points',
                  render: (value) => formatPoints(value)
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
