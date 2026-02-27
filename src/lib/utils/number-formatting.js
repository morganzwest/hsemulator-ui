/**
 * Format numbers with proper thousand separators and abbreviations
 */

/**
 * Format a number with thousand separators
 * @param {number} num - The number to format
 * @returns {string} - Formatted number with commas
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '∞';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format a number with abbreviations for large numbers
 * @param {number} num - The number to format
 * @returns {Object} - Object with formatted value and tooltip
 */
export function formatNumberWithAbbreviation(num) {
  if (num === null || num === undefined) {
    return { value: '∞', tooltip: null };
  }

  if (num < 1000) {
    return { value: num.toString(), tooltip: null };
  }

  if (num >= 1000 && num < 10000) {
    return { 
      value: formatNumber(num), 
      tooltip: null 
    };
  }

  if (num >= 10000 && num < 20000) {
    return { 
      value: formatNumber(num), 
      tooltip: null 
    };
  }

  if (num >= 20000 && num < 1000000) {
    return { 
      value: `${(num / 1000).toFixed(0)}k`, 
      tooltip: formatNumber(num) 
    };
  }

  if (num >= 1000000 && num < 1000000000) {
    return { 
      value: `${(num / 1000000).toFixed(1)}M`, 
      tooltip: formatNumber(num) 
    };
  }

  return { 
    value: `${(num / 1000000000).toFixed(1)}B`, 
    tooltip: formatNumber(num) 
  };
}

/**
 * Format a number for display in limits (combines both formatters)
 * @param {number} num - The number to format
 * @param {boolean} useAbbreviation - Whether to use abbreviations for large numbers
 * @returns {Object} - Object with formatted value and tooltip
 */
export function formatLimitNumber(num, useAbbreviation = true) {
  if (useAbbreviation) {
    return formatNumberWithAbbreviation(num);
  }
  return { value: formatNumber(num), tooltip: null };
}
