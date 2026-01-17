/**
 * Utility functions for number formatting and rounding
 */

/**
 * Rounds a number to a specified number of decimal places
 * @param value - The number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns The rounded number
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Rounds currency values to 2 decimal places
 * @param value - The currency value to round
 * @returns The rounded currency value
 */
export function roundCurrency(value: number): number {
  return roundToDecimals(value, 2);
}

/**
 * Rounds time values (hours) to 1 decimal place
 * @param value - The time value to round
 * @returns The rounded time value
 */
export function roundTime(value: number): number {
  return roundToDecimals(value, 1);
}

/**
 * Formats a number as currency with a currency symbol
 * @param value - The value to format
 * @param currencySymbol - Optional currency symbol (defaults to €)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currencySymbol: string = '€'): string {
  return `${currencySymbol}${roundCurrency(value).toFixed(2)}`;
}

/**
 * Formats a number as percentage
 * @param value - The value to format (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${roundToDecimals(value, decimals)}%`;
}
