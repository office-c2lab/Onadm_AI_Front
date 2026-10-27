import { useState } from 'react';
import { Card, RadioChoice, SelectField, ToggleRow, panelClass } from './PolicyFormControls.jsx';

export default function ReviewApprovalPanel() {
  const [approvalMethod, setApprovalMethod] = useState('manual');
  const [reviewer, setReviewer] = useState('조직 관리자');
  const [deadline, setDeadline] = useState('접수 후 5영업일');
  const [allowRevision, setAllowRevision] = useState(true);
  const [requireComment, setRequireComment] = useState(false);

  return (
    <div className={panelClass}>
      <Card title="승인 방식">
        <fieldset className="space-y-3.5 pb-5">
          {[
            ['manual', '관리자가 검토 후 승인'],
            ['automatic', '안전 조건 충족 시 자동 승인'],
            ['two-step', '2단계 관리자 승인'],
          ].map(([value, label]) => (
            <div key={value}>
              <RadioChoice
                name="approval-method"
                value={value}
                checked={approvalMethod === value}
                onChange={() => setApprovalMethod(value)}
              >
                {label}
              </RadioChoice>
            </div>
          ))}
        </fieldset>

        <div className="space-y-4 border-t border-slate-100 py-5">
          <SelectField
            label="기본 심사 담당자"
            value={reviewer}
            onChange={setReviewer}
            options={['조직 관리자', '보안 담당자', '서비스 운영 관리자']}
          />
          <SelectField
            label="목표 심사 기한"
            value={deadline}
            onChange={setDeadline}
            options={['접수 후 3영업일', '접수 후 5영업일', '접수 후 10영업일']}
          />
        </div>
      </Card>

      <Card title="심사 처리 규칙">
        <div className="divide-y divide-slate-100">
          <ToggleRow
            title="수정 요청 허용"
            helper="반려 없이 수정 및 재제출을 요청할 수 있습니다."
            checked={allowRevision}
            onChange={() => setAllowRevision(current => !current)}
          />
          <ToggleRow
            title="승인 시 검토 의견 필수"
            helper="승인 사유를 기록하도록 설정합니다."
            checked={requireComment}
            onChange={() => setRequireComment(current => !current)}
          />
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
          {[
            ['본인 등록 자신의 셀프 승인', '금지'],
            ['반려 사유 기록', '필수'],
            ['보안검사 미완료 자산 승인', '금지'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5 text-[15px]">
              <span className="text-slate-800">{label}</span>
              <span
                className={`text-sm font-medium ${value === '금지' ? 'text-red-500' : 'text-slate-600'}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
