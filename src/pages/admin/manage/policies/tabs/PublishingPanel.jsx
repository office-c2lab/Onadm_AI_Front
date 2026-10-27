import { useState } from 'react';
import { Card, RadioChoice, SelectField, ToggleRow, panelClass } from './PolicyFormControls.jsx';

export default function PublishingPanel() {
  const [publishMethod, setPublishMethod] = useState('manual');
  const [visibility, setVisibility] = useState('registrant');
  const [accessGrant, setAccessGrant] = useState('공개 대상자는 즉시 사용');
  const [scheduledPublishing, setScheduledPublishing] = useState(false);

  return (
    <div className={panelClass}>
      <Card title="AI App Store 공개 설정">
        <fieldset className="py-5">
          <legend className="mb-3 text-base font-semibold text-slate-800">승인 후 공개 방식</legend>
          <div className="space-y-3">
            {[
              ['manual', '관리자가 직접 공개'],
              ['automatic', '승인 완료 시 자동 공개'],
            ].map(([value, label]) => (
              <div key={value}>
                <RadioChoice
                  name="publish-method"
                  value={value}
                  checked={publishMethod === value}
                  onChange={() => setPublishMethod(value)}
                >
                  {label}
                </RadioChoice>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-t border-slate-100 py-5">
          <legend className="mb-3 text-base font-semibold text-slate-800">기본 공개 범위</legend>
          <div className="space-y-3">
            {[
              ['private', '비공개'],
              ['registrant', '등록 부서에만 공개'],
              ['organization', '조직 전체 공개'],
            ].map(([value, label]) => (
              <div key={value}>
                <RadioChoice
                  name="visibility"
                  value={value}
                  checked={visibility === value}
                  onChange={() => setVisibility(value)}
                >
                  {label}
                </RadioChoice>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="border-t border-slate-100 py-5">
          <SelectField
            label="임직원 사용 권한 부여 방식"
            value={accessGrant}
            onChange={setAccessGrant}
            options={['공개 대상자는 즉시 사용', '관리자 승인 후 사용', '사용자별 요청 후 사용']}
          />
        </div>
      </Card>

      <Card title="배포 운영">
        <div>
          <ToggleRow
            title="예약 배포 허용"
            helper="관리자가 지정한 날짜에 앱을 공개할 수 있습니다."
            checked={scheduledPublishing}
            onChange={() => setScheduledPublishing(current => !current)}
          />
        </div>
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3.5">
          <p className="text-sm font-semibold text-slate-700">기본 공개 절차</p>
          <p className="mt-2 text-[15px] leading-6 text-slate-800">
            승인 완료 → 관리자 공개 확인 → 등록 부서 임직원 → 바로 사용
          </p>
        </div>
      </Card>
    </div>
  );
}
