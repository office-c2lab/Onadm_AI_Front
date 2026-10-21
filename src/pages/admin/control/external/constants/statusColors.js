export const STATUS_LABELS = {
  normal: '정상',
  masking: '마스킹',
  block: '차단',
};

export const STATUS_COLORS = {
  normal: '#075DF6',
  masking: '#F59E0B',
  block: '#FF4D4F',
};

export const STATUS_TEXT_CLASS_NAMES = {
  normal: 'text-[#075DF6]',
  masking: 'text-[#F59E0B]',
  block: 'text-[#FF4D4F]',
};

export function getStatusKeyFromLabel(label) {
  if (label === STATUS_LABELS.normal) return 'normal';
  if (label === '허용') return 'normal';
  if (label === STATUS_LABELS.masking) return 'masking';
  if (label === STATUS_LABELS.block) return 'block';
  return 'normal';
}

export function getStatusTextClassName(statusKeyOrLabel) {
  const statusKey = STATUS_TEXT_CLASS_NAMES[statusKeyOrLabel]
    ? statusKeyOrLabel
    : getStatusKeyFromLabel(statusKeyOrLabel);

  return STATUS_TEXT_CLASS_NAMES[statusKey] ?? STATUS_TEXT_CLASS_NAMES.normal;
}

