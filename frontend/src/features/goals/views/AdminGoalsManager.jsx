import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Col,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useAuth } from '../../../app/AuthContext';
import { formatDate } from '../../../shared/utils/formatters.js';
import { useAdminGoalsController } from '../controllers/useAdminGoalsController.js';
import {
  goalCategoryOptions,
  goalStatusColor,
  goalStatusOptions,
  goalUnitOptions
} from '../models/goals.model.js';

const { Paragraph, Text } = Typography;

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

export function AdminGoalsManager() {
  const { currentUser } = useAuth();
  const [goalForm] = Form.useForm();
  const [progressForm] = Form.useForm();
  const [openGoalModal, setOpenGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [progressGoal, setProgressGoal] = useState(null);
  const {
    loading,
    saving,
    error,
    successMessage,
    employees,
    periods,
    filteredGoals,
    filters,
    setFilters,
    summary,
    saveGoal,
    submitProgress,
    cancelGoal,
    reload
  } = useAdminGoalsController(currentUser);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee._id,
        label: `${employee.name} - ${employee.position}`
      })),
    [employees]
  );

  const periodOptions = useMemo(
    () =>
      periods.map((period) => ({
        value: period._id,
        label: period.label
      })),
    [periods]
  );

  const openCreateModal = () => {
    setEditingGoal(null);
    goalForm.resetFields();
    goalForm.setFieldsValue({
      category: 'delivery',
      unit: 'tasks',
      targetValue: 10,
      currentValue: 0,
      weight: 20,
      status: 'not_started',
      periodId: periods[0]?._id
    });
    setOpenGoalModal(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    goalForm.setFieldsValue({
      employeeId: goal.employeeId,
      periodId: goal.periodId,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      unit: goal.unit,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      weight: goal.weight,
      dueDate: goal.dueDate,
      status: goal.status
    });
    setOpenGoalModal(true);
  };

  const openProgressModal = (goal) => {
    setProgressGoal(goal);
    progressForm.setFieldsValue({
      currentValue: goal.currentValue,
      evidenceNote: goal.evidenceNote
    });
  };

  const handleGoalSubmit = async () => {
    const values = await goalForm.validateFields();
    await saveGoal(values, editingGoal?._id ?? null);
    setOpenGoalModal(false);
  };

  const handleProgressSubmit = async () => {
    const values = await progressForm.validateFields();
    await submitProgress(progressGoal._id, values);
    setProgressGoal(null);
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
            <Statistic title="En progreso" value={summary.inProgress} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Promedio avance" value={summary.averageProgress} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card
        title="Planificacion y objetivos"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Asignar objetivo
          </Button>
        }
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Empleado"
            style={{ width: 240 }}
            value={filters.employeeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employeeOptions}
          />
          <Select
            allowClear
            placeholder="Periodo"
            style={{ width: 160 }}
            value={filters.periodId}
            onChange={(value) => setFilters((prev) => ({ ...prev, periodId: value }))}
            options={periodOptions}
          />
          <Select
            allowClear
            placeholder="Estado"
            style={{ width: 160 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={goalStatusOptions}
          />
          <Select
            allowClear
            placeholder="Categoria"
            style={{ width: 180 }}
            value={filters.category}
            onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
            options={goalCategoryOptions}
          />
          <Input.Search
            allowClear
            placeholder="Buscar objetivo o empleado"
            style={{ width: 260 }}
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
        </Space>

        <Table
          rowKey="_id"
          dataSource={filteredGoals}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1560 }}
          columns={[
            {
              title: 'Empleado',
              key: 'employee',
              width: 220,
              render: (_, goal) => (
                <Space orientation="vertical" size={0}>
                  <Text strong>{goal.employeeName}</Text>
                  <Text type="secondary">{goal.employeePosition}</Text>
                </Space>
              )
            },
            {
              title: 'Objetivo',
              key: 'goal',
              width: 390,
              render: (_, goal) => (
                <Space orientation="vertical" size={0} style={{ minWidth: 0 }}>
                  <Text strong>{goal.title}</Text>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                    {goal.description}
                  </Paragraph>
                </Space>
              )
            },
            {
              title: 'Categoria',
              dataIndex: 'categoryLabel',
              key: 'category',
              width: 150,
              render: (value) => <Tag>{value}</Tag>
            },
            {
              title: 'Progreso',
              key: 'progress',
              width: 180,
              render: (_, goal) => (
                <Progress
                  percent={goal.progress}
                  size="small"
                  strokeColor={progressColorByStatus[goal.status]}
                />
              )
            },
            {
              title: 'Estado',
              dataIndex: 'status',
              key: 'status',
              width: 130,
              render: (value, goal) => <Tag color={goalStatusColor[value]}>{goal.statusLabel}</Tag>
            },
            {
              title: 'Periodo',
              dataIndex: 'periodLabel',
              key: 'period',
              width: 120
            },
            {
              title: 'Vence',
              dataIndex: 'dueDate',
              key: 'dueDate',
              width: 130,
              render: (value) => formatDate(value)
            },
            {
              title: 'Acciones',
              key: 'actions',
              width: 250,
              render: (_, goal) => (
                <Space size={8}>
                  <Button size="small" onClick={() => openEditModal(goal)} disabled={saving}>
                    Editar
                  </Button>
                  <Button size="small" onClick={() => openProgressModal(goal)} disabled={saving}>
                    Avance
                  </Button>
                  <Popconfirm
                    title="Cancelar objetivo"
                    description="El objetivo saldra del resumen activo."
                    okText="Cancelar objetivo"
                    cancelText="Volver"
                    onConfirm={() => cancelGoal(goal._id)}
                  >
                    <Button size="small" danger disabled={saving || goal.status === 'cancelled'}>
                      Cancelar
                    </Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingGoal ? 'Editar objetivo' : 'Asignar objetivo'}
        open={openGoalModal}
        onCancel={() => setOpenGoalModal(false)}
        onOk={handleGoalSubmit}
        okText={editingGoal ? 'Guardar cambios' : 'Asignar objetivo'}
        confirmLoading={saving}
        width={720}
        destroyOnHidden
      >
        <Form layout="vertical" form={goalForm}>
          <Form.Item name="employeeId" label="Empleado" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={employeeOptions} />
          </Form.Item>
          <Form.Item name="periodId" label="Periodo">
            <Select allowClear options={periodOptions} />
          </Form.Item>
          <Form.Item name="title" label="Objetivo" rules={[{ required: true }]}>
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item name="description" label="Descripcion" rules={[{ required: true }]}>
            <Input.TextArea rows={3} maxLength={420} showCount />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="category" label="Categoria" rules={[{ required: true }]}>
                <Select options={goalCategoryOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="unit" label="Unidad" rules={[{ required: true }]}>
                <Select options={goalUnitOptions} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="targetValue" label="Meta" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="currentValue" label="Avance actual" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="weight" label="Peso (%)" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="dueDate" label="Fecha limite">
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Estado inicial">
                <Select options={goalStatusOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={progressGoal ? `Actualizar avance: ${progressGoal.title}` : 'Actualizar avance'}
        open={Boolean(progressGoal)}
        onCancel={() => setProgressGoal(null)}
        onOk={handleProgressSubmit}
        okText="Guardar avance"
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form layout="vertical" form={progressForm}>
          <Form.Item
            name="currentValue"
            label={`Avance actual (${progressGoal?.unitLabel ?? 'valor'})`}
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={progressGoal ? getMaxValue(progressGoal) : 100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="evidenceNote" label="Nota de evidencia">
            <Input.TextArea rows={3} maxLength={220} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
