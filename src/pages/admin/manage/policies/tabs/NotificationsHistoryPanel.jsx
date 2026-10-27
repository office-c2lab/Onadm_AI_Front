import { useState } from 'react';
import AiStoreActionButton from '../../../../user/aistore/components/AiStoreActionButton.jsx';
import { Card, SelectField, ToggleRow, panelClass } from './PolicyFormControls.jsx';

export default function NotificationsHistoryPanel() {
  const [notifications, setNotifications] = useState({
    registration: true,
    security: true,
    delayed: true,
    expiry: true,
  });
  const [channel, setChannel] = useState('서비스 내 알림 + 이메일');

  const rows = [
    ['registration', '신규 등록 요청 알림', '등록 신청이 접수되면 관리자에게 알립니다.'],
    ['security', '보안 위험 발견 알림', '높은 위험 또는 치명적 위험이 탐지된 경우'],
    ['delayed', '심사 지연 알림', '설정된 심사 기한을 초과한 요청'],
    ['expiry', '재심사 및 만료 예정 알림', '승인 유효기간이 종료되기 전 안내'],
  ];

  return (
    <div className={panelClass}>
      <Card title="알림 수신 설정">
        <div className="divide-y divide-slate-100">
          {rows.map(([id, title, helper]) => (
            <ToggleRow
              key={id}
              title={title}
              helper={helper}
              checked={notifications[id]}
              onChange={() => setNotifications(current => ({ ...current, [id]: !current[id] }))}
            />
          ))}
        </div>

        <div className="border-t border-slate-100 py-5">
          <SelectField
            label="알림 발송 채널"
            value={channel}
            onChange={setChannel}
            options={['서비스 내 알림 + 이메일', '서비스 내 알림', '이메일']}
          />
        </div>
      </Card>

      <Card title="정책 변경 이력">
        <div>
          <p className="text-sm leading-6 text-slate-500">
            저장한 정책 버전을 확인하고 이전 설정을 불러올 수 있습니다.
          </p>
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-4">
            <div>
              <p className="text-[15px] font-semibold text-slate-900">v1 · 초기 정책</p>
              <p className="mt-1 text-sm text-slate-500">현재 저장된 버전</p>
            </div>
            <AiStoreActionButton variant="secondary" size="compact">
              불러오기
            </AiStoreActionButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
