import React from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Table,
  Tag
} from 'antd';

import { useAuth } from '../../../app/AuthContext';
import { useAdminWalletController } from '../controllers/useAdminWalletController.js';
import { toPeriodRows } from '../models/admin.model.js';
import { formatDate } from '../../../shared/utils/formatters.js';

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

export function AdminWalletAdjustments() {
  const [form] = Form.useForm();
  const { currentUser } = useAuth();
  const {
    loading,
    submitting,
    error,
    successMessage,
    employees,
    periods,
    submitAdjustment,
    grantPeriodBonuses,
    reload
  } = useAdminWalletController(currentUser);

  const periodRows = toPeriodRows(periods);

  const handleAdjustment = async () => {
    const values = await form.validateFields();
    await submitAdjustment(values);
    form.resetFields();
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

      <Card title="Ajuste manual de puntos">
        <Form layout="vertical" form={form}>
          <Form.Item name="employeeId" label="Empleado" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Selecciona empleado"
              options={employees.map((employee) => ({
                value: employee._id,
                label: `${employee.name} (${employee.pointBalance} pts)`
              }))}
            />
          </Form.Item>
          <Form.Item
            name="points"
            label="Puntos (positivo suma, negativo resta)"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Motivo" rules={[{ required: true }]}>
            <Input.TextArea rows={3} maxLength={220} showCount />
          </Form.Item>
          <Button type="primary" loading={submitting} onClick={handleAdjustment}>
            Registrar ajuste
          </Button>
        </Form>
      </Card>

      <Card title="Abono de bonos por periodo">
        <Table
          rowKey="key"
          dataSource={periodRows}
          pagination={{ pageSize: 6 }}
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
              title: 'Accion',
              key: 'action',
              render: (_, period) => (
                <Popconfirm
                  title="Abonar bonos del periodo"
                  description="Se abonaran puntos de reviews sin bono previo."
                  okText="Abonar"
                  cancelText="Cancelar"
                  onConfirm={() => grantPeriodBonuses(period.id)}
                >
                  <Button size="small" loading={submitting}>
                    Abonar bonos
                  </Button>
                </Popconfirm>
              )
            }
          ]}
        />
      </Card>
    </Space>
  );
}
