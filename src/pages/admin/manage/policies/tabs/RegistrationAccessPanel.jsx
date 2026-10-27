import { useState } from 'react';
import { Card, RadioChoice, SelectField, ToggleRow, panelClass } from './PolicyFormControls.jsx';

export default function RegistrationAccessPanel() {
  const [registrantScope, setRegistrantScope] = useState('all');
  const [assetTypes, setAssetTypes] = useState(['AI App', 'AI Agent']);
  const [departmentScope, setDepartmentScope] = useState('all');
  const [maxRegistrations, setMaxRegistrations] = useState('5');
  const [preApply, setPreApply] = useState(true);
  const [allowDuplicateNames, setAllowDuplicateNames] = useState(false);
  const [allowResubmission, setAllowResubmission] = useState(true);
  const [externalAiPolicy, setExternalAiPolicy] = useState('별도 심사 필수');

  const toggleAssetType = type => {
    setAssetTypes(current =>
      current.includes(type) ? current.filter(item => item !== type) : [...current, type]
    );
  };

  return (
    <div className={panelClass}>
      <Card title="기본 등록 권한">
        <div className="divide-y divide-slate-100">
          <fieldset className="py-5">
            <legend className="mb-3 text-base font-semibold text-slate-800">
              등록 가능 사용자
            </legend>
            <div className="flex flex-col items-start gap-2.5">
              {[
                ['all', '모든 임직원'],
                ['selected', '지정된 사용자만'],
                ['admin', '관리자만'],
              ].map(([value, label]) => (
                <RadioChoice
                  key={value}
                  name="registrant-scope"
                  value={value}
                  checked={registrantScope === value}
                  onChange={() => setRegistrantScope(value)}
                >
                  {label}
                </RadioChoice>
              ))}
            </div>
          </fieldset>

          <fieldset className="py-5">
            <legend className="mb-3 text-base font-semibold text-slate-800">
              등록 가능한 자산 유형
            </legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {['AI App', 'AI Agent'].map(type => (
                <label
                  key={type}
                  className="inline-flex cursor-pointer items-center gap-2.5 text-[15px] text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={assetTypes.includes(type)}
                    onChange={() => toggleAssetType(type)}
                    className="size-4 rounded accent-blue-600"
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="py-5">
            <legend className="mb-3 text-base font-semibold text-slate-800">등록 허용 부서</legend>
            <div className="flex flex-col items-start gap-2.5">
              {[
                ['all', '전체 부서 허용'],
                ['selected', '선택한 부서만 허용'],
              ].map(([value, label]) => (
                <RadioChoice
                  key={value}
                  name="department-scope"
                  value={value}
                  checked={departmentScope === value}
                  onChange={() => setDepartmentScope(value)}
                >
                  {label}
                </RadioChoice>
              ))}
            </div>
          </fieldset>

          <label className="block py-5">
            <span className="block text-base font-semibold text-slate-800">
              사용자별 최대 등록 개수
            </span>
            <span className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={maxRegistrations}
                onChange={event => setMaxRegistrations(event.target.value)}
                className="h-9 w-20 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              />
              <span className="text-sm text-slate-500">개 (0 = 제한 없음)</span>
            </span>
          </label>
        </div>
      </Card>

      <Card title="추가 등록 정책">
        <div className="divide-y divide-slate-100">
          {[
            {
              title: '등록 신청 접수',
              helper: '새로운 등록 신청을 접수합니다.',
              checked: preApply,
              onChange: () => setPreApply(current => !current),
            },
            {
              title: '동일 이름 등록 허용',
              helper: '다른 자산에 동일한 이름을 사용할 수 있습니다.',
              checked: allowDuplicateNames,
              onChange: () => setAllowDuplicateNames(current => !current),
            },
            {
              title: '반려 후 재등록',
              helper: '수정된 자산을 다시 제출할 수 있습니다.',
              checked: allowResubmission,
              onChange: () => setAllowResubmission(current => !current),
            },
          ].map(item => (
            <ToggleRow
              key={item.title}
              title={item.title}
              helper={item.helper}
              checked={item.checked}
              onChange={item.onChange}
            />
          ))}

          <div className="py-5">
            <SelectField
              label="외부 AI 서비스 연동 등록"
              value={externalAiPolicy}
              onChange={setExternalAiPolicy}
              options={['별도 심사 필수', '일반 심사 적용', '등록 허용 안 함']}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
