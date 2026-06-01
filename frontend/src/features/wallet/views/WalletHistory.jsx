import React from 'react';
import { Alert, Button, Card, Empty, Skeleton, Space, Statistic, Table, Tag, Typography } from 'antd';

import { useAuth } from '../../../app/AuthContext';
import { useWalletHistoryController } from '../controllers/useWalletHistoryController.js';
import { formatDate, formatPoints } from '../../../shared/utils/formatters.js';

const { Text } = Typography;

const typeLabel = {
  performance_bonus: 'Bono de desempeno',
  redemption_debit: 'Canje de recompensa',
  redemption_refund: 'Reembolso de canje',
  admin_adjustment: 'Ajuste administrativo'
};

function transactionColor(points) {
  return points > 0 ? 'green' : 'volcano';
}

export function WalletHistory() {
  const { currentUser } = useAuth();
  const { loading, error, wallet, transactions, reload } = useWalletHistoryController(currentUser);

  if (currentUser.role !== 'employee') {
    return (
      <Alert
        showIcon
        type="info"
        message="Selecciona un usuario con rol empleado para ver la billetera."
      />
    );
  }

  if (loading) {
    return <Skeleton active paragraph={{ rows: 7 }} />;
  }

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => formatDate(value),
      width: 160
    },
    {
      title: 'Concepto',
      dataIndex: 'type',
      key: 'type',
      render: (value) => typeLabel[value] ?? value
    },
    {
      title: 'Movimiento',
      dataIndex: 'points',
      key: 'points',
      render: (value) => (
        <Tag color={transactionColor(value)}>
          {value > 0 ? '+' : ''}
          {formatPoints(value)}
        </Tag>
      ),
      width: 180
    },
    {
      title: 'Saldo posterior',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      render: (value) => <Text strong>{formatPoints(value)}</Text>,
      width: 170
    }
  ];

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

      <Card title="Resumen de billetera">
        <Space size={24} wrap>
          <Statistic title="Saldo actual" value={wallet?.balance ?? 0} formatter={(value) => formatPoints(value)} />
          <Statistic
            title="Puntos ganados"
            value={wallet?.summary?.earned ?? 0}
            formatter={(value) => formatPoints(value)}
          />
          <Statistic
            title="Puntos gastados"
            value={wallet?.summary?.spent ?? 0}
            formatter={(value) => formatPoints(value)}
          />
          <Statistic title="Transacciones" value={wallet?.summary?.transactions ?? 0} />
        </Space>
      </Card>

      <Card title="Historial de transacciones">
        {transactions.length ? (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={transactions}
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        ) : (
          <Empty description="Aun no tienes transacciones registradas." />
        )}
      </Card>
    </Space>
  );
}
