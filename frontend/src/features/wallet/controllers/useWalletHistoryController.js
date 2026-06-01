import { useCallback, useEffect, useState } from 'react';

import { getEmployeeWallet, listEmployeeWalletTransactions } from '../../../shared/api/wallet.api.js';

export function useWalletHistoryController(currentUser) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const reload = useCallback(() => {
    if (!currentUser?.id || currentUser.role !== 'employee') {
      setLoading(false);
      setWallet(null);
      setTransactions([]);
      return Promise.resolve();
    }

    setLoading(true);
    setError('');

    return Promise.all([
      getEmployeeWallet(currentUser.id),
      listEmployeeWalletTransactions(currentUser.id)
    ])
      .then(([walletResponse, transactionList]) => {
        setWallet(walletResponse);
        setTransactions(transactionList);
      })
      .catch((requestError) => {
        setError(requestError.message ?? 'No fue posible cargar la billetera.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  return {
    loading,
    error,
    wallet,
    transactions,
    reload
  };
}
