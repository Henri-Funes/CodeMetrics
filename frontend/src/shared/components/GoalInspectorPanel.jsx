import React, { useEffect, useRef } from 'react';
import {
  Button,
  Descriptions,
  Progress,
  Space,
  Statistic,
  Tag,
  Typography
} from 'antd';
import {
  CloseOutlined,
  MinusOutlined,
  ExpandOutlined,
  AuditOutlined
} from '@ant-design/icons';

import { formatDate } from '../utils/formatters.js';
import {
  formatGoalProgressDetail,
  goalStatusColor,
  summarizeEmployeePeriodGoals
} from '../../features/goals/models/goals.model.js';

const { Text, Paragraph } = Typography;

const progressColorByStatus = {
  completed: '#1dd1a1',
  in_progress: '#00e5ff',
  at_risk: '#feca57',
  not_started: '#a7b1c2',
  cancelled: '#ff6b6b'
};

export function GoalInspectorPanel({
  panel,
  stackIndex,
  onSelectGoal,
  onClose,
  onMinimize,
  onExpand,
  onGoToEvaluation,
  onPositionChange,
  onFocus
}) {
  const dockRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const { selectedGoal, peerGoals, isMinimized, position, zIndex } = panel;

  useEffect(() => {
    if (!dockRef.current || position?.x === null || position?.y === null) return;

    dockRef.current.style.left = `${position.x}px`;
    dockRef.current.style.top = `${position.y}px`;
    dockRef.current.style.right = 'auto';
    dockRef.current.style.bottom = 'auto';
  }, [position]);

  if (!selectedGoal) return null;

  const periodSummary = summarizeEmployeePeriodGoals(peerGoals);
  const offset = stackIndex * 28;
  const dockStyle =
    position?.x !== null && position?.y !== null
      ? { zIndex }
      : {
          zIndex,
          right: 24 + offset,
          bottom: 24 + offset
        };

  const handleHeaderMouseDown = (event) => {
    onFocus();
    if (event.target.closest('button')) return;

    const dock = dockRef.current;
    if (!dock) return;

    const rect = dock.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const handleMouseMove = (moveEvent) => {
      const nextX = moveEvent.clientX - dragOffsetRef.current.x;
      const nextY = moveEvent.clientY - dragOffsetRef.current.y;
      const maxX = window.innerWidth - dock.offsetWidth - 8;
      const maxY = window.innerHeight - dock.offsetHeight - 8;

      onPositionChange({
        x: Math.min(Math.max(8, nextX), maxX),
        y: Math.min(Math.max(8, nextY), maxY)
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={dockRef}
      className={`goal-inspector-dock${isMinimized ? ' goal-inspector-dock--minimized' : ''}`}
      style={dockStyle}
      onMouseDown={onFocus}
    >
      <div className="goal-inspector-dock__header" onMouseDown={handleHeaderMouseDown}>
        <div className="goal-inspector-dock__title">
          <Text strong ellipsis style={{ display: 'block', maxWidth: 220 }}>
            {selectedGoal.employeeName}
          </Text>
          <Text type="secondary" ellipsis style={{ fontSize: 12, maxWidth: 220 }}>
            {selectedGoal.title}
          </Text>
        </div>
        <Space size={4}>
          {isMinimized ? (
            <Button
              type="text"
              size="small"
              icon={<ExpandOutlined />}
              onClick={onExpand}
              aria-label="Expandir"
            />
          ) : (
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined />}
              onClick={onMinimize}
              aria-label="Minimizar"
            />
          )}
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            aria-label="Cerrar"
          />
        </Space>
      </div>

      {!isMinimized ? (
        <>
          <div className="goal-inspector-dock__body">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Space wrap>
                <Tag color={goalStatusColor[selectedGoal.status]}>{selectedGoal.statusLabel}</Tag>
                <Tag color="cyan">{selectedGoal.periodLabel}</Tag>
                <Tag>{selectedGoal.categoryLabel}</Tag>
              </Space>

              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Empleado">
                  {selectedGoal.employeeName} — {selectedGoal.employeePosition}
                </Descriptions.Item>
                <Descriptions.Item label="Objetivo">{selectedGoal.title}</Descriptions.Item>
                <Descriptions.Item label="Descripcion">{selectedGoal.description}</Descriptions.Item>
                <Descriptions.Item label="Avance registrado">
                  {formatGoalProgressDetail(selectedGoal)}
                </Descriptions.Item>
                <Descriptions.Item label="Progreso global">{selectedGoal.progress}%</Descriptions.Item>
                <Descriptions.Item label="Peso en periodo">{selectedGoal.weight}%</Descriptions.Item>
                <Descriptions.Item label="Vence">
                  {selectedGoal.dueDate ? formatDate(selectedGoal.dueDate) : 'Sin fecha'}
                </Descriptions.Item>
                <Descriptions.Item label="Evidencia">
                  {selectedGoal.evidenceNote?.trim()
                    ? selectedGoal.evidenceNote
                    : 'Sin evidencia registrada por el colaborador.'}
                </Descriptions.Item>
              </Descriptions>

              <Progress
                percent={selectedGoal.progress}
                strokeColor={progressColorByStatus[selectedGoal.status]}
                format={(percent) => `${percent}%`}
              />

              <Space size={24} wrap>
                <Statistic title="Objetivos del periodo" value={periodSummary.total} />
                <Statistic title="Completados" value={periodSummary.completed} />
                <Statistic title="Avance prom." value={periodSummary.averageProgress} suffix="%" />
              </Space>

              {peerGoals.length > 1 ? (
                <div className="goal-inspector-dock__peer-list">
                  <Text strong>Otros objetivos del mismo periodo</Text>
                  {peerGoals.map((goal) => (
                    <div
                      key={goal._id}
                      className={`goal-inspector-dock__peer-item${
                        goal._id === selectedGoal._id ? ' goal-inspector-dock__peer-item--active' : ''
                      }`}
                      onClick={() => onSelectGoal(goal)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') onSelectGoal(goal);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <Space orientation="vertical" size={2} style={{ width: '100%' }}>
                        <Text strong ellipsis>
                          {goal.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatGoalProgressDetail(goal)} — {goal.progress}%
                        </Text>
                      </Space>
                    </div>
                  ))}
                </div>
              ) : null}
            </Space>
          </div>

          <div className="goal-inspector-dock__footer">
            <Paragraph type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
              Puedes abrir varias ventanas y mantenerlas al cambiar de pagina o recargar.
            </Paragraph>
            <Button type="primary" block icon={<AuditOutlined />} onClick={onGoToEvaluation}>
              Ir a evaluar empleado
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
