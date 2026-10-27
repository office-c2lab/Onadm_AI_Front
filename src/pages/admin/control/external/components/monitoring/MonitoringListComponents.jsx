import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, RotateCcw } from 'lucide-react';
import caretDownIcon from '../../../../../../assets/icons/caret_down.svg';
import searchIcon from '../../../../../../assets/icons/search-data.svg';
import ServiceLogoBadge from '../ServiceLogoBadge.jsx';
import TableListHeader from '../TableListHeader.jsx';
import { primaryButtonClassName } from '../AppButton.jsx';
import {
  monitoringTableCellClass,
  monitoringTableClass,
  monitoringTableBodyClass,
  monitoringTableHeadClass,
  monitoringTableHeaderCellClass,
  monitoringTableHeaderRowClass,
  monitoringTableRowClass,
  monitoringTableScrollClass,
  monitoringTableSurfaceClass,
} from './monitoringTableStyles.js';
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_TEXT_CLASS,
  APP_META_TEXT_CLASS,
  APP_PANEL_TITLE_CLASS,
  APP_SMALL_META_TEXT_CLASS,
} from '../../constants/contentLayout.js';
import { getStatusTextClassName } from '../../constants/statusColors.js';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const monitoringCompactHeaderCellClass = `${monitoringTableHeaderCellClass} !py-1`;

