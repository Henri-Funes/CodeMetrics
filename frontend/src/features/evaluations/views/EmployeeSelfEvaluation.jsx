import React, { useEffect } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Progress,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography
} from 'antd';

import { useAuth } from '../../../app/AuthContext';
import { formatDate, formatPoints, formatScore } from '../../../shared/utils/formatters.js';
import { useEmployeeEvaluationController } from '../controllers/useEmployeeEvaluationController.js';
import { evaluationStatusColor } from '../models/evaluations.model.js';

const { Paragraph, Text, Title } = Typography;

export function EmployeeSelfEvaluation() {
  const [form] = Form.useForm();
  const { currentUser } = useAuth();
  const {
    loading,
    saving,
    error,
    successMessage,
    periods,
    selectedPeriod,
    selectedPeriodId,
    setSelectedPeriodId,
    selectedReview,
    canEditSelfEvaluation,
    saveSelfEvaluation,
    reload
  } = useEmployeeEvaluationController(currentUser);

  useEffect(() => {
    form.setFieldsValue({
      technicalAchievements: selectedReview?.selfEvaluation?.technicalAchievements ?? '',
      blockers: selectedReview?.selfEvaluation?.blockers ?? '',
      collaborationNotes: selectedReview?.selfEvaluation?.collaborationNotes ?? '',
      learningNotes: selectedReview?.selfEvaluation?.learningNotes ?? '',
      selfScore: selectedReview?.selfEvaluation?.selfScore ?? 75
    });
  }, [form, selectedReview]);

  if (currentUser.role !== 'employee') {
    return (
      <Alert
        showIcon
        type="info"
        message="Selecciona un usuario con rol empleado para completar autoevaluaciones."
      />
    );
  }

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await saveSelfEvaluation(values);
  };

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
          <Text type="secondary">Evaluacion de desempeno</Text>
          <Title level={4} style={{ margin: 0 }}>
            Autoevaluacion del colaborador
          </Title>
          <Paragraph style={{ marginBottom: 0 }}>
            Registra tus logros, bloqueos y aprendizajes para que el supervisor cierre la evaluacion.
          </Paragraph>
        </Space>
      </Card>

      <Card title="Periodo de evaluacion">
        <Space wrap>
          <Select
            style={{ width: 220 }}
            value={selectedPeriodId}
            onChange={setSelectedPeriodId}
            options={periods.map((period) => ({
              value: period._id,
              label: period.label
            }))}
          />
          {selectedReview ? (
            <Tag color={evaluationStatusColor[selectedReview.status]}>{selectedReview.statusLabel}</Tag>
          ) : (
            <Tag color="default">Sin enviar</Tag>
          )}
          <Text type="secondary">Periodo: {selectedPeriod?.label ?? 'No seleccionado'}</Text>
        </Space>
      </Card>

      <Card title="Formulario de autoevaluacion">
        <Form layout="vertical" form={form} disabled={!canEditSelfEvaluation}>
          <Form.Item
            name="technicalAchievements"
            label="Logros tecnicos"
            rules={[{ required: true, message: 'Describe tus principales logros.' }]}
          >
            <Input.TextArea rows={3} maxLength={800} showCount />
          </Form.Item>
          <Form.Item name="blockers" label="Bloqueos o dificultades">
            <Input.TextArea rows={3} maxLength={800} showCount />
          </Form.Item>
          <Form.Item
            name="collaborationNotes"
            label="Colaboracion y habilidades blandas"
            rules={[{ required: true, message: 'Describe tu colaboracion con el equipo.' }]}
          >
            <Input.TextArea rows={3} maxLength={800} showCount />
          </Form.Item>
          <Form.Item name="learningNotes" label="Aprendizaje y mejora continua">
            <Input.TextArea rows={3} maxLength={800} showCount />
          </Form.Item>
          <Form.Item name="selfScore" label="Auto puntaje (0-100)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Button
            type="primary"
            loading={saving}
            disabled={!selectedPeriodId || !canEditSelfEvaluation}
            onClick={handleSubmit}
          >
            Enviar autoevaluacion
          </Button>
          {!canEditSelfEvaluation ? (
            <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
              Esta evaluacion ya fue revisada o finalizada por el supervisor.
            </Paragraph>
          ) : null}
        </Form>
      </Card>

      {selectedReview?.status === 'finalized' ? (
        <Card title="Resultado final">
          <Space size={24} wrap>
            <Progress
              type="dashboard"
              percent={Math.round(selectedReview.finalScore)}
              format={(percent) => `${percent}/100`}
            />
            <Statistic title="Score final" value={formatScore(selectedReview.finalScore)} />
            <Statistic
              title="Puntos generados"
              value={selectedReview.pointsAwarded}
              formatter={(value) => formatPoints(value)}
            />
            <Statistic title="Finalizada" value={formatDate(selectedReview.finalizedAt)} />
          </Space>
        </Card>
      ) : null}
    </Space>
  );
}
