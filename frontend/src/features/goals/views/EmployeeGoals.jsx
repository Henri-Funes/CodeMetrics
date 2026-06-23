import React, { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography
} from 'antd';

import { useAuth } from '../../../app/AuthContext';
import { formatDate } from '../../../shared/utils/formatters.js';
import { useEmployeeGoalsController } from '../controllers/useEmployeeGoalsController.js';
import { goalStatusColor } from '../models/goals.model.js';

const { Paragraph, Text, Title } = Typography;

const progressColorByStatus = {
  completed: '#1dd1a1',
  in_progress: '#00e5ff',
  at_risk: '#feca57',
  not_started: '#a7b1c2',
  cancelled: '#ff6b6b'
};

function getMaxValue(goal) {
  if (goal.unit === 'boolean') return 1;
  if (goal.unit === 'percent') return 100;
  return goal.targetValue || 100;
}

export function EmployeeGoals() {
  const [form] = Form.useForm();
  const { currentUser } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const { loading, saving, error, successMessage, goals, summary, submitProgress, reload } =
    useEmployeeGoalsController(currentUser);

  if (currentUser.role !== 'employee') {
    return (
      <Alert
        showIcon
        type="info"
        message="Selecciona un usuario con rol empleado para ver objetivos."
      />
    );
  }

  const openProgressModal = (goal) => {
    setSelectedGoal(goal);
    form.setFieldsValue({
      currentValue: goal.currentValue,
      evidenceNote: goal.evidenceNote
    });
  };

  const handleProgressSubmit = async () => {
    const values = await form.validateFields();
    await submitProgress(selectedGoal._id, values);
    setSelectedGoal(null);
  };

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

      <Card>
        <Space orientation="vertical" size={4}>
          <Text type="secondary">Planificacion del periodo</Text>
          <Title level={4} style={{ margin: 0 }}>
            Mis objetivos
          </Title>
          <Paragraph style={{ marginBottom: 0 }}>
            Consulta tus metas asignadas, avance actual y estado de cumplimiento.
          </Paragraph>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Objetivos activos" value={summary.total} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Completados" value={summary.completed} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="En riesgo" value={summary.atRisk} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Progreso promedio" value={summary.averageProgress} suffix="%" />
          </Card>
        </Col>
      </Row>

      {goals.length ? (
        <Row gutter={[16, 16]}>
          {goals.map((goal) => (
            <Col xs={24} lg={12} key={goal._id}>
              <Card
                title={goal.title}
                extra={<Tag color={goalStatusColor[goal.status]}>{goal.statusLabel}</Tag>}
              >
                <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                  <Space wrap>
                    <Tag>{goal.categoryLabel}</Tag>
                    <Tag color="cyan">{goal.periodLabel}</Tag>
                    <Tag color="blue">Peso {goal.weight}%</Tag>
                  </Space>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {goal.description}
                  </Paragraph>
                  <Progress
                    percent={goal.progress}
                    strokeColor={progressColorByStatus[goal.status]}
                    status={goal.status === 'cancelled' ? 'exception' : undefined}
                  />
                  <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
                    <Text>
                      Avance: <Text strong>{goal.currentValue}</Text> / {goal.targetValue}{' '}
                      {goal.unitLabel}
                    </Text>
                    <Text type="secondary">Vence: {formatDate(goal.dueDate)}</Text>
                  </Space>
                  {goal.evidenceNote ? (
                    <Paragraph style={{ marginBottom: 0 }}>
                      Evidencia: <Text type="secondary">{goal.evidenceNote}</Text>
                    </Paragraph>
                  ) : null}
                  <Button
                    type="primary"
                    disabled={goal.status === 'cancelled' || goal.status === 'completed'}
                    onClick={() => openProgressModal(goal)}
                  >
                    Actualizar avance
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Empty description="Aun no tienes objetivos asignados." />
        </Card>
      )}

      <Modal
        title={selectedGoal ? `Actualizar avance: ${selectedGoal.title}` : 'Actualizar avance'}
        open={Boolean(selectedGoal)}
        onCancel={() => setSelectedGoal(null)}
        onOk={handleProgressSubmit}
        okText="Guardar avance"
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="currentValue"
            label={`Avance actual (${selectedGoal?.unitLabel ?? 'valor'})`}
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={selectedGoal ? getMaxValue(selectedGoal) : 100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="evidenceNote" label="Nota de evidencia">
            <Input.TextArea rows={3} maxLength={220} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
