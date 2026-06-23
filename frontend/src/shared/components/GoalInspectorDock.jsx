import React from 'react';

import { useAuth } from '../../app/AuthContext';
import { useGoalInspector } from '../context/GoalInspectorContext.jsx';
import { GoalInspectorPanel } from './GoalInspectorPanel.jsx';
import './GoalInspectorDock.css';

export function GoalInspectorDock() {
  const { currentUser } = useAuth();
  const {
    panels,
    selectGoal,
    closeInspector,
    minimizeInspector,
    expandInspector,
    setPanelPosition,
    goToEmployeeEvaluation,
    bringToFront
  } = useGoalInspector();

  if (currentUser.role !== 'admin' || !panels.length) {
    return null;
  }

  return (
    <>
      {panels.map((panel, index) => (
        <GoalInspectorPanel
          key={panel.id}
          panel={panel}
          stackIndex={index}
          onSelectGoal={(goal) => selectGoal(panel.id, goal)}
          onClose={() => closeInspector(panel.id)}
          onMinimize={() => minimizeInspector(panel.id)}
          onExpand={() => expandInspector(panel.id)}
          onGoToEvaluation={() => goToEmployeeEvaluation(panel.id)}
          onPositionChange={(position) => setPanelPosition(panel.id, position)}
          onFocus={() => bringToFront(panel.id)}
        />
      ))}
    </>
  );
}
