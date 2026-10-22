import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, RotateCcw } from 'lucide-react';
import caretDownIcon from '../../../../../../assets/icons/caret_down.svg';
import searchIcon from '../../../../../../assets/icons/search-data.svg';
import ServiceLogoBadge from '../../../../../../components/identity/ServiceLogoBadge.jsx';
import { primaryButtonClassName } from '../../../../../../components/ui/Button.jsx';
import {
  tableCellClass,
  tableClass,
  tableBodyClass,
  tableHeadClass,
  tableHeaderCellClass,
  tableHeaderRowClass,
  tableRowClass,
  tableScrollClass,
  tableSurfaceClass,
} from '../../../../../../styles/table.js';
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_TEXT_CLASS,
  APP_META_TEXT_CLASS,
  APP_PANEL_TITLE_CLASS,
  APP_SMALL_META_TEXT_CLASS,
} from '../../../../../../styles/layout.js';
import { getStatusTextClassName } from '../../constants/statusColors.js';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const monitoringCompactHeaderCellClass = `${tableHeaderCellClass} !py-1`;

function monitoringCompactTableCellClass(index, className = '') {
  return tableCellClass(index, `!py-3 ${className}`);
}

function parseDateString(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value) {
  if (!value) return '';
  const date = parseDateString(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

function createCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days = [];

  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - startWeekday + 1;

    if (dayNumber <= 0) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth + dayNumber),
        isCurrentMonth: false,
      });
      continue;
    }

    if (dayNumber > daysInMonth) {
      days.push({
        date: new Date(year, month + 1, dayNumber - daysInMonth),
        isCurrentMonth: false,
      });
      continue;
    }

    days.push({
      date: new Date(year, month, dayNumber),
      isCurrentMonth: true,
    });
  }

  return days;
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function compareDateOnly(left, right) {
  const leftDate = new Date(left.getFullYear(), left.getMonth(), left.getDate()).getTime();
  const rightDate = new Date(right.getFullYear(), right.getMonth(), right.getDate()).getTime();

  return leftDate - rightDate;
}

function isDateInRange(date, startDate, endDate) {
  return compareDateOnly(date, startDate) >= 0 && compareDateOnly(date, endDate) <= 0;
}

