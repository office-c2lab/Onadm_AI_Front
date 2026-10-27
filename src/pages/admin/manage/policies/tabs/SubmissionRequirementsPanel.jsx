import { useState } from 'react';
import { Card, ToggleRow, panelClass } from './PolicyFormControls.jsx';

export default function SubmissionRequirementsPanel() {
  const [requiredFields, setRequiredFields] = useState([
    '카테고리',
    '사용 방법 및 가이드',
    '업무 목적',
  ]);

  const toggleRequiredField = title => {
    setRequiredFields(current =>
      current.includes(title) ? current.filter(item => item !== title) : [...current, title]
    );
  };

  const optionalFields = [
    ['대표 이미지', 'AI App Store 목록 및 상세 화면에 표시'],
    ['카테고리', '등록 시 분류 선택'],
    ['사용 방법 및 가이드', '이용자가 참고할 설명서'],
    ['업무 목적', '어떤 용도로 사용하는지 설명'],
    ['소스코드 또는 저장소 정보', '코드를 제출할 수 있는 자산에 적용'],
  ];

  return (
    <div className={panelClass}>
      <Card
        title="등록 필수 정보 설정"
        description="관리자가 필수로 받을 정보를 선택합니다. 기본 식별 정보와 보안 필수 항목은 항상 제출됩니다."
      >
        <div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            {['AI 자산 이름 및 기본 설명', '등록자 및 소속 부서', '데이터 및 요청 권한 정보'].map(
              item => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 py-2.5 text-[15px]"
                >
                  <span className="text-slate-800">{item}</span>
                  <span className="shrink-0 text-sm text-slate-500">필수 고정</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {optionalFields.map(([title, helper]) => (
            <ToggleRow
              key={title}
              title={title}
              helper={helper}
              checked={requiredFields.includes(title)}
              onChange={() => toggleRequiredField(title)}
              suffix="필수"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
