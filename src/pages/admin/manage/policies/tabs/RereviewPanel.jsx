import { useState } from 'react';
import { Card, ChecklistBox, SelectField, ToggleRow, panelClass } from './PolicyFormControls.jsx';

export default function RereviewPanel() {
  const [minorChange, setMinorChange] = useState('관리자 확인 후 반영');
  const [keepVersion, setKeepVersion] = useState(true);
  const [validity, setValidity] = useState('12개월');
  const [inactivePeriod, setInactivePeriod] = useState('90일 미사용');

  return (
    <div className={panelClass}>
      <Card title="변경 및 재심사 조건">
        <div>
          <p className="mb-3 text-base font-semibold text-slate-800">필수 재심사 대상</p>
          <ChecklistBox
            items={[
              '외부 API 및 연동 대상의 주요 변경',
              '데이터 접근 권한 확대',
              '보안 영향이 있는 주요 버전 업데이트',
            ]}
          />

          <div className="mt-4">
            <SelectField
              label="경미한 변경 처리"
              value={minorChange}
              onChange={setMinorChange}
              options={['관리자 확인 후 반영', '즉시 반영', '간소화 심사 후 반영']}
            />
          </div>
        </div>

        <div className="border-t border-slate-100">
          <ToggleRow
            title="재심사 중 기존 승인 버전 유지"
            helper="별도 위험 조치가 없는 한 기존 버전을 유지합니다."
            checked={keepVersion}
            onChange={() => setKeepVersion(current => !current)}
          />
        </div>
      </Card>

      <Card title="정기 점검 및 폐기 기준">
        <div className="space-y-4">
          <SelectField
            label="승인 유효기간"
            value={validity}
            onChange={setValidity}
            options={['6개월', '12개월', '24개월', '제한 없음']}
          />
          <SelectField
            label="장기 미사용 자산 검토"
            value={inactivePeriod}
            onChange={setInactivePeriod}
            options={['30일 미사용', '90일 미사용', '180일 미사용', '검토 안 함']}
          />
          <p className="text-sm leading-6 text-slate-500">
            장기 미사용 자산은 자동 삭제하지 않고 관리자 검토 대상으로 지정합니다.
          </p>
        </div>
      </Card>
    </div>
  );
}
