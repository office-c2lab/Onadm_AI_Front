import { useMemo, useState } from 'react';
import { FlaskConical } from 'lucide-react';

import CustomDropdown from '../../../../../components/dropdown/CustomDropdown.jsx';
import { AdminDetailSection } from '../../../../../layouts/admin/AdminDetailLayout.jsx';
import AiStoreActionButton from '../../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../../user/aistore/components/AiStoreConfirmModal.jsx';
import AppButton from '../../external/components/AppButton.jsx';
import AppToggle from '../../external/components/AppToggle.jsx';
import {
  monitoringTableBodyClass,
  monitoringTableCellClass,
  monitoringTableClass,
  monitoringTableHeadClass,
  monitoringTableHeaderCellClass,
  monitoringTableHeaderRowClass,
  monitoringTableRowClass,
} from '../../external/components/monitoring/monitoringTableStyles.js';
import PageLayout from '../../components/PageLayout.jsx';
import '../../external/garim.css';

const grades = [
  {
    id: 'C',
    name: 'Confidential',
    label: '기밀정보',
    description: '외부 전송이 금지되는 핵심 정보',
    examples: '소스코드, 설계도, 영업비밀, 미공개 경영정보',
    badgeClass: 'bg-rose-50 text-rose-500',
  },
  {
    id: 'S',
    name: 'Sensitive',
    label: '민감정보',
    description: '보호 조치 후 제한적으로 사용할 수 있는 정보',
    examples: '개인정보, 계약서, 재무정보, 내부 보고서',
    badgeClass: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'O',
    name: 'Open',
    label: '공개정보',
    description: '외부 전달 위험이 낮은 공개·일반 정보',
    examples: '보도자료, 공개 매뉴얼, 일반 업무 질문',
    badgeClass: 'bg-emerald-50 text-emerald-600',
  },
];

const destinations = [
  { id: 'internal', label: '내부 AI', description: '사내 LLM 및 온담 AI' },
  { id: 'approved', label: '승인 외부 AI', description: '보안 검토를 완료한 서비스' },
  { id: 'unapproved', label: '미승인 외부 AI', description: '미등록 서비스 및 개인 계정' },
];

const actions = [
  { id: 'allow', label: '허용', className: 'bg-emerald-50 text-emerald-600' },
  {
    id: 'conditional',
    label: '조건부 허용',
    className: 'bg-amber-50 text-amber-600',
  },
  { id: 'mask', label: '마스킹 후 허용', className: 'bg-blue-50 text-blue-600' },
  {
    id: 'approval',
    label: '승인 후 허용',
    className: 'bg-violet-50 text-violet-600',
  },
  { id: 'block', label: '차단', className: 'bg-rose-50 text-rose-500' },
];

const initialMatrix = {
  C: { internal: 'conditional', approved: 'block', unapproved: 'block' },
  S: { internal: 'allow', approved: 'mask', unapproved: 'block' },
  O: { internal: 'allow', approved: 'allow', unapproved: 'block' },
};

const initialRules = [
  {
    id: 1,
    name: '개인정보 탐지',
    grade: 'S',
    target: '프롬프트 · 파일 · 검색 문서',
    description: '주민등록번호, 전화번호, 이메일, 계좌번호 패턴',
    enabled: true,
  },
  {
    id: 2,
    name: '영업비밀 및 핵심 기술',
    grade: 'C',
    target: '프롬프트 · 파일 · 관리자 문서',
    description: '소스코드, 설계문서, 제품 로드맵, 기밀 프로젝트명',
    enabled: true,
  },
  {
    id: 3,
    name: '계약·재무정보',
    grade: 'S',
    target: '프롬프트 · 파일',
    description: '계약금액, 원가, 미공개 실적 및 투자 관련 표현',
    enabled: true,
  },
  {
    id: 4,
    name: '공개정보 확인',
    grade: 'O',
    target: '검색 문서 · 관리자 문서',
    description: '공식 홈페이지와 공개 자료에 등록된 콘텐츠',
    enabled: false,
  },
];

