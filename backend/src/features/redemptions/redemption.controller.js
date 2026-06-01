import {
  approveRedemption,
  getRedemptionById,
  getRedemptionSummary,
  listRedemptions,
  markRedemptionDelivered,
  rejectRedemption,
  requestRedemption
} from './redemption.service.js';

export async function listRedemptionsHandler(req, res, next) {
  try {
    const redemptions = await listRedemptions(req.query);
    res.json({ data: redemptions });
  } catch (error) {
    next(error);
  }
}

export async function listEmployeeRedemptionsHandler(req, res, next) {
  try {
    const redemptions = await listRedemptions({
      ...req.query,
      employeeId: req.params.employeeId
    });
    res.json({ data: redemptions });
  } catch (error) {
    next(error);
  }
}

export async function getRedemptionHandler(req, res, next) {
  try {
    const redemption = await getRedemptionById(req.params.redemptionId);
    res.json({ data: redemption });
  } catch (error) {
    next(error);
  }
}

export async function requestRedemptionHandler(req, res, next) {
  try {
    const result = await requestRedemption(req.body);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function approveRedemptionHandler(req, res, next) {
  try {
    const redemption = await approveRedemption(req.params.redemptionId, req.body);
    res.json({ data: redemption });
  } catch (error) {
    next(error);
  }
}

export async function rejectRedemptionHandler(req, res, next) {
  try {
    const result = await rejectRedemption(req.params.redemptionId, req.body);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function deliverRedemptionHandler(req, res, next) {
  try {
    const redemption = await markRedemptionDelivered(req.params.redemptionId, req.body);
    res.json({ data: redemption });
  } catch (error) {
    next(error);
  }
}

export async function getRedemptionSummaryHandler(_req, res, next) {
  try {
    const summary = await getRedemptionSummary();
    res.json({ data: summary });
  } catch (error) {
    next(error);
  }
}
