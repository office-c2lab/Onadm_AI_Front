import { useState } from 'react';
import { SearchField } from '../components.jsx';
import RegistrationAccessPanel from './tabs/RegistrationAccessPanel.jsx';
import SubmissionRequirementsPanel from './tabs/SubmissionRequirementsPanel.jsx';
import SecurityReviewPanel from './tabs/SecurityReviewPanel.jsx';
import ReviewApprovalPanel from './tabs/ReviewApprovalPanel.jsx';
import PublishingPanel from './tabs/PublishingPanel.jsx';
import RereviewPanel from './tabs/RereviewPanel.jsx';
import NotificationsHistoryPanel from './tabs/NotificationsHistoryPanel.jsx';

const policyTabs = [
  { id: 'registration-access', title: '등록 권한' },
  { id: 'submission-requirements', title: '제출 요건' },
  { id: 'security-review', title: '보안검사' },
  { id: 'review-approval', title: '심사·승인' },
  { id: 'publishing', title: '공개·배포' },
  { id: 'rereview', title: '변경·재심사' },
  { id: 'notifications-history', title: '알림·이력' },
];

const policyPanels = {
  'registration-access': RegistrationAccessPanel,
  'submission-requirements': SubmissionRequirementsPanel,
  'security-review': SecurityReviewPanel,
  'review-approval': ReviewApprovalPanel,
  publishing: PublishingPanel,
  rereview: RereviewPanel,
  'notifications-history': NotificationsHistoryPanel,
};

export default function PoliciesPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('registration-access');
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTabs = policyTabs.filter(tab => tab.title.toLowerCase().includes(normalizedQuery));
  const ActivePanel = policyPanels[activeTab];
  const activeTabIsVisible = visibleTabs.some(tab => tab.id === activeTab);

  return (
    <div className="-mt-6">
      <div className="sticky top-0 z-20 -mx-4 bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-xl items-center">
          <SearchField value={query} onChange={setQuery} placeholder="심사 정책 검색" />
        </div>
      </div>

      <nav
        aria-label="등록 심사 정책 설정"
        className="mt-3 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full justify-start gap-1">
          {visibleTabs.map(tab => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 ${
                  isActive
                    ? 'bg-[#ededed] font-medium text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {tab.title}
              </button>
            );
          })}
        </div>
      </nav>

      {ActivePanel && activeTabIsVisible ? <ActivePanel /> : null}

      {!visibleTabs.length ? (
        <p className="py-12 text-center text-sm text-slate-500">일치하는 정책 탭이 없습니다.</p>
      ) : null}
    </div>
  );
}