function GradeBadge({ grade }) {
  const item = grades.find(candidate => candidate.id === grade);
  return (
    <span
      className={`inline-flex min-w-7 shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${item.badgeClass}`}
    >
      {grade}
    </span>
  );
}

function ActionSelect({ value, onChange, label }) {
  return (
    <CustomDropdown
      ariaLabel={label}
      value={value}
      onChange={onChange}
      options={actions.map(item => ({ value: item.id, label: item.label }))}
      className="w-full [&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:text-sm [&>button]:font-semibold"
      menuClassName="min-w-[10rem]"
    />
  );
}

function ClassificationTable() {
  return (
    <div className="overflow-hidden border-y border-slate-200">
      <div className="overflow-x-auto">
        <table className={`${monitoringTableClass} min-w-[48rem]`} aria-label="CSO 정보 등급 체계">
          <thead className={monitoringTableHeadClass}>
            <tr className={monitoringTableHeaderRowClass}>
              <th className={`${monitoringTableHeaderCellClass} w-[22%] px-5 sm:px-6`}>등급</th>
              <th className={`${monitoringTableHeaderCellClass} w-[40%]`}>의미</th>
              <th className={`${monitoringTableHeaderCellClass} w-[38%]`}>대표 예시</th>
            </tr>
          </thead>
          <tbody className={monitoringTableBodyClass}>
            {grades.map((grade, index) => (
              <tr key={grade.id} className={monitoringTableRowClass({ striped: index % 2 === 1 })}>
                <td className={monitoringTableCellClass(index, 'px-5 sm:px-6')}>
                  <div className="flex items-center gap-3">
                    <GradeBadge grade={grade.id} />
                    <div>
                      <p className="font-bold text-slate-900">{grade.label}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{grade.name}</p>
                    </div>
                  </div>
                </td>
                <td className={monitoringTableCellClass(index, 'text-slate-600')}>
                  {grade.description}
                </td>
                <td className={monitoringTableCellClass(index, 'text-slate-600')}>
                  {grade.examples}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs font-medium text-slate-500">
        분류 대상: 사용자 프롬프트 · 업로드 파일 · 검색 문서 · 관리자 등록 문서 · AI 응답
      </div>
    </div>
  );
}

function PolicyMatrix({ matrix, onChange }) {
  return (
    <div className="border-y border-slate-200">
      <div className="hidden grid-cols-[10rem_repeat(3,minmax(0,1fr))] gap-4 border-b border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-semibold text-slate-500 lg:grid">
        <span>정보 등급</span>
        {destinations.map(destination => (
          <span key={destination.id}>
            <strong className="block font-semibold text-slate-700">{destination.label}</strong>
            <span className="mt-1 block text-xs leading-5 font-medium text-slate-400">
              {destination.description}
            </span>
          </span>
        ))}
      </div>
      {grades.map((grade, index) => (
        <div
          key={grade.id}
          className={`grid gap-4 px-4 py-4 lg:grid-cols-[10rem_repeat(3,minmax(0,1fr))] lg:items-center ${
            index ? 'border-t border-slate-100' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <GradeBadge grade={grade.id} />
            <span className="text-[0.95rem] font-semibold text-slate-800">{grade.label}</span>
          </div>
          {destinations.map(destination => (
            <div key={destination.id}>
              <label className="mb-1.5 block text-sm font-semibold text-slate-600 lg:hidden">
                {destination.label}
              </label>
              <ActionSelect
                value={matrix[grade.id][destination.id]}
                label={`${grade.label}의 ${destination.label} 정책`}
                onChange={value => onChange(grade.id, destination.id, value)}
              />
            </div>
          ))}
        </div>
      ))}
      <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-sm leading-6 text-slate-500">
        하나의 요청에 여러 정보가 포함되면 가장 높은 보호 등급을 우선 적용합니다.
      </div>
    </div>
  );
}

function RulesTable({ rules, onToggle }) {
  return (
    <div className="overflow-hidden border-y border-slate-200">
      <div className="overflow-x-auto">
        <table className={`${monitoringTableClass} min-w-[48rem]`} aria-label="분류 탐지 규칙">
          <thead className={monitoringTableHeadClass}>
            <tr className={monitoringTableHeaderRowClass}>
              <th className={`${monitoringTableHeaderCellClass} w-[52%] px-5 sm:px-6`}>
                규칙 및 탐지 내용
              </th>
              <th className={`${monitoringTableHeaderCellClass} w-[36%]`}>적용 대상</th>
              <th className={`${monitoringTableHeaderCellClass} w-[10%] !text-center`}>사용</th>
            </tr>
          </thead>
          <tbody className={monitoringTableBodyClass}>
            {rules.map((rule, index) => (
              <tr key={rule.id} className={monitoringTableRowClass({ striped: index % 2 === 1 })}>
                <td className={monitoringTableCellClass(index, 'px-5 sm:px-6')}>
                  <div className="flex items-start gap-3">
                    <GradeBadge grade={rule.grade} />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800">{rule.name}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{rule.description}</p>
                    </div>
                  </div>
                </td>
                <td className={monitoringTableCellClass(index)}>
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold leading-5 text-slate-600">
                    {rule.target}
                  </span>
                </td>
                <td className={monitoringTableCellClass(index, 'text-center')}>
                  <span className="inline-flex">
                    <AppToggle
                      checked={rule.enabled}
                      onChange={() => onToggle(rule.id)}
                      ariaLabel={`${rule.name} 사용 설정`}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Simulator({ matrix }) {
  const [input, setInput] = useState('김온담 고객의 연락처 010-1234-5678을 정리해줘.');
  const [destination, setDestination] = useState('approved');
  const [result, setResult] = useState(null);

  const runTest = () => {
    const confidential = /소스코드|설계도|영업비밀|인수합병/i.test(input);
    const sensitive = /\d{3}-\d{3,4}-\d{4}|주민등록|계좌|계약|고객|이메일|재무/i.test(input);
    const grade = confidential ? 'C' : sensitive ? 'S' : 'O';
    setResult({ grade, action: matrix[grade][destination], destination });
  };

  const action = actions.find(item => item.id === result?.action);
  const resultDestination = destinations.find(item => item.id === result?.destination);

  return (
    <div>
      <div className="grid gap-5">
        <div>
          <label htmlFor="cso-simulator" className="text-xs font-bold text-slate-700">
            검사할 프롬프트
          </label>
          <textarea
            id="cso-simulator"
            value={input}
            onChange={event => setInput(event.target.value)}
            className="mt-2 h-32 w-full resize-none rounded-[var(--app-radius-lg)] border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8BC6FF] focus:ring-4 focus:ring-[#DEEEFF]"
          />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-700">전송 목적지</span>
          <div className="mt-2 flex items-center gap-2">
            <CustomDropdown
              value={destination}
              onChange={setDestination}
              options={destinations.map(item => ({ value: item.id, label: item.label }))}
              ariaLabel="전송 목적지"
              className="min-w-0 flex-1 [&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:font-semibold"
            />
            <AppButton onClick={runTest} className="h-[var(--app-control-lg)] shrink-0 px-4">
              정책 테스트
            </AppButton>
          </div>
        </div>
      </div>

      {result ? (
        <dl className="mt-6 grid border-y border-blue-100 bg-blue-50/50 text-sm sm:grid-cols-3 sm:divide-x sm:divide-blue-100">
          <div className="px-4 py-4">
            <dt className="text-xs font-medium text-slate-500">판정 등급</dt>
            <dd className="mt-2 flex items-center gap-2 font-semibold text-slate-900">
              <GradeBadge grade={result.grade} />
              {grades.find(item => item.id === result.grade)?.label}
            </dd>
          </div>
          <div className="px-4 py-4">
            <dt className="text-xs font-medium text-slate-500">전송 목적지</dt>
            <dd className="mt-2 font-semibold text-slate-900">{resultDestination?.label}</dd>
          </div>
          <div className="px-4 py-4">
            <dt className="text-xs font-medium text-slate-500">처리 결과</dt>
            <dd className="mt-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${action.className}`}>
                {action.label}
              </span>
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}

export default function ClassificationPage() {
  const [matrix, setMatrix] = useState(initialMatrix);
  const [rules, setRules] = useState(initialRules);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeRuleCount = useMemo(() => rules.filter(rule => rule.enabled).length, [rules]);

  const updateMatrix = (grade, destination, value) => {
    setMatrix(current => ({
      ...current,
      [grade]: { ...current[grade], [destination]: value },
    }));
    setHasPendingChanges(true);
    setSaved(false);
  };

  const toggleRule = id => {
    setRules(current =>
      current.map(rule => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    );
    setHasPendingChanges(true);
    setSaved(false);
  };

  return (
    <div className="garim-external-root min-h-full bg-white text-[#111827]">
      <PageLayout gapClassName="gap-0" topPaddingClassName="pt-6">
        <div className="mx-auto w-full max-w-4xl pb-10 text-slate-900">
          <AdminDetailSection
            title="정보 등급 체계"
            description="조직의 AI 사용에 적용할 C/S/O 등급과 대표 정보 유형을 정의합니다."
            className="!border-t-0 !pt-0 sm:!pt-0"
          >
            <ClassificationTable />
          </AdminDetailSection>

          <AdminDetailSection
            title="AI 사용 정책"
            description="정보 등급과 AI 목적지의 신뢰 수준을 조합해 최종 처리 방식을 설정합니다."
            action={
              <span className="shrink-0 rounded-full bg-[#EAF3FF] px-2.5 py-1 text-xs font-semibold text-[#075DF6]">
                높은 등급 우선
              </span>
            }
          >
            <PolicyMatrix matrix={matrix} onChange={updateMatrix} />
          </AdminDetailSection>

          <AdminDetailSection
            title="분류·탐지 규칙"
            description="프롬프트와 문서에서 보호할 정보를 찾아 적용할 등급을 관리합니다."
            action={
              <span className="shrink-0 text-xs font-semibold text-slate-500">
                {activeRuleCount}/{rules.length}개 사용 중
              </span>
            }
          >
            <RulesTable rules={rules} onToggle={toggleRule} />
          </AdminDetailSection>

          <AdminDetailSection
            title="정책 시뮬레이터"
            description="샘플 프롬프트를 검사해 예상 등급과 목적지별 처리 결과를 확인합니다."
          >
            <Simulator matrix={matrix} />
          </AdminDetailSection>

          <div className="sticky bottom-0 z-10 mt-2 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur">
            <p className="text-sm text-slate-500">변경한 설정은 저장 전까지 적용되지 않습니다.</p>
            {saved ? (
              <span role="status" className="text-sm font-semibold text-emerald-600">
                저장되었습니다.
              </span>
            ) : null}
            <AiStoreActionButton
              size="large"
              className="ml-auto"
              disabled={!hasPendingChanges}
              onClick={() => setIsSaveModalOpen(true)}
            >
              변경사항 저장
            </AiStoreActionButton>
          </div>

          <AiStoreConfirmModal
            open={isSaveModalOpen}
            title="CSO 정책 변경사항을 저장하시겠습니까?"
            confirmLabel="저장"
            cancelLabel="취소"
            confirmVariant="primary"
            onClose={() => setIsSaveModalOpen(false)}
            onConfirm={() => {
              setIsSaveModalOpen(false);
              setHasPendingChanges(false);
              setSaved(true);
            }}
          >
            변경한 분류 및 AI 사용 정책이 저장되며 Control 내부·외부에 공통 적용됩니다.
          </AiStoreConfirmModal>
        </div>
      </PageLayout>
    </div>
  );
}
