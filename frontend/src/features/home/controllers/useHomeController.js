import { useEffect, useState } from 'react';

import { getHomeMetrics } from '../models/home.model.js';
import { getBackendHealth } from '../../../shared/api/backendClient.js';

export function useHomeController() {
  const [health, setHealth] = useState({
    loading: true,
    status: 'checking',
    database: 'checking'
  });

  useEffect(() => {
    let active = true;

    getBackendHealth()
      .then((data) => {
        if (!active) return;
        setHealth({
          loading: false,
          status: data.status ?? 'unknown',
          database: data.database ?? 'unknown'
        });
      })
      .catch(() => {
        if (!active) return;
        setHealth({
          loading: false,
          status: 'unavailable',
          database: 'unknown'
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    metrics: getHomeMetrics(),
    health
  };
}
