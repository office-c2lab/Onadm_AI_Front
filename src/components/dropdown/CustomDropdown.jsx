import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

function normalizeOption(option) {
  if (typeof option === 'string' || typeof option === 'number') {
    return { label: String(option), value: option, disabled: false };
  }

  return {
    label: option.label ?? String(option.value),
    value: option.value,
    disabled: Boolean(option.disabled),
  };
}

export default function CustomDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = '선택해 주세요',
  disabled = false,
  className = '',
  menuClassName = '',
}) {
  const dropdownId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const normalizedOptions = useMemo(() => options.map(normalizeOption), [options]);
  const selectedIndex = normalizedOptions.findIndex(option => option.value === value);
  const selectedOption = normalizedOptions[selectedIndex];

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = event => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const openDropdown = () => {
    if (disabled) return;
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const selectOption = option => {
    if (option.disabled) return;
    onChange(option.value, option);
    closeDropdown();
  };

  const moveHighlight = direction => {
    if (!normalizedOptions.length) return;

    const startIndex = highlightedIndex >= 0 ? highlightedIndex : direction > 0 ? -1 : 0;

    for (let step = 1; step <= normalizedOptions.length; step += 1) {
      const nextIndex =
        (startIndex + direction * step + normalizedOptions.length) % normalizedOptions.length;

      if (!normalizedOptions[nextIndex].disabled) {
        setHighlightedIndex(nextIndex);
        return;
      }
    }
  };

  const handleKeyDown = event => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeDropdown();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        openDropdown();
        return;
      }
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if ((event.key === 'Enter' || event.key === ' ') && isOpen && highlightedIndex >= 0) {
      event.preventDefault();
      selectOption(normalizedOptions[highlightedIndex]);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          isOpen
            ? 'border-blue-500 text-slate-900'
            : 'border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${dropdownId}-listbox`}
      >
        <span className="min-w-0 flex-1 truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <ul
          id={`${dropdownId}-listbox`}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute z-50 mt-1 max-h-60 min-w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10 ${menuClassName}`.trim()}
        >
          {normalizedOptions.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li key={`${option.value}-${index}`} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(option)}
                  className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700'
                      : isHighlighted
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
