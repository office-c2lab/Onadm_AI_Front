import { useState } from 'react';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';

import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import { AdminDetailSection } from '../../../../layouts/admin/AdminDetailLayout.jsx';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import PageLayout from '../../control/components/PageLayout.jsx';
import AppToggle from '../../control/external/components/AppToggle.jsx';
import { DateRangePicker } from '../../control/external/components/monitoring/MonitoringListComponents.jsx';
import '../../control/external/garim.css';

const OPERATION_NOTICES = [
  {
    id: 'notice-1',
    title: 'Control 내부 정기 점검 안내',
    description: '정책 엔진 업데이트를 위한 정기 점검이 진행될 예정입니다.',
    startAt: '2026-10-28T14:30',
    endAt: '2026-10-31T18:00',
    status: '게시 중',
  },
  {
    id: 'notice-2',
    title: 'AI Policy Engine 업데이트 안내',
    description: '정책 처리 성능과 요청 라우팅 안정성이 개선되었습니다.',
    startAt: '2026-10-25T09:00',
    endAt: '2026-11-08T23:59',
    status: '게시 중',
  },
  {
    id: 'notice-3',
    title: '모니터링 수집 지연 정상화 안내',
    description: '일부 외부 AI 모니터링 데이터의 수집 지연이 정상화되었습니다.',
    startAt: '2026-10-23T16:20',
    endAt: '2026-10-25T18:00',
    status: '게시 종료',
  },
];

const STATUS_TONE = {
  '게시 중': 'text-blue-600',
  '게시 예약': 'text-amber-600',
  '게시 종료': 'text-slate-500',
};

const EMPTY_NOTICE = {
  title: '',
  description: '',
  startAt: '2026-10-28T14:30',
  endAt: '2026-10-31T23:59',
  status: '게시 중',
};

const TIME_OPTIONS = [
  ...Array.from({ length: 24 * 6 }, (_, index) => {
    const totalMinutes = index * 10;
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    return `${hours}:${minutes}`;
  }),
  '23:59',
];

function formatPublishedAt(value) {
  return value ? value.replace(/-/g, '.').replace('T', ' ') : '—';
}

function OperationNoticesPanel({ notices, onOpen }) {
  return (
    <div className="divide-y divide-slate-100 border-y border-slate-200">
      {notices.map(notice => (
        <button
          type="button"
          key={notice.id}
          onClick={() => onOpen(notice)}
          className="flex min-h-[82px] w-full flex-wrap items-center gap-x-5 gap-y-2 px-1 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:flex-nowrap sm:px-3"
        >
          <div className="min-w-0 flex-[1_1_22rem]">
            <h3 className="truncate text-sm font-semibold text-slate-900">{notice.title}</h3>
            <p className="mt-1 truncate text-sm text-slate-500">{notice.description}</p>
          </div>
          <span className="flex w-36 shrink-0 flex-col text-xs leading-5 whitespace-nowrap text-slate-500">
            <time>{formatPublishedAt(notice.startAt)}</time>
            <time>~ {formatPublishedAt(notice.endAt)}</time>
          </span>
          <span
            className={`w-16 shrink-0 text-right text-sm font-semibold ${STATUS_TONE[notice.status]}`}
          >
            {notice.status}
          </span>
          <ChevronRight size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
        </button>
      ))}
      {!notices.length ? (
        <p className="py-16 text-center text-sm text-slate-400">등록된 운영 공지가 없습니다.</p>
      ) : null}
    </div>
  );
}

function EnvironmentSettingsPanel() {
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [language, setLanguage] = useState('한국어');

  return (
    <div className="divide-y divide-slate-100">
      <section className="flex items-center justify-between gap-5 py-4 first:pt-1">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">점검 및 업데이트 알림</h3>
          <p className="mt-1 text-sm text-slate-500">시스템 변경 및 점검 예정 안내</p>
        </div>
        <AppToggle
          checked={maintenanceAlerts}
          onChange={() => setMaintenanceAlerts(current => !current)}
          ariaLabel="점검 및 업데이트 알림"
        />
      </section>

      <section className="flex items-center justify-between gap-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">시스템 장애 알림</h3>
          <p className="mt-1 text-sm text-slate-500">서비스 장애 발생 시 알림 수신</p>
        </div>
        <AppToggle
          checked={incidentAlerts}
          onChange={() => setIncidentAlerts(current => !current)}
          ariaLabel="시스템 장애 알림"
        />
      </section>

      <label className="block py-4">
        <span className="mb-2 block text-sm font-semibold text-slate-800">기본 언어</span>
        <CustomDropdown
          value={language}
          onChange={setLanguage}
          options={['한국어', 'English', '日本語']}
          ariaLabel="기본 언어"
          className="w-full [&>button]:h-11 [&>button]:rounded-full"
        />
      </label>
    </div>
  );
}

