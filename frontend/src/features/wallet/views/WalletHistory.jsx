import React from 'react';
import { Alert, Button, Card, Empty, Skeleton, Space, Statistic, Table, Tag, Typography } from 'antd';
import {
  WalletOutlined,
  TrophyOutlined,
  ArrowDownOutlined,
  SwapOutlined
} from '@ant-design/icons';

import { useAuth } from '../../../app/AuthContext';
import { useWalletHistoryController } from '../controllers/useWalletHistoryController.js';
import { formatDate, formatPoints } from '../../../shared/utils/formatters.js';
import './WalletHistory.css';

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
  const summaryCards = [
    {
      key: 'wallet-balance',
      title: 'Saldo actual',
      value: wallet?.balance ?? 0,
      formatter: (value) => formatPoints(value),
      icon: <WalletOutlined />,
      accentClassName: 'wallet-history__summary-card--balance'
    },
    {
      key: 'wallet-earned',
      title: 'Puntos ganados',
      value: wallet?.summary?.earned ?? 0,
      formatter: (value) => formatPoints(value),
      icon: <TrophyOutlined />,
      accentClassName: 'wallet-history__summary-card--earned'
    },
    {
      key: 'wallet-spent',
      title: 'Puntos gastados',
      value: wallet?.summary?.spent ?? 0,
      formatter: (value) => formatPoints(value),
      icon: <ArrowDownOutlined />,
      accentClassName: 'wallet-history__summary-card--spent'
    },
    {
      key: 'wallet-transactions',
      title: 'Transacciones',
      value: wallet?.summary?.transactions ?? 0,
      icon: <SwapOutlined />,
      accentClassName: 'wallet-history__summary-card--transactions'
    }
  ];

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
    <Space className="wallet-history" orientation="vertical" size={16} style={{ width: '100%' }}>
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
        <div className="wallet-history__summary-grid">
          {summaryCards.map((card) => (
            <div key={card.key} className={`wallet-history__summary-card ${card.accentClassName}`}>
              <div className="wallet-history__summary-icon">{card.icon}</div>
              <Statistic
                title={card.title}
                value={card.value}
                formatter={card.formatter}
              />
            </div>
          ))}
        </div>
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
