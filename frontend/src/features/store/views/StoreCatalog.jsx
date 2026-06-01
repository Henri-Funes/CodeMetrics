import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Input,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography
} from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

import { useAuth } from '../../../app/AuthContext';
import { useStoreController } from '../controllers/useStoreController.js';
import { formatPoints } from '../../../shared/utils/formatters.js';

const { Paragraph, Text, Title } = Typography;

function categoryLabel(category) {
  const map = {
    licenses: 'Licencias',
    training: 'Capacitacion',
    hardware: 'Hardware',
    time: 'Tiempo',
    wellness: 'Bienestar'
  };

  return map[category] ?? category;
}

export function StoreCatalog() {
  const { currentUser } = useAuth();
  const [requestNote, setRequestNote] = useState('');
  const {
    loading,
    submitting,
    error,
    successMessage,
    rewards,
    wallet,
    selectedReward,
    estimatedBalanceAfter,
    canRedeemSelected,
    openCheckout,
    closeCheckout,
    submitRedemption,
    reload
  } = useStoreController(currentUser);

  if (currentUser.role !== 'employee') {
    return (
      <Alert
        showIcon
        type="info"
        message="Selecciona un usuario con rol empleado para usar la tienda."
      />
    );
  }

  const handleConfirmRedemption = async () => {
    await submitRedemption(requestNote);
    setRequestNote('');
  };

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
      {successMessage ? <Alert showIcon type="success" message={successMessage} /> : null}

      <Card>
        <Space direction="vertical" size={2}>
          <Text type="secondary">Saldo disponible</Text>
          <Title level={3} style={{ margin: 0 }}>
            {formatPoints(wallet?.balance ?? 0)}
          </Title>
        </Space>
      </Card>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : rewards.length ? (
        <Row gutter={[16, 16]}>
          {rewards.map((reward) => (
            <Col xs={24} sm={12} xl={8} key={reward._id}>
              <Badge.Ribbon text={categoryLabel(reward.category)}>
                <Card
                  hoverable
                  title={reward.name}
                  extra={<Tag color={reward.stock > 5 ? 'green' : 'orange'}>Stock: {reward.stock}</Tag>}
                >
                  <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      {reward.description}
                    </Paragraph>
                    <Statistic
                      title="Costo"
                      value={reward.costInPoints}
                      formatter={(value) => formatPoints(value)}
                    />
                    <Button
                      icon={<ShoppingCartOutlined />}
                      type="primary"
                      block
                      disabled={reward.stock <= 0}
                      onClick={() => openCheckout(reward)}
                    >
                      Canjear
                    </Button>
                  </Space>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="No hay recompensas disponibles en este momento." />
      )}

      <Drawer
        title={selectedReward ? `Confirmar canje: ${selectedReward.name}` : 'Confirmar canje'}
        open={Boolean(selectedReward)}
        onClose={closeCheckout}
        destroyOnClose
      >
        {selectedReward ? (
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <Statistic
              title="Saldo actual"
              value={wallet?.balance ?? 0}
              formatter={(value) => formatPoints(value)}
            />
            <Statistic
              title="Costo del premio"
              value={selectedReward.costInPoints}
              formatter={(value) => formatPoints(value)}
            />
            <Statistic
              title="Saldo estimado despues del canje"
              value={estimatedBalanceAfter}
              formatter={(value) => formatPoints(value)}
              valueStyle={{ color: estimatedBalanceAfter >= 0 ? '#00ff88' : '#ff4444' }}
            />
            <Input.TextArea
              rows={3}
              maxLength={220}
              showCount
              placeholder="Nota opcional para RRHH (ej: prioridad, horario, observaciones)"
              value={requestNote}
              onChange={(event) => setRequestNote(event.target.value)}
            />
            <Button type="primary" loading={submitting} disabled={!canRedeemSelected} onClick={handleConfirmRedemption}>
              Confirmar solicitud de canje
            </Button>
            {!canRedeemSelected ? (
              <Text type="danger">
                No puedes canjear este premio: saldo insuficiente o stock no disponible.
              </Text>
            ) : null}
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}
