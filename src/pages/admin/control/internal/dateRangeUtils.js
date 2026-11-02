export function createDefaultDateRange() {
  return {
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  };
}

export function isDateValueInRange(value, startDate, endDate) {
  const match = String(value ?? '').match(/(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/);
  if (!match) return false;

  const [, year, month, day] = match;
  const normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

  return (!startDate || normalizedDate >= startDate) && (!endDate || normalizedDate <= endDate);
}
