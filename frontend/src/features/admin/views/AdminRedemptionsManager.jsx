import React from 'react';
import { Alert, Button, Card, Popconfirm, Segmented, Skeleton, Space, Table, Tag, Typography } from 'antd';

import { useAuth } from '../../../app/AuthContext';
import { useAdminRedemptionsController } from '../controllers/useAdminRedemptionsController.js';
import { formatDate, formatPoints } from '../../../shared/utils/formatters.js';

const { Text } = Typography;

const statusColor = {
  pending: 'gold',
  approved: 'blue',
  rejected: 'volcano',
  delivered: 'green'
};

export function AdminRedemptionsManager() {
  const { currentUser } = useAuth();
  const {
    loading,
    updating,
    error,
    successMessage,
    redemptions,
    statusFilter,
    setStatusFilter,
    updateRedemption,
    reload
  } = useAdminRedemptionsController(currentUser);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

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
      {successMessage ? <Alert showIcon type="success" message={successMessage} /> : null}

      <Card title="Gestion de canjes">
        <Space style={{ marginBottom: 16 }}>
          <Segmented
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'Pendientes', value: 'pending' },
              { label: 'Aprobados', value: 'approved' },
              { label: 'Rechazados', value: 'rejected' },
              { label: 'Entregados', value: 'delivered' },
              { label: 'Todos', value: 'all' }
            ]}
          />
        </Space>
        <Table
          rowKey="_id"
          dataSource={redemptions}
          pagination={{ pageSize: 8 }}
          columns={[
            {
              title: 'Empleado',
              dataIndex: ['employeeId', 'name'],
              key: 'employee'
            },
            {
              title: 'Recompensa',
              dataIndex: ['rewardSnapshot', 'name'],
              key: 'reward'
            },
            {
              title: 'Puntos',
              dataIndex: 'pointsSpent',
              key: 'pointsSpent',
              render: (value) => formatPoints(value)
            },
            {
              title: 'Estado',
              dataIndex: 'status',
              key: 'status',
              render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value}</Tag>
            },
            {
              title: 'Solicitado',
              dataIndex: 'requestedAt',
              key: 'requestedAt',
              render: (value) => formatDate(value)
            },
            {
              title: 'Acciones',
              key: 'actions',
              render: (_, redemption) => {
                if (redemption.status === 'pending') {
                  return (
                    <Space size={8}>
                      <Button
                        type="primary"
                        size="small"
                        loading={updating}
                        onClick={() => updateRedemption(redemption, 'approve', 'Aprobado por RRHH.')}
                      >
                        Aprobar
                      </Button>
                      <Popconfirm
                        title="Rechazar canje"
                        description="Esta accion devolvera puntos al empleado."
                        okText="Rechazar"
                        cancelText="Cancelar"
                        onConfirm={() => updateRedemption(redemption, 'reject', 'Rechazado por RRHH.')}
                      >
                        <Button danger size="small" loading={updating}>
                          Rechazar
                        </Button>
                      </Popconfirm>
                    </Space>
                  );
                }

                if (redemption.status === 'approved') {
                  return (
                    <Button
                      size="small"
                      loading={updating}
                      onClick={() => updateRedemption(redemption, 'deliver', 'Premio entregado.')}
                    >
                      Marcar entregado
                    </Button>
                  );
                }

                return <Text type="secondary">Sin acciones</Text>;
              }
            }
          ]}
        />
      </Card>
    </Space>
  );
}
