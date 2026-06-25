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
  Select,
  Skeleton,
  Space,
  Switch,
  Table,
  Tag
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useAdminRewardsController } from "../controllers/useAdminRewardsController.js";
import { formatPoints } from "../../../shared/utils/formatters.js";

// prettier-ignore
const categoryOptions = [
  { label: 'Licencias', value: 'licenses' },
  { label: 'Capacitacion', value: 'training' },
  { label: 'Hardware', value: 'hardware' },
  { label: 'Tiempo', value: 'time' },
  { label: 'Bienestar', value: 'wellness' }
];

const categoryLabelByValue = Object.fromEntries(
  categoryOptions.map((option) => [option.value, option.label])
);

export function AdminRewardsManager() {
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });
  const [editingReward, setEditingReward] = useState(null);
  const {
    loading,
    saving,
    error,
    successMessage,
    filteredRewards,
    filters,
    setFilters,
    saveReward,
    toggleRewardStatus,
    deleteReward,
    reload
  } = useAdminRewardsController();

  const sortedRewards = useMemo(
    () => [...filteredRewards].sort((a, b) => Number(a.costInPoints) - Number(b.costInPoints)),
    [filteredRewards]
  );

  const handleOpenCreate = () => {
    setEditingReward(null);
    form.resetFields();
    form.setFieldsValue({
      category: 'licenses',
      stock: 1,
      costInPoints: 100
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (reward) => {
    setEditingReward(reward);
    form.setFieldsValue({
      name: reward.name,
      description: reward.description,
      category: reward.category,
      costInPoints: reward.costInPoints,
      stock: reward.stock
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await saveReward(values, editingReward?._id ?? null);
    setOpenModal(false);
  };

  const handleDelete = async (reward) => {
    await deleteReward(reward._id);
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

      <Card
        title="Catalogo de recompensas"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Agregar recompensa
          </Button>
        }
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            allowClear
            placeholder="Categoria"
            style={{ width: 180 }}
            value={filters.category}
            onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
            options={categoryOptions}
          />
          <Select
            allowClear
            placeholder="Disponibilidad"
            style={{ width: 180 }}
            value={filters.availableOnly}
            onChange={(value) => setFilters((prev) => ({ ...prev, availableOnly: value }))}
            options={[
              { label: 'Disponibles', value: 'true' },
              { label: 'No disponibles', value: 'false' }
            ]}
          />
          <Input.Search
            allowClear
            placeholder="Buscar por nombre o descripcion"
            style={{ width: 280 }}
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
        </Space>
        <Table
          rowKey="_id"
          dataSource={sortedRewards}
          pagination={pagination}
          onChange={(p) => setPagination(p)}
          columns={[
            {
              title: 'Nombre',
              dataIndex: 'name',
              key: 'name'
            },
            {
              title: 'Categoria',
              dataIndex: 'category',
              key: 'category',
              render: (value) => <Tag>{categoryLabelByValue[value] ?? value}</Tag>
            },
            {
              title: 'Costo',
              dataIndex: 'costInPoints',
              key: 'costInPoints',
              render: (value) => formatPoints(value)
            },
            {
              title: 'Disponibilidad',
              dataIndex: 'stock',
              key: 'stock'
            },
            {
              title: 'Estado',
              dataIndex: 'isActive',
              key: 'isActive',
              render: (value, reward) => (
                <Switch
                  checked={value}
                  checkedChildren="Activo"
                  unCheckedChildren="Inactivo"
                  loading={saving}
                  onChange={() => toggleRewardStatus(reward)}
                />
              )
            },
            {
              title: 'Acciones',
              key: 'actions',
              render: (_, reward) => (
                <Space>
                  <Button onClick={() => handleOpenEdit(reward)} disabled={saving}>
                    Editar
                  </Button>
                  <Popconfirm
                    title="Borrar recompensa"
                    description="¿Estás seguro de que quieres borrarla? Esta acción no se puede deshacer."
                    onConfirm={() => handleDelete(reward)}
                    okText="Sí, borrar"
                    cancelText="Cancelar"
                    placement="topRight"
                  >
                    <Button danger disabled={saving}>Borrar</Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingReward ? 'Editar recompensa' : 'Crear recompensa'}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleSubmit}
        okText={editingReward ? 'Guardar cambios' : 'Crear recompensa'}
        confirmLoading={saving}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item name="description" label="Descripcion" rules={[{ required: true }]}>
            <Input.TextArea rows={3} maxLength={600} />
          </Form.Item>
          <Form.Item name="category" label="Categoria" rules={[{ required: true }]}>
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item name="costInPoints" label="Costo en puntos" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
