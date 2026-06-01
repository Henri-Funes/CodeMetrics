import { useEffect, useState } from 'react';

import {
  approveRedemption,
  deliverRedemption,
  listRedemptions,
  rejectRedemption
} from '../../../shared/api/redemptions.api.js';

export function useAdminRedemptionsController(currentUser) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [redemptions, setRedemptions] = useState([]);

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await listRedemptions();
      setRedemptions(list);
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cargar los canjes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const updateRedemption = async (redemption, action, decisionReason = '') => {
    setUpdating(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      reviewedBy: currentUser?.id ?? null,
      decisionReason
    };

    try {
      if (action === 'approve') {
        await approveRedemption(redemption._id, payload);
        setSuccessMessage('Canje aprobado.');
      } else if (action === 'reject') {
        await rejectRedemption(redemption._id, payload);
        setSuccessMessage('Canje rechazado y reembolsado.');
      } else if (action === 'deliver') {
        await deliverRedemption(redemption._id, payload);
        setSuccessMessage('Canje marcado como entregado.');
      }

      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible actualizar el canje.');
    } finally {
      setUpdating(false);
    }
  };

  return {
    loading,
    updating,
    error,
    successMessage,
    redemptions,
    updateRedemption,
    reload
  };
}
