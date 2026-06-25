import React, { useEffect } from 'react';
import { notification } from 'antd';

import { useAuth } from '../../app/AuthContext';
import { listEmployeeRedemptions } from '../api/redemptions.api.js';
import { buildRedemptionNotification } from '../../features/employee/models/employeeDashboard.model.js';
import {
  hasSeenRedemptionNotification,
  markRedemptionNotificationSeen
} from '../utils/sessionPersistence.js';

const POLL_INTERVAL_MS = 15000;
const RESOLVED_STATUSES = new Set(['approved', 'rejected']);

export function RedemptionNotificationWatcher() {
  const { currentUser } = useAuth();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    let active = true;

    if (currentUser?.role !== 'employee' || !currentUser?.id) {
      return undefined;
    }

    const refreshRedemptions = async () => {
      try {
        const redemptions = await listEmployeeRedemptions(currentUser.id);
        if (!active) return;

        const notificationsToShow = [];

        for (const redemption of redemptions) {
          const redemptionId = String(redemption?._id ?? '');
          const currentStatus = redemption?.status;

          if (!redemptionId) {
            continue;
          }

          if (!RESOLVED_STATUSES.has(currentStatus)) {
            continue;
          }

          if (hasSeenRedemptionNotification(currentUser.id, redemptionId, currentStatus)) {
            continue;
          }

          const notificationPayload = buildRedemptionNotification(redemption);
          if (notificationPayload) {
            notificationsToShow.push(notificationPayload);
            markRedemptionNotificationSeen(currentUser.id, redemptionId, currentStatus);
          }
        }

        notificationsToShow.forEach((payload) => {
          api.open({
            type: payload.type,
            message: payload.message,
            description: payload.description,
            placement: 'topRight',
            duration: 6
          });
        });
      } catch (_error) {
        // Silencioso: el resto del dashboard ya maneja errores visibles y no queremos
        // interrumpir la experiencia con popups técnicos si falla solo la verificación.
      }
    };

    void refreshRedemptions();
    const timer = setInterval(() => {
      void refreshRedemptions();
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [api, currentUser?.id, currentUser?.role]);

  return contextHolder;
}