function NoticeForm({ draft, onChange }) {
  const [startDate = '', startTime = ''] = draft.startAt.split('T');
  const [endDate = '', endTime = ''] = draft.endAt.split('T');

  return (
    <div className="grid gap-4">
      <label className="text-sm font-medium text-slate-700">
        제목
        <input
          value={draft.title}
          onChange={event => onChange({ title: event.target.value })}
          placeholder="공지 제목을 입력하세요."
          className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        내용
        <textarea
          value={draft.description}
          onChange={event => onChange({ description: event.target.value })}
          placeholder="공지 내용을 입력하세요."
          className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        게시 상태
        <CustomDropdown
          value={draft.status}
          onChange={value => onChange({ status: value })}
          options={['게시 중', '게시 예약', '게시 종료']}
          ariaLabel="게시 상태"
          className="mt-2 w-full [&>button]:h-11"
        />
      </label>
      <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_6.5rem_6.5rem]">
        <DateRangePicker
          label="게시 기간"
          startDate={startDate}
          endDate={endDate}
          popoverPlacement="top"
          onChange={range =>
            onChange({
              startAt: `${range.startDate}T${startTime || '00:00'}`,
              endAt: `${range.endDate}T${endTime || '23:59'}`,
            })
          }
          widthClass="w-full min-w-0"
          labelClassName="text-sm font-medium text-slate-700"
          triggerHeightClass="h-11"
        />
        <label className="text-sm font-medium text-slate-700">
          시작 시간
          <CustomDropdown
            value={startTime}
            onChange={value => onChange({ startAt: `${startDate}T${value}` })}
            options={TIME_OPTIONS}
            ariaLabel="게시 시작 시간"
            className="mt-2 w-full"
            menuClassName="bottom-full !mt-0 mb-1"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          종료 시간
          <CustomDropdown
            value={endTime}
            onChange={value => onChange({ endAt: `${endDate}T${value}` })}
            options={TIME_OPTIONS}
            ariaLabel="게시 종료 시간"
            className="mt-2 w-full"
            menuClassName="bottom-full !mt-0 mb-1"
          />
        </label>
      </div>
    </div>
  );
}

export default function OperationsPage() {
  const [notices, setNotices] = useState(OPERATION_NOTICES);
  const [noticeModal, setNoticeModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [noticeError, setNoticeError] = useState('');

  const openCreateNotice = () => {
    setNoticeError('');
    setNoticeModal({ mode: 'create', draft: { ...EMPTY_NOTICE } });
  };

  const openEditNotice = notice => {
    setNoticeError('');
    setNoticeModal({ mode: 'edit', draft: { ...notice } });
  };

  const closeNoticeModal = () => {
    setNoticeModal(null);
    setNoticeError('');
  };

  const updateNoticeDraft = patch => {
    setNoticeModal(current => ({ ...current, draft: { ...current.draft, ...patch } }));
    if (noticeError) setNoticeError('');
  };

  const saveNotice = () => {
    const { mode, draft } = noticeModal;
    const [startDate, startTime] = draft.startAt.split('T');
    const [endDate, endTime] = draft.endAt.split('T');
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    const hasValidPeriod =
      startDate && endDate && timePattern.test(startTime || '') && timePattern.test(endTime || '');

    if (!draft.title.trim() || !draft.description.trim() || !hasValidPeriod) {
      setNoticeError('제목, 내용, 게시 기간을 모두 입력해 주세요.');
      return;
    }

    if (draft.endAt < draft.startAt) {
      setNoticeError('종료 일시는 시작 일시보다 빠를 수 없습니다.');
      return;
    }

    const savedNotice = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
    };

    if (mode === 'edit') {
      setNotices(current =>
        current.map(notice => (notice.id === savedNotice.id ? savedNotice : notice))
      );
    } else {
      setNotices(current => [{ ...savedNotice, id: `notice-${Date.now()}` }, ...current]);
    }

    closeNoticeModal();
  };

  const requestDeleteNotice = () => {
    setDeleteTarget(noticeModal.draft);
    setNoticeModal(null);
    setNoticeError('');
  };

  return (
    <div className="garim-external-root min-h-full bg-white text-[#111827]">
      <PageLayout gapClassName="gap-0" topPaddingClassName="pt-6">
        <div className="mx-auto w-full max-w-4xl pb-10 text-slate-900">
          <header className="pb-8 sm:pb-10">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
              공지 및 설정
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
              시스템 운영 공지와 관리자 환경 설정을 한 곳에서 관리합니다.
            </p>
          </header>

          <AdminDetailSection
            title="운영 공지"
            description="시스템 점검, 장애 안내와 신규 기능 소식을 관리합니다."
            action={
              <AiStoreActionButton size="small" icon={Plus} onClick={openCreateNotice}>
                공지 추가
              </AiStoreActionButton>
            }
          >
            <OperationNoticesPanel notices={notices} onOpen={openEditNotice} />
          </AdminDetailSection>

          <AdminDetailSection
            title="환경 설정"
            description="운영 알림 수신 여부와 기본 언어를 설정합니다."
          >
            <EnvironmentSettingsPanel />
          </AdminDetailSection>
        </div>
      </PageLayout>

      <AiStoreConfirmModal
        open={Boolean(noticeModal)}
        allowOverflow
        rootClassName="garim-external-root"
        title={noticeModal?.mode === 'edit' ? '운영 공지 수정' : '운영 공지 추가'}
        confirmLabel={noticeModal?.mode === 'edit' ? '저장' : '추가'}
        confirmVariant="primary"
        footerStart={
          noticeModal?.mode === 'edit' ? (
            <AiStoreActionButton variant="danger" onClick={requestDeleteNotice}>
              삭제
            </AiStoreActionButton>
          ) : null
        }
        error={noticeError}
        onClose={closeNoticeModal}
        onConfirm={saveNotice}
      >
        {noticeModal ? <NoticeForm draft={noticeModal.draft} onChange={updateNoticeDraft} /> : null}
      </AiStoreConfirmModal>

      <AiStoreConfirmModal
        open={Boolean(deleteTarget)}
        title="운영 공지를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setNotices(current => current.filter(notice => notice.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
      >
        <strong className="font-semibold text-slate-900">{deleteTarget?.title}</strong> 공지가
        목록에서 삭제됩니다.
      </AiStoreConfirmModal>
    </div>
  );
}