export function MonitoringActionButton({
  children,
  variant = 'secondary',
  onClick,
  disabled = false,
  widthClass = 'w-[clamp(7.5rem,10.5vw,9.375rem)] min-w-[clamp(6.5rem,8vw,7.5rem)]',
  heightClass = 'h-[var(--app-control-xs)]',
  ...buttonProps
}) {
  const activeClassName =
    variant === 'primary'
      ? primaryButtonClassName
      : variant === 'outline'
        ? 'border border-slate-200 bg-white text-brand hover:border-toggle-off hover:bg-surface-hover'
        : variant === 'csvDownload'
          ? 'border border-slate-200 bg-white font-bold tracking-title text-brand shadow-detail-12 hover:border-toggle-off hover:bg-surface-hover active:bg-selection'
          : variant === 'soft'
            ? 'border border-palette-blue-41 bg-palette-blue-26 text-palette-blue-98'
            : variant === 'ghost'
              ? 'border border-palette-cyan-03/25 bg-palette-cyan-03/10 text-palette-cyan-01'
              : primaryButtonClassName;
  const disabledClassName =
    variant === 'csvDownload'
      ? 'border border-slate-200 bg-white font-bold tracking-title text-palette-neutral-13 shadow-none'
      : variant === 'outline'
        ? 'border border-slate-200 bg-white text-palette-neutral-13'
        : activeClassName;
  const className = disabled ? disabledClassName : activeClassName;

  const interactionClassName = disabled
    ? 'cursor-not-allowed opacity-60'
    : variant === 'outline'
      ? ''
      : 'hover:brightness-[1.02]';

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...buttonProps}
      className={`inline-flex ${heightClass} ${widthClass} items-center justify-center rounded-[var(--app-radius-lg)] px-[var(--app-pad-md)] whitespace-nowrap ${APP_BUTTON_TEXT_CLASS} font-semibold leading-detail-01 transition ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${interactionClassName} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function MonitoringResetButton({
  children = '',
  onClick,
  heightClass = 'h-[var(--app-control-lg)]',
  widthClass = 'w-fit',
  textClassName = 'shadow-detail-07',
  ...buttonProps
}) {
  const hasLabel = Boolean(children);
  const disabled = Boolean(buttonProps.disabled);

  return (
    <button
      type="button"
      onClick={onClick}
      {...buttonProps}
      className={`inline-flex ${heightClass} ${widthClass} items-center justify-center gap-[var(--app-gap-xs)] rounded-[var(--app-radius-lg)] border border-slate-200 bg-white ${
        hasLabel ? 'px-[var(--app-pad-md)]' : 'px-0'
      } ${textClassName} whitespace-nowrap text-brand transition ${
        disabled
          ? 'cursor-not-allowed'
          : 'cursor-pointer hover:border-toggle-off hover:bg-surface-hover active:bg-selection'
      }`.trim()}
    >
      <RotateCcw
        className="h-[var(--app-icon-sm)] w-[var(--app-icon-sm)]"
        strokeWidth={2.4}
        aria-hidden="true"
      />
      {children}
    </button>
  );
}

export function MonitoringIconButtonTooltip({ label, children }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute top-[calc(100%+0.5rem)] left-1/2 z-50 -translate-x-1/2 rounded-lg border border-toggle-off bg-white px-2.5 py-1.5 text-caption font-bold whitespace-nowrap text-brand opacity-0 shadow-detail-13 transition group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
    </div>
  );
}

export function DateRangePicker({
  label,
  startDate,
  endDate,
  onChange,
  widthClass = 'min-w-[clamp(8rem,9vw,8.625rem)]',
  labelClassName = 'text-fluid-38 font-semibold tracking-label text-palette-blue-91',
  triggerHeightClass = 'h-[var(--app-control-lg)]',
}) {
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseDateString(endDate || startDate));
  const [selectionStep, setSelectionStep] = useState('start');
  const selectedStartDate = parseDateString(startDate);
  const selectedEndDate = parseDateString(endDate || startDate);
  const calendarDays = useMemo(() => createCalendarDays(viewDate), [viewDate]);
  const dateLabel = `${formatDateLabel(startDate)} ~ ${formatDateLabel(endDate)}`;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = event => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectDate = date => {
    const value = formatDateValue(date);

    if (selectionStep === 'start') {
      onChange({ startDate: value, endDate: value });
      setSelectionStep('end');
      return;
    }

    if (compareDateOnly(date, selectedStartDate) < 0) {
      onChange({ startDate: value, endDate: startDate });
    } else {
      onChange({ startDate, endDate: value });
    }

    setSelectionStep('start');
    setIsOpen(false);
  };

  return (
    <label
      ref={rootRef}
      className={`relative flex flex-col gap-[var(--app-gap-xs)] ${widthClass}`.trim()}
    >
      <span className={labelClassName}>{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setViewDate(parseDateString(endDate || startDate));
            setSelectionStep('start');
            setIsOpen(open => !open);
          }}
          className={`flex ${triggerHeightClass} w-full cursor-pointer items-center justify-center rounded-[var(--app-radius-lg)] border pr-[calc(var(--app-pad-md)*1.2)] pl-[calc(var(--app-pad-xs)*0.75)] text-fluid-41 font-medium whitespace-nowrap text-text-secondary outline-none transition ${
            isOpen
              ? 'border-focus-border bg-selection ring-[clamp(0.2rem,0.32vw,0.25rem)] ring-focus-ring'
              : 'border-slate-200 bg-white hover:border-toggle-off hover:bg-surface-hover active:border-focus-border active:bg-selection focus:border-focus-border focus:ring-[clamp(0.2rem,0.32vw,0.25rem)] focus:ring-focus-ring'
          }`.trim()}
        >
          {dateLabel}
        </button>
        <span className="pointer-events-none absolute top-1/2 right-[calc(var(--app-pad-xs)*0.8)] -translate-y-1/2 text-text-muted">
          <svg
            className="h-[var(--app-icon-xs)] w-[var(--app-icon-xs)]"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="2.25"
              y="3.25"
              width="11.5"
              height="10.5"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M5 1.75V4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M11 1.75V4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2.5 6H13.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </div>

      {isOpen ? (
        <div className="absolute top-[calc(100%+var(--app-gap-xs))] left-0 z-40 w-[min(20rem,calc(100vw-(var(--app-page-x)*2)))] rounded-[var(--app-radius-lg)] border border-palette-blue-31 bg-white p-[var(--app-pad-sm)] shadow-detail-14">
          <div className="mb-[var(--app-gap-sm)] rounded-[var(--app-radius-md)] bg-palette-blue-08 px-[var(--app-pad-sm)] py-[var(--app-pad-xs)] text-fluid-42 font-semibold text-palette-blue-88">
            {selectionStep === 'start' ? '시작일을 선택하세요' : '종료일을 선택하세요'}
          </div>
          <div className="mb-[var(--app-gap-sm)] flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setViewDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))
              }
              className="flex h-[var(--app-control-xs)] w-[var(--app-control-xs)] cursor-pointer items-center justify-center rounded-full text-palette-blue-92 transition hover:bg-surface-hover"
              aria-label="이전 달"
            >
              ‹
            </button>
            <div className="text-control font-bold text-palette-blue-106">
              {viewDate.getFullYear()}.{String(viewDate.getMonth() + 1).padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={() =>
                setViewDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))
              }
              className="flex h-[var(--app-control-xs)] w-[var(--app-control-xs)] cursor-pointer items-center justify-center rounded-full text-palette-blue-92 transition hover:bg-surface-hover"
              aria-label="다음 달"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-[calc(var(--app-gap-xs)/2)] text-center text-fluid-32 font-semibold text-palette-blue-67">
            {WEEKDAY_LABELS.map(day => (
              <span key={day} className="py-[calc(var(--app-pad-xs)/2)]">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-[calc(var(--app-gap-xs)/2)] grid grid-cols-7 gap-[calc(var(--app-gap-xs)/2)]">
            {calendarDays.map(({ date, isCurrentMonth }) => {
              const isStart = isSameDay(date, selectedStartDate);
              const isEnd = isSameDay(date, selectedEndDate);
              const isInRange = isDateInRange(date, selectedStartDate, selectedEndDate);
              const isSelected = isStart || isEnd;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className={`flex h-[var(--app-control-xs)] cursor-pointer items-center justify-center rounded-[var(--app-radius-md)] text-fluid-42 font-medium transition ${
                    isSelected
                      ? 'bg-brand text-white shadow-detail-15'
                      : isInRange
                        ? 'bg-selection text-brand'
                        : isCurrentMonth
                          ? 'text-palette-blue-104 hover:bg-surface-hover'
                          : 'text-palette-blue-50 hover:bg-palette-blue-10'
                  }`.trim()}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </label>
  );
}

export function MonitoringCsvActionMenu({
  isOpen,
  onToggle,
  onDownloadClick,
  menuRef,
  buttonWidthClass = 'w-[clamp(6.5rem,8.5vw,8rem)] min-w-[clamp(6.5rem,8.5vw,8rem)]',
}) {
  return (
    <div ref={menuRef} className="relative">
      <MonitoringActionButton
        onClick={onToggle}
        widthClass={buttonWidthClass}
        heightClass="h-[var(--app-control-sm)]"
      >
        CSV
      </MonitoringActionButton>

      {isOpen ? (
        <div className="absolute top-[calc(100%+var(--app-gap-xs))] right-0 z-20 flex min-w-[clamp(11.5rem,14.6vw,13.125rem)] flex-col gap-[var(--app-gap-xs)] rounded-[var(--app-radius-lg)] border border-palette-blue-40 bg-white p-[var(--app-pad-sm)] shadow-detail-16">
          <MonitoringActionButton
            variant="csvDownload"
            onClick={onDownloadClick}
            widthClass="w-full min-w-0"
            heightClass="h-[var(--app-control-lg)]"
          >
            <span className="inline-flex items-center gap-[var(--app-gap-xs)] text-button font-bold tracking-title">
              <Download
                className="h-[var(--app-icon-xs)] w-[var(--app-icon-xs)]"
                strokeWidth={2.8}
              />
              CSV 다운로드
            </span>
          </MonitoringActionButton>
        </div>
      ) : null}
    </div>
  );
}

export function MonitoringTagChip({ children, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[var(--app-control-xs)] w-full cursor-pointer items-center justify-center rounded-[var(--app-radius-md)] px-[var(--app-pad-md)] sm:w-[clamp(6.25rem,7.5vw,6.75rem)] sm:min-w-[clamp(6.25rem,7.5vw,6.75rem)] ${APP_BUTTON_TEXT_CLASS} font-bold leading-detail-01 transition ${
        active
          ? 'bg-palette-cyan-03 text-white shadow-detail-17'
          : 'border border-palette-blue-105 bg-transparent text-palette-blue-110 hover:bg-palette-blue-105/10'
      }`.trim()}
    >
      {children}
    </button>
  );
}

