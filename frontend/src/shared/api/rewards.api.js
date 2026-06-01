import { requestApi } from './backendClient.js';

export async function listRewardCatalog(params = {}) {
  const payload = await requestApi(
    {
      method: 'get',
      url: '/api/rewards/catalog',
      params
    },
    'No fue posible cargar el catalogo de recompensas.'
  );

  return payload.data ?? [];
}

export async function listRewards(params = {}) {
  const payload = await requestApi(
    {
      method: 'get',
      url: '/api/rewards',
      params
    },
    'No fue posible cargar recompensas.'
  );

  return payload.data ?? [];
}

export async function createReward(payload) {
  const response = await requestApi(
    {
      method: 'post',
      url: '/api/rewards',
      data: payload
    },
    'No fue posible crear la recompensa.'
  );

  return response.data ?? null;
}

export async function updateReward(rewardId, payload) {
  const response = await requestApi(
    {
      method: 'patch',
      url: `/api/rewards/${rewardId}`,
      data: payload
    },
    'No fue posible actualizar la recompensa.'
  );

  return response.data ?? null;
}

export async function activateReward(rewardId) {
  const response = await requestApi(
    {
      method: 'patch',
      url: `/api/rewards/${rewardId}/activate`
    },
    'No fue posible activar la recompensa.'
  );

  return response.data ?? null;
}

export async function deactivateReward(rewardId) {
  const response = await requestApi(
    {
      method: 'patch',
      url: `/api/rewards/${rewardId}/deactivate`
    },
    'No fue posible desactivar la recompensa.'
  );

  return response.data ?? null;
}
