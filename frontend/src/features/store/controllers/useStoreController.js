import { useEffect, useMemo, useState } from 'react';

import { createRedemption } from '../../../shared/api/redemptions.api.js';
import { listRewardCatalog } from '../../../shared/api/rewards.api.js';
import { getEmployeeWallet } from '../../../shared/api/wallet.api.js';

export function useStoreController(currentUser) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rewards, setRewards] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);

  const reload = async () => {
    if (!currentUser?.id || currentUser.role !== 'employee') {
      setRewards([]);
      setWallet(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [rewardCatalog, walletResponse] = await Promise.all([
        listRewardCatalog(),
        getEmployeeWallet(currentUser.id)
      ]);

      setRewards(rewardCatalog);
      setWallet(walletResponse);
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cargar la tienda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [currentUser?.id, currentUser?.role]);

  const estimatedBalanceAfter = useMemo(() => {
    if (!selectedReward) return wallet?.balance ?? 0;
    return (wallet?.balance ?? 0) - selectedReward.costInPoints;
  }, [selectedReward, wallet?.balance]);

  const canRedeemSelected =
    selectedReward && (wallet?.balance ?? 0) >= selectedReward.costInPoints && selectedReward.stock > 0;

  const openCheckout = (reward) => {
    setSelectedReward(reward);
    setSuccessMessage('');
  };

  const closeCheckout = () => {
    setSelectedReward(null);
  };

  const submitRedemption = async (requestNote = '') => {
    if (!selectedReward || !currentUser?.id) return;

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await createRedemption({
        employeeId: currentUser.id,
        rewardId: selectedReward._id,
        requestNote
      });

      setSuccessMessage(`Canje solicitado para "${selectedReward.name}".`);
      await reload();
      setSelectedReward(null);
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible solicitar el canje.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    error,
    successMessage,
    rewards,
    wallet,
    selectedReward,
    estimatedBalanceAfter,
    canRedeemSelected,
    openCheckout,
    closeCheckout,
    submitRedemption,
    reload
  };
}
