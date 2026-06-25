import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  hasSeenRedemptionNotification,
  markRedemptionNotificationSeen
} from '../../src/shared/utils/sessionPersistence.js';

describe('session persistence redemption notifications', () => {
  it('stores and reads seen redemption notifications per employee', () => {
    const previousWindow = globalThis.window;
    const store = new Map();

    globalThis.window = {
      sessionStorage: {
        getItem(key) {
          return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
          store.set(key, value);
        },
        removeItem(key) {
          store.delete(key);
        }
      }
    };

    try {
      assert.equal(hasSeenRedemptionNotification('emp-1', 'red-1', 'approved'), false);
      markRedemptionNotificationSeen('emp-1', 'red-1', 'approved');

      assert.equal(hasSeenRedemptionNotification('emp-1', 'red-1', 'approved'), true);
      assert.equal(hasSeenRedemptionNotification('emp-2', 'red-1', 'approved'), false);
      assert.equal(hasSeenRedemptionNotification('emp-1', 'red-1', 'rejected'), false);
    } finally {
      globalThis.window = previousWindow;
    }
  });
});
