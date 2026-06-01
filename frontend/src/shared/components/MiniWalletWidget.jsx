import React from 'react';
import { Button, Empty, List, Popover, Skeleton, Tag, Typography } from 'antd';
import { WalletOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { useWalletHistoryController } from '../../features/wallet/controllers/useWalletHistoryController.js';
import { formatDate, formatPoints } from '../utils/formatters.js';

const { Text } = Typography;

export const MiniWalletWidget = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { loading, wallet, transactions } = useWalletHistoryController(currentUser);
  const recentTransactions = transactions.slice(0, 3);

  const content = (
    <div style={{ width: 250 }}>
      {loading ? (
        <Skeleton active title={false} paragraph={{ rows: 3 }} />
      ) : recentTransactions.length ? (
        <List
          size="small"
          header={<div>Ultimos movimientos</div>}
          dataSource={recentTransactions}
          renderItem={(item) => (
            <List.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Tag color={item.points > 0 ? 'green' : 'volcano'}>
                  {item.points > 0 ? '+' : ''}
                  {formatPoints(item.points)}
                </Tag>
                <Text type="secondary" style={{ fontSize: '0.8em' }}>
                  {formatDate(item.createdAt)}
                </Text>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin movimientos recientes" />
      )}
      <Button 
        type="primary" 
        block 
        style={{ marginTop: 16 }}
        onClick={() => navigate('/wallet')}
      >
        Ir a la Billetera <ArrowRightOutlined />
      </Button>
    </div>
  );

  return (
    <Popover content={content} title="Mi Billetera" trigger="hover" placement="bottomRight">
      <Button type="dashed" icon={<WalletOutlined />} style={{ fontWeight: 'bold' }}>
        {loading ? 'Cargando...' : formatPoints(wallet?.balance ?? 0)}
      </Button>
    </Popover>
  );
};
