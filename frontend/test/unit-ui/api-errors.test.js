import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toFriendlyApiErrorMessage } from '../../src/shared/utils/apiErrors.js';

describe('api errors unit', () => {
  it('maps known backend message to user friendly text', () => {
    const message = toFriendlyApiErrorMessage(
      'Insufficient merit points.',
      'Fallback'
    );

    assert.equal(message, 'Saldo insuficiente para completar la operacion.');
  });

  it('returns fallback when source message is empty', () => {
    const message = toFriendlyApiErrorMessage('', 'Error generico');
    assert.equal(message, 'Error generico');
  });

  it('keeps unknown backend message', () => {
    const message = toFriendlyApiErrorMessage('Custom domain error', 'Fallback');
    assert.equal(message, 'Custom domain error');
  });
});
