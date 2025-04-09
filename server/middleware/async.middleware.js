/**
 * Async middleware to handle asynchronous Express route handlers
 * This wraps async functions to properly catch and handle errors
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;