function monitoringCompactTableCellClass(index, className = '') {
  return monitoringTableCellClass(index, `!py-3 ${className}`);
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
        ? 'border border-slate-200 bg-white text-[#075DF6] hover:border-[#B6D9FF] hover:bg-[#F8FBFF]'
        : variant === 'csvDownload'
          ? 'border border-slate-200 bg-white font-bold tracking-[-0.02em] text-[#075DF6] shadow-[0_6px_14px_rgba(7, 93, 246,0.16)] hover:border-[#B6D9FF] hover:bg-[#F8FBFF] active:bg-[#EFF6FF]'
          : variant === 'soft'
            ? 'border border-[#D5E5EE] bg-[#E6F0F5] text-[#2A6F8F]'
            : variant === 'ghost'
              ? 'border border-[#31A4BD]/25 bg-[#31A4BD]/10 text-[#8AD4E4]'
              : primaryButtonClassName;
  const disabledClassName =
    variant === 'csvDownload'
      ? 'border border-slate-200 bg-white font-bold tracking-[-0.02em] text-[#9CA3AF] shadow-none'
      : variant === 'outline'
        ? 'border border-slate-200 bg-white text-[#9CA3AF]'
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
      className={`inline-flex ${heightClass} ${widthClass} items-center justify-center rounded-[var(--app-radius-lg)] px-[var(--app-pad-md)] whitespace-nowrap ${APP_BUTTON_TEXT_CLASS} font-semibold leading-[150%] transition ${
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
  textClassName = 'shadow-[0_0.625rem_1.5rem_rgba(7, 93, 246,0.18)]',
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
      } ${textClassName} whitespace-nowrap text-[#075DF6] transition ${
        disabled
          ? 'cursor-not-allowed'
          : 'cursor-pointer hover:border-[#B6D9FF] hover:bg-[#F8FBFF] active:bg-[#EFF6FF]'
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
      <span className="pointer-events-none absolute top-[calc(100%+0.5rem)] left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[#B6D9FF] bg-white px-2.5 py-1.5 text-[12px] font-bold whitespace-nowrap text-[#075DF6] opacity-0 shadow-[0_10px_24px_rgba(7, 93, 246,0.14)] transition group-hover:opacity-100 group-focus-within:opacity-100">
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
  labelClassName = 'text-[clamp(0.76rem,0.9vw,0.82rem)] font-semibold tracking-[-0.01em] text-[#5C6784]',
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
          className={`flex ${triggerHeightClass} w-full cursor-pointer items-center justify-center rounded-[var(--app-radius-lg)] border pr-[calc(var(--app-pad-md)*1.2)] pl-[calc(var(--app-pad-xs)*0.75)] text-[clamp(0.7rem,0.78vw,0.76rem)] font-medium whitespace-nowrap text-[#344054] outline-none transition ${
            isOpen
              ? 'border-[#8BC6FF] bg-[#EFF6FF] ring-[clamp(0.2rem,0.32vw,0.25rem)] ring-[#DEEEFF]'
              : 'border-slate-200 bg-white hover:border-[#B6D9FF] hover:bg-[#F8FBFF] active:border-[#8BC6FF] active:bg-[#EFF6FF] focus:border-[#8BC6FF] focus:ring-[clamp(0.2rem,0.32vw,0.25rem)] focus:ring-[#DEEEFF]'
          }`.trim()}
        >
          {dateLabel}
        </button>
        <span className="pointer-events-none absolute top-1/2 right-[calc(var(--app-pad-xs)*0.8)] -translate-y-1/2 text-[#667085]">
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
        <div className="absolute top-[calc(100%+var(--app-gap-xs))] left-0 z-40 w-[min(20rem,calc(100vw-(var(--app-page-x)*2)))] rounded-[var(--app-radius-lg)] border border-[#E3E7F0] bg-white p-[var(--app-pad-sm)] shadow-[0_1rem_2.25rem_rgba(15,23,42,0.12)]">
          <div className="mb-[var(--app-gap-sm)] rounded-[var(--app-radius-md)] bg-[#F7F8FC] px-[var(--app-pad-sm)] py-[var(--app-pad-xs)] text-[clamp(0.7rem,0.85vw,0.75rem)] font-semibold text-[#657086]">
            {selectionStep === 'start' ? '시작일을 선택하세요' : '종료일을 선택하세요'}
          </div>
          <div className="mb-[var(--app-gap-sm)] flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setViewDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))
              }
              className="flex h-[var(--app-control-xs)] w-[var(--app-control-xs)] cursor-pointer items-center justify-center rounded-full text-[#5C6B7A] transition hover:bg-[#F8FBFF]"
              aria-label="이전 달"
            >
              ‹
            </button>
            <div className="text-[clamp(0.82rem,0.95vw,0.9rem)] font-bold text-[#2D3C4B]">
              {viewDate.getFullYear()}.{String(viewDate.getMonth() + 1).padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={() =>
                setViewDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))
              }
              className="flex h-[var(--app-control-xs)] w-[var(--app-control-xs)] cursor-pointer items-center justify-center rounded-full text-[#5C6B7A] transition hover:bg-[#F8FBFF]"
              aria-label="다음 달"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-[calc(var(--app-gap-xs)/2)] text-center text-[clamp(0.64rem,0.76vw,0.7rem)] font-semibold text-[#8D99AE]">
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
                  className={`flex h-[var(--app-control-xs)] cursor-pointer items-center justify-center rounded-[var(--app-radius-md)] text-[clamp(0.7rem,0.85vw,0.75rem)] font-medium transition ${
                    isSelected
                      ? 'bg-[#075DF6] text-white shadow-[0_8px_18px_rgba(7, 93, 246,0.18)]'
                      : isInRange
                        ? 'bg-[#EFF6FF] text-[#075DF6]'
                        : isCurrentMonth
                          ? 'text-[#314153] hover:bg-[#F8FBFF]'
                          : 'text-[#BCC6D1] hover:bg-[#F6F8FC]'
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
        <div className="absolute top-[calc(100%+var(--app-gap-xs))] right-0 z-20 flex min-w-[clamp(11.5rem,14.6vw,13.125rem)] flex-col gap-[var(--app-gap-xs)] rounded-[var(--app-radius-lg)] border border-[#D8E4EC] bg-white p-[var(--app-pad-sm)] shadow-[0_1rem_2.5rem_rgba(0,0,0,0.18)]">
          <MonitoringActionButton
            variant="csvDownload"
            onClick={onDownloadClick}
            widthClass="w-full min-w-0"
            heightClass="h-[var(--app-control-lg)]"
          >
            <span className="inline-flex items-center gap-[var(--app-gap-xs)] text-[clamp(0.9rem,1vw,0.98rem)] font-bold tracking-[-0.02em]">
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
      className={`flex h-[var(--app-control-xs)] w-full cursor-pointer items-center justify-center rounded-[var(--app-radius-md)] px-[var(--app-pad-md)] sm:w-[clamp(6.25rem,7.5vw,6.75rem)] sm:min-w-[clamp(6.25rem,7.5vw,6.75rem)] ${APP_BUTTON_TEXT_CLASS} font-bold leading-[150%] transition ${
        active
          ? 'bg-[#31A4BD] text-white shadow-[0_0_4px_rgba(90,208,222,0.8)]'
          : 'border border-[#01557D] bg-transparent text-[#014069] hover:bg-[#01557D]/10'
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
  triggerClassName = 'h-[var(--app-control-lg)] rounded-[var(--app-radius-lg)] border-slate-200 bg-white shadow-none hover:border-[#B6D9FF] hover:bg-[#F8FBFF] active:border-[#8BC6FF] active:bg-[#EFF6FF] focus:border-[#8BC6FF] focus:ring-[clamp(0.2rem,0.32vw,0.25rem)] focus:ring-[#DEEEFF]',
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
            className="z-[100] rounded-[var(--app-radius-lg)] drop-shadow-[0_1rem_2rem_rgba(15,23,42,0.12)]"
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
                          ? `app-solid-button rounded-[var(--app-radius-md)] bg-[#075DF6] ${selectedOptionTextClassName} font-bold leading-[150%] text-white`
                          : `rounded-[var(--app-radius-sm)] bg-white ${optionTextClassName} font-normal leading-5 tracking-[0.01em] text-[#484848] hover:bg-[#F7F8FC]`
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
            ? 'border-[#8BC6FF] bg-[#EFF6FF] ring-[clamp(0.2rem,0.32vw,0.25rem)] ring-[#DEEEFF]'
            : ''
        }`.trim()}
        onClick={() => setIsOpen(open => !open)}
      >
        <span
          className={`flex flex-1 items-center px-[var(--app-pad-md)] ${triggerTextClassName} font-medium leading-5 tracking-[0.01em] text-[#344054]`}
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
      className={`flex h-[var(--app-control-xs)] items-center gap-[var(--app-gap-xs)] rounded-[var(--app-radius-sm)] bg-[#F9FBFF] px-[var(--app-pad-sm)] ${APP_SMALL_META_TEXT_CLASS} text-[#B5B7C0] ${widthClass}`.trim()}
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
        className={`w-full min-w-0 bg-transparent ${APP_BODY_TEXT_CLASS} text-[#3D3C42] outline-none placeholder:text-[#B5B7C0]`}
      />
    </label>
  );
}

function MonitoringResultChip({ result }) {
  const resultTextClassName = getStatusTextClassName(result);

  return (
    <span
      className={`inline-flex items-center text-[clamp(0.86rem,1vw,0.94rem)] font-semibold whitespace-nowrap ${resultTextClassName}`}
    >
      {result}
    </span>
  );
}

export function MonitoringDataTable({
  rows,
  title = '모니터링 목록',
  count = rows.length,
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
    <div className={`${monitoringTableSurfaceClass} ${className}`.trim()}>
      <TableListHeader title={title} count={count} />
      <div className={monitoringTableScrollClass}>
        <table className={`min-w-[min(100%,61.25rem)] ${monitoringTableClass} xl:min-w-0`}>
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
          <thead className={monitoringTableHeadClass}>
            <tr className={monitoringTableHeaderRowClass}>
              <th className={`${monitoringCompactHeaderCellClass} px-0 text-center align-middle`}>
                <input
                  type="checkbox"
                  checked={allRowsSelected}
                  onChange={() => onToggleAllRowsSelection?.(rows.map(row => row.id))}
                  aria-label="현재 페이지 전체 선택"
                  className="mx-auto block h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] cursor-pointer rounded border-slate-300 accent-[#075DF6]"
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
          <tbody className={`${monitoringTableBodyClass} ${bodyClassName}`.trim()}>
            {rows.map((row, index) => {
              const isSelected = activeRowId === row.id;
              const isChecked = selectedRowIds.includes(row.id);
              const isStriped = index % 2 === 1;
              return (
                <Fragment key={row.id}>
                  <tr
                    className={monitoringTableRowClass({
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
                        className="mx-auto block h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] cursor-pointer rounded border-slate-300 accent-[#075DF6]"
                      />
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-0 text-center text-[#667085]'
                      )}
                    >
                      {row.no ?? rowNumberStart + index}
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-[#475467]'
                      )}
                    >
                      <div className="whitespace-nowrap">{row.detectedAt}</div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-[#475467]'
                      )}
                    >
                      <div className="flex items-center justify-center">
                        <ServiceLogoBadge
                          name={row.aiType}
                          variant="compact"
                          className="h-7 w-7 !border-[#8BC6FF] bg-[#F7FBFF] shadow-[0_0.625rem_1.5rem_rgba(7, 93, 246,0.08)]"
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
                        'px-[var(--app-pad-sm)] text-[#23304A]'
                      )}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {row.prompt}
                      </div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-[#23304A]'
                      )}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {row.detectedPolicy ?? row.content}
                      </div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-[#23304A]'
                      )}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {row.userIp}
                      </div>
                    </td>
                    <td
                      className={monitoringCompactTableCellClass(
                        index,
                        'px-[var(--app-pad-sm)] text-[#23304A]'
                      )}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {row.userId ?? '-'}
                      </div>
                    </td>
                  </tr>
                  {isSelected && renderExpandedRow ? (
                    <tr>
                      <td colSpan={9} className="border-t border-[#E5EBF5] bg-white px-0 py-0">
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
          <div className="grid h-[var(--app-control-lg)] w-full grid-cols-[minmax(15rem,1.45fr)_minmax(16rem,2fr)_minmax(7rem,0.5fr)] items-center rounded-t-[var(--app-radius-xl)] border-b border-[#E7EBF4] bg-[linear-gradient(180deg,#F8FAFF_0%,#F2F5FC_100%)] px-[var(--app-pad-lg)] text-[clamp(0.82rem,0.95vw,0.9rem)] font-semibold tracking-[-0.01em] text-[#59627A]">
            <span>서비스</span>
            <span>URL</span>
            <span className="text-center">사용/비사용</span>
          </div>

          <div className="overflow-hidden rounded-b-[var(--app-radius-xl)]">
            {rows.map((row, index) => {
              return (
                <div
                  key={row.id}
                  className={`grid min-h-[clamp(3.75rem,4.6vw,4.125rem)] w-full grid-cols-[minmax(15rem,1.45fr)_minmax(16rem,2fr)_minmax(7rem,0.5fr)] items-center bg-white px-[var(--app-pad-lg)] text-[clamp(0.82rem,0.95vw,0.9rem)] leading-[150%] text-[#334155] ${
                    index === 0 ? '' : 'border-t border-[#EEF1F6]'
                  }`.trim()}
                >
                  <div className="flex items-center gap-[var(--app-gap-sm)] py-[var(--app-pad-sm)] pr-[var(--app-pad-md)]">
                    {renderLogo(row)}
                    <div className="truncate font-semibold text-[#1F2A44]">{row.name}</div>
                  </div>
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate pr-[var(--app-pad-md)] text-[#667085] underline decoration-transparent transition hover:text-[#075DF6] hover:decoration-[#075DF6]"
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
