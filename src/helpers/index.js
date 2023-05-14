export * from './terminate.js';

/**
 * @param {number} numerator
 * @param {number} denominator
 * @returns {number}
 */
export function calculatePercentage(numerator, denominator) {
  return Math.floor((numerator / denominator) * 100);
}

export const CODE = {
  SUCCESS: 0,
  ERROR: 1,
};
