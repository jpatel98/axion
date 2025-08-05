/**
 * Date utility functions to handle date parsing and formatting consistently
 * across the application, avoiding timezone issues with date-only strings.
 */

/**
 * Parse a YYYY-MM-DD date string as a local date (not UTC).
 * This prevents the timezone offset issue where dates appear one day behind.
 * 
 * @param dateString - Date string in format YYYY-MM-DD
 * @returns Date object representing the date in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') {
    return new Date(); // Return current date for invalid input
  }

  // Split the date string and parse components manually to avoid UTC interpretation
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date(); // Return current date for invalid format
  }

  // Create date using local timezone (month is 0-indexed)
  return new Date(year, month - 1, day);
}

/**
 * Format a YYYY-MM-DD date string for display using local timezone.
 * 
 * @param dateString - Date string in format YYYY-MM-DD
 * @param options - Intl.DateTimeFormatOptions for customizing the output
 * @returns Formatted date string
 */
export function formatLocalDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string {
  if (!dateString || typeof dateString !== 'string') {
    return '';
  }

  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate the difference in days between a given date and today.
 * Positive values indicate future dates, negative values indicate past dates.
 * 
 * @param dateString - Date string in format YYYY-MM-DD
 * @returns Number of days difference (positive for future, negative for past)
 */
export function calculateDaysDifference(dateString: string): number {
  if (!dateString || typeof dateString !== 'string') {
    return 0;
  }

  const targetDate = parseLocalDate(dateString);
  const today = new Date();
  
  // Reset time to midnight for accurate day comparison
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format due date with relative terms (Today, Tomorrow, Yesterday, etc.)
 * 
 * @param dateString - Date string in format YYYY-MM-DD
 * @returns Formatted string with relative date information
 */
export function formatDueDate(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') {
    return '';
  }

  const daysDiff = calculateDaysDifference(dateString);
  const formattedDate = formatLocalDate(dateString);

  if (daysDiff === 0) {
    return `Today (${formattedDate})`;
  } else if (daysDiff === 1) {
    return `Tomorrow (${formattedDate})`;
  } else if (daysDiff === -1) {
    return `Yesterday (${formattedDate})`;
  } else if (daysDiff > 1) {
    return `In ${daysDiff} days (${formattedDate})`;
  } else {
    return `${Math.abs(daysDiff)} days ago (${formattedDate})`;
  }
}

/**
 * Check if a date string represents today's date
 * 
 * @param dateString - Date string in format YYYY-MM-DD
 * @returns True if the date is today
 */
export function isToday(dateString: string): boolean {
  return calculateDaysDifference(dateString) === 0;
}

/**
 * Check if a date string represents a past date
 * 
 * @param dateString - Date string in format YYYY-MM-DD
 * @returns True if the date is in the past
 */
export function isPastDate(dateString: string): boolean {
  return calculateDaysDifference(dateString) < 0;
}

/**
 * Check if a date string represents a future date
 * 
 * @param dateString - Date string in format YYYY-MM-DD
 * @returns True if the date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  return calculateDaysDifference(dateString) > 0;
}

/**
 * Get the current date in YYYY-MM-DD format
 * 
 * @returns Current date string in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}