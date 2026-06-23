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
  Tooltip,
  Typography
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useAuth } from '../../../app/AuthContext';
import { useGoalInspector } from '../../../shared/context/GoalInspectorContext.jsx';
import { formatDate } from '../../../shared/utils/formatters.js';
import { useAdminGoalsController } from '../controllers/useAdminGoalsController.js';
import {
  goalCategoryOptions,
  goalStatusColor,
  goalStatusOptions,
  goalUnitOptions
} from '../models/goals.model.js';

const { Text } = Typography;

const progressColorByStatus = {
  completed: '#1dd1a1',
  in_progress: '#00e5ff',
  at_risk: '#feca57',
  not_started: '#a7b1c2',
  cancelled: '#ff6b6b'
};

export function AdminGoalsManager() {
  const { currentUser } = useAuth();
  const { openInspector, refreshPanels } = useGoalInspector();
  const [goalForm] = Form.useForm();
  const [openGoalModal, setOpenGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
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

  const handleGoalSubmit = async () => {
    const values = await goalForm.validateFields();
    await saveGoal(values, editingGoal?._id ?? null);
    await refreshPanels();
    setOpenGoalModal(false);
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

      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
            <Statistic title="Activos" value={summary.total} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
            <Statistic title="Completados" value={summary.completed} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
            <Statistic title="En progreso" value={summary.inProgress} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
            <Statistic title="Avance prom." value={summary.averageProgress} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        title="Planificacion y objetivos"
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreateModal}>
            Asignar objetivo
          </Button>
        }
      >
        <Space wrap size={[8, 8]} style={{ marginBottom: 12 }}>
          <Select
            allowClear
            showSearch
            size="small"
            optionFilterProp="label"
            placeholder="Empleado"
            style={{ width: 180 }}
            value={filters.employeeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employeeOptions}
          />
          <Select
            allowClear
            size="small"
            placeholder="Periodo"
            style={{ width: 110 }}
            value={filters.periodId}
            onChange={(value) => setFilters((prev) => ({ ...prev, periodId: value }))}
            options={periodOptions}
          />
          <Select
            allowClear
            size="small"
            placeholder="Estado"
            style={{ width: 130 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={goalStatusOptions}
          />
          <Select
            allowClear
            size="small"
            placeholder="Categoria"
            style={{ width: 140 }}
            value={filters.category}
            onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
            options={goalCategoryOptions}
          />
          <Input.Search
            allowClear
            size="small"
            placeholder="Buscar"
            style={{ width: 180 }}
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
        </Space>

        <Table
          size="small"
          rowKey="_id"
          dataSource={filteredGoals}
          pagination={{ pageSize: 10, size: 'small', showSizeChanger: false }}
          tableLayout="fixed"
          scroll={{ x: 980 }}
          columns={[
            {
              title: 'Empleado',
              key: 'employee',
              width: 140,
              ellipsis: true,
              render: (_, goal) => (
                <Tooltip title={goal.employeePosition}>
                  <Text strong ellipsis style={{ maxWidth: 130 }}>
                    {goal.employeeName}
                  </Text>
                </Tooltip>
              )
            },
            {
              title: 'Objetivo',
              key: 'goal',
              ellipsis: true,
              render: (_, goal) => (
                <Tooltip title={goal.description}>
                  <Text ellipsis style={{ maxWidth: '100%' }}>
                    {goal.title}
                  </Text>
                </Tooltip>
              )
            },
            {
              title: 'Cat.',
              dataIndex: 'categoryLabel',
              key: 'category',
              width: 100,
              ellipsis: true,
              render: (value) => <Tag style={{ margin: 0 }}>{value}</Tag>
            },
            {
              title: 'Avance',
              key: 'progress',
              width: 120,
              render: (_, goal) => (
                <Progress
                  percent={goal.progress}
                  size="small"
                  strokeColor={progressColorByStatus[goal.status]}
                  format={(percent) => `${percent}%`}
                />
              )
            },
            {
              title: 'Estado',
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: (value, goal) => (
                <Tag color={goalStatusColor[value]} style={{ margin: 0 }}>
                  {goal.statusLabel}
                </Tag>
              )
            },
            {
              title: 'Periodo',
              key: 'periodDue',
              width: 110,
              render: (_, goal) => (
                <Space orientation="vertical" size={0}>
                  <Text style={{ fontSize: 12 }}>{goal.periodLabel}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {goal.dueDate ? formatDate(goal.dueDate) : '-'}
                  </Text>
                </Space>
              )
            },
            {
              title: 'Acciones',
              key: 'actions',
              width: 200,
              fixed: 'right',
              render: (_, goal) => (
                <Space size={0} wrap>
                  <Button type="link" size="small" onClick={() => openInspector(goal)}>
                    Ver
                  </Button>
                  <Button type="link" size="small" onClick={() => openEditModal(goal)} disabled={saving}>
                    Editar
                  </Button>
                  <Popconfirm
                    title="Cancelar objetivo"
                    okText="Si"
                    cancelText="No"
                    onConfirm={() => cancelGoal(goal._id)}
                  >
                    <Button type="link" size="small" danger disabled={saving || goal.status === 'cancelled'}>
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
    </Space>
  );
}
