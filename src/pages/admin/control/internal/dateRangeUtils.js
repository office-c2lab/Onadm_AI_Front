function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function createDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 13);

  return {
    startDate: formatDateValue(startDate),
    endDate: formatDateValue(endDate),
  };
}

export function isDateValueInRange(value, startDate, endDate) {
  const match = String(value ?? '').match(/(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/);
  if (!match) return false;

  const [, year, month, day] = match;
  const normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

  return (!startDate || normalizedDate >= startDate) && (!endDate || normalizedDate <= endDate);
}
