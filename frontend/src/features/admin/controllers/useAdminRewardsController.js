import { useEffect, useState } from 'react';

import {
  activateReward,
  createReward,
  deactivateReward,
  listRewards,
  updateReward
} from '../../../shared/api/rewards.api.js';

export function useAdminRewardsController() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rewards, setRewards] = useState([]);

  const reload = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listRewards({ includeInactive: 'true' });
      setRewards(data);
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cargar recompensas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const saveReward = async (payload, editingId = null) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (editingId) {
        await updateReward(editingId, payload);
        setSuccessMessage('Recompensa actualizada correctamente.');
      } else {
        await createReward(payload);
        setSuccessMessage('Recompensa creada correctamente.');
      }
      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible guardar la recompensa.');
    } finally {
      setSaving(false);
    }
  };

  const toggleRewardStatus = async (reward) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (reward.isActive) {
        await deactivateReward(reward._id);
        setSuccessMessage('Recompensa desactivada.');
      } else {
        await activateReward(reward._id);
        setSuccessMessage('Recompensa activada.');
      }

      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cambiar el estado de la recompensa.');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    successMessage,
    rewards,
    saveReward,
    toggleRewardStatus,
    reload
  };
}
