import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildRedemptionNotification } from '../../src/features/employee/models/employeeDashboard.model.js';

describe('redemption notifications unit', () => {
  it('builds a success popup for approved redemptions', () => {
    const notification = buildRedemptionNotification({
      _id: 'red-1',
      status: 'approved',
      pointsSpent: 450,
      rewardSnapshot: { name: 'Teclado mecanico' }
    });

    assert.equal(notification.type, 'success');
    assert.equal(notification.message, 'Canje aprobado');
    assert.match(notification.description, /Teclado mecanico/);
  });

  it('builds an error popup for rejected redemptions', () => {
    const notification = buildRedemptionNotification({
      _id: 'red-2',
      status: 'rejected',
      pointsSpent: 250,
      rewardSnapshot: { name: 'Dia libre' }
    });

    assert.equal(notification.type, 'error');
    assert.equal(notification.message, 'Canje rechazado');
    assert.match(notification.description, /reembolsados/);
  });

  it('returns null for non-resolved redemptions', () => {
    const notification = buildRedemptionNotification({
      _id: 'red-3',
      status: 'pending'
    });

    assert.equal(notification, null);
  });
});
