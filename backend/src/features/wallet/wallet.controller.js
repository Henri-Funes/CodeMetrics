import {
  createAdminAdjustment,
  getEmployeeWallet,
  grantPerformancePeriodBonuses,
  grantPerformanceReviewBonus,
  listMeritTransactions
} from './wallet.service.js';

export async function listMeritTransactionsHandler(req, res, next) {
  try {
    const transactions = await listMeritTransactions(req.query);
    res.json({ data: transactions });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeWalletHandler(req, res, next) {
  try {
    const wallet = await getEmployeeWallet(req.params.employeeId);
    res.json({ data: wallet });
  } catch (error) {
    next(error);
  }
}

export async function listEmployeeMeritTransactionsHandler(req, res, next) {
  try {
    const transactions = await listMeritTransactions({
      ...req.query,
      employeeId: req.params.employeeId
    });
    res.json({ data: transactions });
  } catch (error) {
    next(error);
  }
}

export async function createAdminAdjustmentHandler(req, res, next) {
  try {
    const transaction = await createAdminAdjustment(req.body);
    res.status(201).json({ data: transaction });
  } catch (error) {
    next(error);
  }
}

export async function grantPerformanceReviewBonusHandler(req, res, next) {
  try {
    const transaction = await grantPerformanceReviewBonus(
      req.params.reviewId,
      req.body.createdBy
    );
    res.status(201).json({ data: transaction });
  } catch (error) {
    next(error);
  }
}

export async function grantPerformancePeriodBonusesHandler(req, res, next) {
  try {
    const result = await grantPerformancePeriodBonuses(req.params.periodId, req.body.createdBy);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}
