import { useState } from 'react';
import { Card, ChecklistBox, SelectField, ToggleRow, panelClass } from './PolicyFormControls.jsx';

export default function SecurityReviewPanel() {
  const [runTiming, setRunTiming] = useState('등록 및 모든 버전 업데이트 시');
  const [mediumRisk, setMediumRisk] = useState('관리자 수동 심사');
  const [highRisk, setHighRisk] = useState('보안 담당자 필수 검토');
  const [retryOnError, setRetryOnError] = useState(true);
  const [resultAccess, setResultAccess] = useState('등록자와 관리자');

  return (
    <div className={panelClass}>
      <Card
        title="자동 보안검사 기본 정책"
        description="검사 항목과 치명적 위험의 차단 기준은 플랫폼에서 관리합니다. 기업 관리자는 검사 시점과 추가 검토 절차를 설정할 수 있습니다."
      >
        <div className="space-y-5">
          <ChecklistBox
            items={[
              '민감정보 및 인증정보 노출 검사',
              '제출 소스코드 취약점 검사',
              '외부 API 및 권한 위험 검토',
              '치명적 위험 발견 시 승인 차단',
            ]}
          />

          <SelectField
            label="보안검사 실행 시점"
            value={runTiming}
            onChange={setRunTiming}
            options={['등록 및 모든 버전 업데이트 시', '최초 등록 시', '주요 버전 업데이트 시']}
          />

          <div className="border-t border-slate-100 pt-4">
            <h3 className="mb-4 text-base font-bold text-slate-900">검사 결과별 처리 방식</h3>
            <div className="space-y-3">
              <SelectField
                label="중간 위험 발견 시"
                value={mediumRisk}
                onChange={setMediumRisk}
                options={['관리자 수동 심사', '보완 요청 후 재검사', '자동 승인']}
              />
              <SelectField
                label="높은 위험 발견 시"
                value={highRisk}
                onChange={setHighRisk}
                options={['보안 담당자 필수 검토', '즉시 반려', '관리자 수동 심사']}
              />
            </div>
          </div>

          <div className="rounded-xl bg-red-50 px-4 py-3">
            <p className="text-[15px] font-semibold text-red-600">치명적 위험: 승인 자동 차단</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              관리자가 해제할 수 없는 공통 보안 기준입니다.
            </p>
          </div>
        </div>
      </Card>

      <Card title="검사 운영 설정">
        <div className="divide-y divide-slate-100">
          <ToggleRow
            title="일시적 검사 오류 자동 재시도"
            helper="검사 시스템 오류 발생 시 자동으로 재시도합니다."
            checked={retryOnError}
            onChange={() => setRetryOnError(current => !current)}
          />
          <div className="py-5">
            <SelectField
              label="상세 검사 결과 확인 권한"
              value={resultAccess}
              onChange={setResultAccess}
              options={['등록자와 관리자', '관리자만', '등록자와 심사 담당자']}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
