import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
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
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { useAuth } from '../../../app/AuthContext';
import { formatDate, formatPoints, formatScore } from '../../../shared/utils/formatters.js';
import { useAdminEvaluationsController } from '../controllers/useAdminEvaluationsController.js';
import {
  buildPeriodLabel,
  calculateEvaluationPreview,
  evaluationKpis,
  evaluationStatusColor,
  evaluationStatusOptions,
  monthOptions
} from '../models/evaluations.model.js';

const { Paragraph, Text } = Typography;

const currentDate = new Date();

function createDefaultPeriodRow() {
  return {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  };
}

export function AdminEvaluationsManager() {
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const { currentUser } = useAuth();
  const [selectedReview, setSelectedReview] = useState(null);
  const [previewKpis, setPreviewKpis] = useState({});
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const {
    loading,
    saving,
    error,
    successMessage,
    filteredReviews,
    employees,
    periods,
    openPeriods,
    filters,
    setFilters,
    summary,
    assignPeriods,
    saveSupervisorEvaluation,
    finalizeReview,
    reload
  } = useAdminEvaluationsController(currentUser);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee._id,
        label: `${employee.name} - ${employee.position}`
      })),
    [employees]
  );

  const periodOptions = useMemo(
    () => periods.map((period) => ({ value: period._id, label: period.label })),
    [periods]
  );

  const previewScore = useMemo(() => calculateEvaluationPreview(previewKpis), [previewKpis]);

  const openReviewDrawer = (review) => {
    const initialKpis = {
      qualityScore: review.supervisorEvaluation?.qualityScore ?? review.kpis?.qualityScore ?? 80,
      deliveryScore: review.supervisorEvaluation?.deliveryScore ?? review.kpis?.deliveryScore ?? 80,
      bugFixRate: review.supervisorEvaluation?.bugFixRate ?? review.kpis?.bugFixRate ?? 80,
      collaborationScore:
        review.supervisorEvaluation?.collaborationScore ?? review.kpis?.collaborationScore ?? 80,
      innovationScore: review.supervisorEvaluation?.innovationScore ?? review.kpis?.innovationScore ?? 80,
      comments: review.supervisorEvaluation?.comments ?? review.notes ?? ''
    };

    setSelectedReview(review);
    setPreviewKpis(initialKpis);
    form.setFieldsValue(initialKpis);
  };

  const handleValuesChange = (_changedValues, allValues) => {
    setPreviewKpis(allValues);
  };

  const handleSaveSupervisor = async () => {
    const values = await form.validateFields();
    await saveSupervisorEvaluation(selectedReview._id, values);
    setSelectedReview(null);
  };

  const openAssignModal = () => {
    assignForm.setFieldsValue({
      periods: [createDefaultPeriodRow()]
    });
    setAssignModalOpen(true);
  };

  const handleAssignPeriods = async () => {
    const values = await assignForm.validateFields();
    const periodInputs = (values.periods ?? []).map((period) => ({
      month: period.month,
      year: period.year
    }));

    await assignPeriods(periodInputs);
    setAssignModalOpen(false);
    assignForm.resetFields();
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
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="Total" value={summary.total} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="Borradores" value={summary.drafts} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="Pendientes supervisor" value={summary.pendingSupervisor} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="Revisadas" value={summary.reviewed} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="Finalizadas" value={summary.finalized} />
          </Card>
        </Col>
      </Row>

      {openPeriods.length > 0 ? (
        <Card title="Periodos abiertos para autoevaluacion" size="small">
          <Space wrap>
            {openPeriods.map((period) => (
              <Tag key={period._id} color="blue">
                {period.label}
              </Tag>
            ))}
          </Space>
        </Card>
      ) : null}

      <Card title="Evaluaciones de desempeno">
        <Space wrap style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={openAssignModal}>
            Asignar autoevaluaciones
          </Button>
          <Select
            allowClear
            placeholder="Estado"
            style={{ width: 180 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={evaluationStatusOptions}
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
            showSearch
            optionFilterProp="label"
            placeholder="Empleado"
            style={{ width: 240 }}
            value={filters.employeeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employeeOptions}
          />
          <Input.Search
            allowClear
            placeholder="Buscar empleado o area"
            style={{ width: 260 }}
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
        </Space>

        <Table
          rowKey="_id"
          dataSource={filteredReviews}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1280 }}
          columns={[
            {
              title: 'Empleado',
              key: 'employee',
              width: 240,
              render: (_, review) => (
                <Space orientation="vertical" size={0}>
                  <Text strong>{review.employeeName}</Text>
                  <Text type="secondary">{review.employeePosition}</Text>
                </Space>
              )
            },
            {
              title: 'Area',
              dataIndex: 'employeeDepartment',
              key: 'department',
              width: 170
            },
            {
              title: 'Periodo',
              dataIndex: 'periodLabel',
              key: 'period',
              width: 120
            },
            {
              title: 'Estado',
              dataIndex: 'status',
              key: 'status',
              width: 150,
              render: (value, review) => (
                <Tag color={evaluationStatusColor[value]}>{review.statusLabel}</Tag>
              )
            },
            {
              title: 'Score',
              dataIndex: 'finalScore',
              key: 'finalScore',
              width: 100,
              render: (value) => <Text strong>{formatScore(value)}</Text>
            },
            {
              title: 'Puntos',
              dataIndex: 'pointsAwarded',
              key: 'pointsAwarded',
              width: 130,
              render: (value) => formatPoints(value)
            },
            {
              title: 'Actualizada',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              width: 130,
              render: (value) => formatDate(value)
            },
            {
              title: 'Acciones',
              key: 'actions',
              width: 240,
              render: (_, review) => (
                <Space size={8}>
                  <Button
                    size="small"
                    onClick={() => openReviewDrawer(review)}
                    disabled={review.status === 'finalized' || review.status === 'draft'}
                  >
                    Revisar
                  </Button>
                  <Popconfirm
                    title="Finalizar evaluacion"
                    description="Se cerrara el score final y quedara listo para incentivos."
                    okText="Finalizar"
                    cancelText="Cancelar"
                    onConfirm={() => finalizeReview(review._id)}
                  >
                    <Button
                      size="small"
                      type="primary"
                      loading={saving}
                      disabled={review.status !== 'supervisor_reviewed'}
                    >
                      Finalizar
                    </Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title="Asignar autoevaluaciones"
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onOk={handleAssignPeriods}
        okText="Asignar periodos"
        cancelText="Cancelar"
        confirmLoading={saving}
        destroyOnHidden
      >
        <Paragraph type="secondary">
          Cada fila representa un periodo mensual. Se crearan evaluaciones en borrador para todos los
          empleados activos, incluyendo periodos futuros.
        </Paragraph>
        <Form form={assignForm} layout="vertical">
          <Form.List name="periods">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" wrap style={{ marginBottom: 12 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'month']}
                      label="Mes"
                      rules={[{ required: true, message: 'Selecciona un mes.' }]}
                    >
                      <Select style={{ width: 160 }} options={monthOptions} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'year']}
                      label="Ano"
                      rules={[{ required: true, message: 'Ingresa el ano.' }]}
                    >
                      <InputNumber min={2020} max={2100} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item shouldUpdate noStyle>
                      {() => {
                        const month = assignForm.getFieldValue(['periods', name, 'month']);
                        const year = assignForm.getFieldValue(['periods', name, 'year']);

                        if (!month || !year) return null;

                        return <Tag color="processing">{buildPeriodLabel(month, year)}</Tag>;
                      }}
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    ) : null}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add(createDefaultPeriodRow())} icon={<PlusOutlined />}>
                  Agregar otro periodo
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Drawer
        title={selectedReview ? `Revision: ${selectedReview.employeeName}` : 'Revision de desempeno'}
        open={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        width={560}
        destroyOnHidden
      >
        {selectedReview ? (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Periodo">{selectedReview.periodLabel}</Descriptions.Item>
              <Descriptions.Item label="Auto puntaje">
                {selectedReview.selfEvaluation?.selfScore ?? 0}/100
              </Descriptions.Item>
              <Descriptions.Item label="Logros tecnicos">
                {selectedReview.selfEvaluation?.technicalAchievements || 'Sin informacion.'}
              </Descriptions.Item>
              <Descriptions.Item label="Bloqueos">
                {selectedReview.selfEvaluation?.blockers || 'Sin bloqueos reportados.'}
              </Descriptions.Item>
              <Descriptions.Item label="Colaboracion">
                {selectedReview.selfEvaluation?.collaborationNotes || 'Sin informacion.'}
              </Descriptions.Item>
            </Descriptions>

            <Card title="KPI del supervisor">
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Progress
                  type="dashboard"
                  percent={Math.round(previewScore)}
                  format={(percent) => `${percent}/100`}
                />
                <Form
                  layout="vertical"
                  form={form}
                  onValuesChange={handleValuesChange}
                  disabled={selectedReview.status === 'finalized'}
                >
                  {evaluationKpis.map((kpi) => (
                    <Form.Item
                      key={kpi.key}
                      name={kpi.key}
                      label={`${kpi.label} (${Math.round(kpi.weight * 100)}%)`}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  ))}
                  <Form.Item name="comments" label="Comentarios del supervisor">
                    <Input.TextArea rows={3} maxLength={800} showCount />
                  </Form.Item>
                </Form>
                <Button type="primary" loading={saving} onClick={handleSaveSupervisor}>
                  Guardar revision del supervisor
                </Button>
              </Space>
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}
