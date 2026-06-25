import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Result,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography
} from 'antd';
import { ShoppingCartOutlined, WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../app/AuthContext';
import { useStoreController } from '../controllers/useStoreController.js';
import { formatPoints } from '../../../shared/utils/formatters.js';
import './StoreCatalog.css';

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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [requestNote, setRequestNote] = useState('');
  const {
    loading,
    submitting,
    error,
    rewards,
    wallet,
    selectedReward,
    checkoutStep,
    redeemedRewardName,
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
    <Space className="store-catalog" orientation="vertical" size={16} style={{ width: '100%' }}>
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

      <Card className="store-catalog__balance-card">
        <div className="store-catalog__balance-icon">
          <WalletOutlined />
        </div>
        <Space orientation="vertical" size={2}>
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
                  extra={
                    <Tag
                      color={reward.stock > 5 ? 'green' : 'orange'}
                      style={{ marginTop: '28px' }}
                    >
                      Stock: {reward.stock}
                    </Tag>
                  }
                >
                  <Space orientation="vertical" size={10} style={{ width: '100%' }}>
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
        title={
          checkoutStep === 'success'
            ? 'Canje solicitado'
            : selectedReward
              ? `Confirmar canje: ${selectedReward.name}`
              : 'Confirmar canje'
        }
        open={Boolean(selectedReward)}
        onClose={closeCheckout}
        destroyOnHidden
      >
        {selectedReward && checkoutStep === 'success' ? (
          <Result
            status="success"
            title="Solicitud enviada"
            subTitle={`Tu canje de "${redeemedRewardName}" quedo en estado pendiente de aprobacion por RRHH.`}
            extra={[
              <Button key="close" onClick={closeCheckout}>
                Cerrar
              </Button>,
              <Button key="wallet" type="primary" onClick={() => navigate('/wallet')}>
                Ir a la billetera
              </Button>
            ]}
          />
        ) : null}

        {selectedReward && checkoutStep === 'confirm' ? (
          <Space orientation="vertical" size={14} style={{ width: '100%' }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Saldo actual">
                {formatPoints(wallet?.balance ?? 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Costo del premio">
                {formatPoints(selectedReward.costInPoints)}
              </Descriptions.Item>
              <Descriptions.Item label="Saldo estimado">
                <Text style={{ color: estimatedBalanceAfter >= 0 ? '#00ff88' : '#ff4444' }}>
                  {formatPoints(estimatedBalanceAfter)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
            <Input.TextArea
              rows={3}
              maxLength={220}
              showCount
              placeholder="Nota opcional para RRHH (ej: prioridad, horario, observaciones)"
              value={requestNote}
              onChange={(event) => setRequestNote(event.target.value)}
            />
            <Button
              type="primary"
              loading={submitting}
              disabled={!canRedeemSelected}
              onClick={handleConfirmRedemption}
            >
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
