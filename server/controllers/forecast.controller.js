const forecastService = require('../services/forecastService');
const asyncHandler = require('../middleware/async.middleware');

/**
 * @desc    Get expense forecast
 * @route   GET /api/forecast/expenses
 * @access  Private
 */
exports.getExpenseForecast = asyncHandler(async (req, res) => {
  const { months = 3, includeSavings = true, includeIncome = true } = req.query;
  
  const options = {
    months: parseInt(months),
    includeSavings: includeSavings === 'true',
    includeIncome: includeIncome === 'true'
  };
  
  const forecast = await forecastService.generateExpenseForecast(req.user.id, options);
  
  res.status(200).json({
    success: true,
    data: forecast
  });
});

/**
 * @desc    Get cashflow prediction
 * @route   GET /api/forecast/cashflow
 * @access  Private
 */
exports.getCashflowPrediction = asyncHandler(async (req, res) => {
  const prediction = await forecastService.getCashflowPrediction(req.user.id);
  
  res.status(200).json({
    success: true,
    data: prediction
  });
});