export function MonitoringDropdown({
  value,
  displayValue = value,
  onChange,
  options,
  ariaLabel,
  widthClass = 'w-full sm:w-[clamp(12rem,15.3vw,13.75rem)]',
  triggerClassName = 'h-[var(--app-control-lg)] rounded-[var(--app-radius-lg)] border-slate-200 bg-white shadow-none hover:border-toggle-off hover:bg-surface-hover active:border-focus-border active:bg-selection focus:border-focus-border focus:ring-[clamp(0.2rem,0.32vw,0.25rem)] focus:ring-focus-ring',
  placement = 'bottom',
  verticalPlacement = 'auto',
  triggerTextClassName = APP_BODY_TEXT_CLASS,
  optionTextClassName = APP_BODY_TEXT_CLASS,
  selectedOptionTextClassName = APP_BUTTON_TEXT_CLASS,
  optionLabelMap = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState(null);
  const [menuMaxHeight, setMenuMaxHeight] = useState(() =>
    Math.round(Math.min(window.innerHeight * 0.48, 352))
  );
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  const updateOverlayPosition = useCallback(() => {
    if (!rootRef.current) return;

    const rect = rootRef.current.getBoundingClientRect();
    const viewportPadding = Math.max(window.innerWidth * 0.008, 10);
    const menuGap = Math.max(window.innerWidth * 0.004, 6);
    const triggerWidth = rect.width;

    if (placement === 'right') {
      const availableRight = window.innerWidth - rect.right - viewportPadding - menuGap;
      const availableLeft = rect.left - viewportPadding - menuGap;
      const openLeft = availableRight < triggerWidth && availableLeft > availableRight;
      const availableBelow = window.innerHeight - rect.top - viewportPadding;
      const availableAbove = rect.bottom - viewportPadding;
      const alignBottom =
        verticalPlacement === 'top' ||
        (verticalPlacement === 'auto' &&
          availableBelow < window.innerHeight * 0.28 &&
          availableAbove > availableBelow);
      const availableHeight = Math.max(
        window.innerHeight * 0.18,
        alignBottom ? availableAbove : availableBelow
      );

      setOverlayStyle({
        position: 'fixed',
        top: alignBottom ? 'auto' : `${rect.top}px`,
        bottom: alignBottom ? `${window.innerHeight - rect.bottom}px` : 'auto',
        left: openLeft ? 'auto' : `${rect.right + menuGap}px`,
        right: openLeft ? `${window.innerWidth - rect.left + menuGap}px` : 'auto',
        width: 'max-content',
        minWidth: `${triggerWidth}px`,
        maxWidth: `${Math.max(triggerWidth, openLeft ? availableLeft : availableRight)}px`,
      });
      setMenuMaxHeight(Math.min(window.innerHeight * 0.48, availableHeight));
      return;
    }

    const availableBelow = window.innerHeight - rect.bottom - viewportPadding - menuGap;
    const availableAbove = rect.top - viewportPadding - menuGap;
    const openAbove = availableBelow < window.innerHeight * 0.28 && availableAbove > availableBelow;
    const availableHeight = Math.max(
      window.innerHeight * 0.18,
      openAbove ? availableAbove : availableBelow
    );

    setOverlayStyle({
      position: 'fixed',
      top: openAbove ? 'auto' : `${rect.bottom + menuGap}px`,
      bottom: openAbove ? `${window.innerHeight - rect.top + menuGap}px` : 'auto',
      left: `${rect.left}px`,
      width: 'max-content',
      minWidth: `${triggerWidth}px`,
      maxWidth: `${Math.max(triggerWidth, window.innerWidth - rect.left - viewportPadding)}px`,
    });
    setMenuMaxHeight(Math.min(window.innerHeight * 0.48, availableHeight));
  }, [placement, verticalPlacement]);

  useEffect(() => {
    if (!isOpen) return undefined;

    updateOverlayPosition();

    const handlePointerDown = event => {
      const clickedTrigger = rootRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateOverlayPosition);
    window.addEventListener('scroll', updateOverlayPosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateOverlayPosition);
      window.removeEventListener('scroll', updateOverlayPosition, true);
    };
  }, [isOpen, updateOverlayPosition]);

  const menu =
    isOpen && overlayStyle
      ? createPortal(
          <div
            ref={menuRef}
            style={overlayStyle}
            className="z-[100] rounded-[var(--app-radius-lg)] drop-shadow-detail-18"
          >
            <div className="rounded-[var(--app-radius-lg)] border border-slate-200 bg-white px-[calc(var(--app-pad-xs)*0.55)] py-[calc(var(--app-pad-xs)*0.65)]">
              <div
                style={{ maxHeight: `${menuMaxHeight}px` }}
                className="flex flex-col gap-[calc(var(--app-gap-xs)*0.35)] overflow-auto px-[calc(var(--app-pad-xs)*0.55)]"
              >
                {options.map(option => {
                  const isSelected = option === value;
                  const optionLabel = optionLabelMap[option] ?? option;

                  return (
                    <button
                      key={option}
                      type="button"
                      className={`flex h-[var(--app-control-sm)] w-full shrink-0 cursor-pointer items-center gap-[var(--app-gap-xs)] px-[calc(var(--app-pad-md)*0.9)] text-left whitespace-nowrap transition ${
                        isSelected
                          ? `app-solid-button rounded-[var(--app-radius-md)] bg-brand ${selectedOptionTextClassName} font-bold leading-detail-01 text-white`
                          : `rounded-[var(--app-radius-sm)] bg-white ${optionTextClassName} font-normal leading-5 tracking-detail-05 text-palette-neutral-23 hover:bg-palette-blue-08`
                      }`.trim()}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                    >
                      <span className="flex-1 whitespace-nowrap">{optionLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className={`relative ${widthClass}`.trim()}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={`flex w-full cursor-pointer items-center gap-[var(--app-gap-xs)] border pr-[var(--app-pad-xs)] pl-0 text-left transition ${triggerClassName} ${
          isOpen
            ? 'border-focus-border bg-selection ring-[clamp(0.2rem,0.32vw,0.25rem)] ring-focus-ring'
            : ''
        }`.trim()}
        onClick={() => setIsOpen(open => !open)}
      >
        <span
          className={`flex flex-1 items-center px-[var(--app-pad-md)] ${triggerTextClassName} font-medium leading-5 tracking-detail-05 text-text-secondary`}
        >
          {displayValue}
        </span>
        <img
          src={caretDownIcon}
          alt=""
          aria-hidden="true"
          className={`h-[var(--app-icon-md)] w-[var(--app-icon-md)] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`.trim()}
        />
      </button>
      {menu}
    </div>
  );
}

export function MonitoringSearchField({
  value,
  onChange,
  widthClass = 'w-full sm:w-[clamp(18rem,24.2vw,21.75rem)] sm:shrink-0',
  placeholder = 'Search',
}) {
  return (
    <label
      className={`flex h-[var(--app-control-xs)] items-center gap-[var(--app-gap-xs)] rounded-[var(--app-radius-sm)] bg-palette-blue-04 px-[var(--app-pad-sm)] ${APP_SMALL_META_TEXT_CLASS} text-palette-neutral-11 ${widthClass}`.trim()}
    >
      <img
        src={searchIcon}
        alt=""
        aria-hidden="true"
        className="h-[var(--app-icon-md)] w-[calc(var(--app-icon-md)*1.14)]"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full min-w-0 bg-transparent ${APP_BODY_TEXT_CLASS} text-palette-neutral-25 outline-none placeholder:text-palette-neutral-11`}
      />
    </label>
  );
}

function MonitoringResultChip({ result }) {
  const resultTextClassName = getStatusTextClassName(result);

  return (
    <span
      className={`inline-flex items-center text-fluid-47 font-semibold whitespace-nowrap ${resultTextClassName}`}
    >
      {result}
    </span>
  );
}

export function MonitoringDataTable({
  rows,
  activeRowId,
  onSelectRow,
  renderExpandedRow,
  selectedRowIds = [],
  onToggleRowSelection,
  onToggleAllRowsSelection,
  rowNumberStart = 1,
  className = '',
  bodyClassName = '',
}) {
  const allRowsSelected = rows.length > 0 && rows.every(row => selectedRowIds.includes(row.id));

  return (
    <div className={`${tableSurfaceClass} ${className}`.trim()}>
      <div className={tableScrollClass}>
        <table className={`min-w-[min(100%,61.25rem)] ${tableClass} xl:min-w-0`}>
          <colgroup>
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[16%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[20%]" />
            <col className="w-[17%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead className={tableHeadClass}>
            <tr className={tableHeaderRowClass}>
              <th className={`${monitoringCompactHeaderCellClass} px-0 text-center align-middle`}>
                <input
                  type="checkbox"
                  checked={allRowsSelected}
                  onChange={() => onToggleAllRowsSelection?.(rows.map(row => row.id))}
                  aria-label="현재 페이지 전체 선택"
                  className="mx-auto block h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] cursor-pointer rounded border-slate-300 accent-brand"
                />
              </th>
              <th className={`${monitoringCompactHeaderCellClass} px-0 text-center`}>No.</th>
              <th className={`${monitoringCompactHeaderCellClass} px-[var(--app-pad-sm)]`}>
                탐지 일시
              </th>
              <th
                className={`${monitoringCompactHeaderCellClass} px-[var(--app-pad-sm)] !text-center`}
              >
                서비스
              </th>
              <th
                className={`${monitoringCompactHeaderCellClass} whitespace-nowrap px-[var(--app-pad-sm)]`}
              >
                탐지 결과
              </th>
              <th className={`${monitoringCompactHeaderCellClass} px-[var(--app-pad-sm)]`}>
                프롬프트
              </th>
              <th className={`${monitoringCompactHeaderCellClass} px-[var(--app-pad-sm)]`}>
                적용 정책
              </th>
              <th className={`${monitoringCompactHeaderCellClass} px-[var(--app-pad-sm)]`}>IP</th>
              <th className={`${monitoringCompactHeaderCellClass} px-[var(--app-pad-sm)]`}>
                사용자명
              </th>
            </tr>
          </thead>
          <tbody className={`${tableBodyClass} ${bodyClassName}`.trim()}>
            {rows.map((row, index) => {
              const isSelected = activeRowId === row.id;
              const isChecked = selectedRowIds.includes(row.id);
              const isStriped = index % 2 === 1;
              return (
                <Fragment key={row.id}>
                  <tr
                    className={tableRowClass({
                      selected: isSelected,
                      striped: isStriped,
                      interactive: true,
                    })}
                    onClick={() => onSelectRow(row)}
                  >
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-0 text-center align-middle'
                      )}
                      onClick={event => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleRowSelection?.(row.id)}
                        aria-label={`${row.aiType} 행 선택`}
                        className="mx-auto block h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] cursor-pointer rounded border-slate-300 accent-brand"
                      />
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-0 text-center text-text-muted'
                      )}
                    >
                      {row.no ?? rowNumberStart + index}
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-text-label'
                      )}
                    >
                      <div className="whitespace-nowrap">{row.detectedAt}</div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-text-label'
                      )}
                    >
                      <div className="flex items-center justify-center">
                        <ServiceLogoBadge
                          name={row.aiType}
                          variant="compact"
                          className="h-7 w-7 !border-focus-border bg-palette-blue-05 shadow-detail-05"
                          iconClassName="h-[var(--app-icon-sm)] w-[var(--app-icon-sm)]"
                        />
                      </div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] font-semibold'
                      )}
                    >
                      <div className="overflow-hidden">
                        <MonitoringResultChip
                          level={row.level}
                          result={row.displayResult ?? row.result}
                        />
                      </div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-palette-blue-109'
                      )}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {row.prompt}
                      </div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-palette-blue-109'
                      )}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {row.detectedPolicy ?? row.content}
                      </div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-palette-blue-109'
                      )}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {row.userIp}
                      </div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-palette-blue-109'
                      )}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {row.userId ?? '-'}
                      </div>
                    </td>
                  </tr>
                  {isSelected && renderExpandedRow ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="border-t border-palette-blue-28 bg-white px-0 py-0"
                      >
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MonitoringDomainTable({ rows, renderLogo, renderToggle, className = '' }) {
  return (
    <div className={`flex min-h-0 w-full flex-col pb-0 ${className}`.trim()}>
      <div className="min-h-0 w-full overflow-x-auto">
        <div className="min-w-[min(100%,47.5rem)] rounded-[var(--app-radius-xl)]">
          <div className="grid h-[var(--app-control-lg)] w-full grid-cols-[minmax(15rem,1.45fr)_minmax(16rem,2fr)_minmax(7rem,0.5fr)] items-center rounded-t-[var(--app-radius-xl)] border-b border-border-subtle bg-[linear-gradient(180deg,var(--color-table-header-start)_0%,var(--color-table-header-end)_100%)] px-[var(--app-pad-lg)] text-control font-semibold tracking-label text-palette-blue-93">
            <span>서비스</span>
            <span>URL</span>
            <span className="text-center">사용/비사용</span>
          </div>

          <div className="overflow-hidden rounded-b-[var(--app-radius-xl)]">
            {rows.map((row, index) => {
              return (
                <div
                  key={row.id}
                  className={`grid min-h-[clamp(3.75rem,4.6vw,4.125rem)] w-full grid-cols-[minmax(15rem,1.45fr)_minmax(16rem,2fr)_minmax(7rem,0.5fr)] items-center bg-white px-[var(--app-pad-lg)] text-control leading-detail-01 text-slate-700 ${
                    index === 0 ? '' : 'border-t border-palette-blue-22'
                  }`.trim()}
                >
                  <div className="flex items-center gap-[var(--app-gap-sm)] py-[var(--app-pad-sm)] pr-[var(--app-pad-md)]">
                    {renderLogo(row)}
                    <div className="truncate font-semibold text-palette-blue-111">{row.name}</div>
                  </div>
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate pr-[var(--app-pad-md)] text-text-muted underline decoration-transparent transition hover:text-brand hover:decoration-[var(--color-brand)]"
                    title={row.url}
                  >
                    {row.url}
                  </a>
                  <div className="flex justify-center py-[var(--app-pad-sm)]">
                    {renderToggle(row)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
