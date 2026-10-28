import { Fragment, useMemo, useState } from 'react';
import { Download, UserRound, X } from 'lucide-react';

import CustomDropdown from '../../../../../components/dropdown/CustomDropdown.jsx';
import AppButton from '../../external/components/AppButton.jsx';
import AppSearchField from '../../external/components/AppSearchField.jsx';
import FixedPaginationBar from '../../external/components/FixedPaginationBar.jsx';
import TableListHeader from '../../external/components/TableListHeader.jsx';
import PageLayout from '../../components/PageLayout.jsx';
import {
  DateRangePicker,
  MonitoringActionButton,
  MonitoringIconButtonTooltip,
  MonitoringResetButton,
} from '../../external/components/monitoring/MonitoringListComponents.jsx';
import {
  monitoringTableCellClass,
  monitoringTableClass,
  monitoringTableHeadClass,
  monitoringTableHeaderCellClass,
  monitoringTableHeaderRowClass,
  monitoringTableRowClass,
  monitoringTableSurfaceClass,
} from '../../external/components/monitoring/monitoringTableStyles.js';
import '../../external/garim.css';

import { agentRows, historyTabCounts, llmRows, toolRows } from '../data.js';
import { createDefaultDateRange, isDateValueInRange } from '../dateRangeUtils.js';
const PAGE_SIZE = 9;

const historyUserProfiles = {
  'tester2@school.edu': { name: '박서연', department: '인사팀', position: '매니저' },
  '#2': { name: '박서연', department: '인사팀', position: '매니저' },
  'bjh@aictl.kr': { name: '강지호', department: '보안팀', position: '선임' },
  '#10': { name: '강지호', department: '보안팀', position: '선임' },
};

const llmConversations = {
  3276: {
    prompt: '사내 AI 서비스 도입 현황을 부서별로 요약해줘.',
    answer:
      '현재 개발팀과 보안팀의 활용 비중이 가장 높습니다. 개발팀은 코드 작성과 문서화, 보안팀은 위협 분석과 정책 검토에 주로 활용하고 있습니다.',
  },
  3275: {
    prompt: '이번 달 모델별 사용량과 비용을 비교해줘.',
    answer:
      'GPT-4.1의 요청 수가 가장 많고, Gemini 2.5 Flash는 평균 응답 비용이 가장 낮습니다. 복잡한 분석 요청은 GPT-5에 집중되어 있습니다.',
  },
  3274: {
    prompt: '개인정보가 포함된 문서를 안전하게 요약하는 방법을 알려줘.',
    answer:
      '문서를 전송하기 전에 개인정보를 마스킹하고, 허용된 사내 모델만 사용하세요. 결과물에도 원문 개인정보가 재노출되지 않았는지 확인해야 합니다.',
  },
  3273: {
    prompt: '신규 프로젝트의 AI 활용 가이드 초안을 작성해줘.',
    answer:
      '목적과 적용 범위, 허용 모델, 데이터 처리 원칙, 검토 책임자, 사고 대응 절차를 중심으로 가이드를 구성할 수 있습니다.',
  },
  3272: {
    prompt: '회의록에서 주요 결정 사항과 담당자를 정리해줘.',
    answer:
      '주요 결정 사항을 일정, 담당자, 후속 작업 기준으로 분류했습니다. 각 작업은 완료 기한과 함께 확인하는 것이 좋습니다.',
  },
  3271: {
    prompt: '고객 문의를 유형별로 분류해줘.',
    answer:
      '문의 내용을 계정, 결제, 기능 사용, 오류 신고, 개선 요청으로 분류할 수 있습니다. 긴급도와 담당 부서도 함께 지정하는 것이 좋습니다.',
  },
  3270: {
    prompt: '지난달 내부 AI 사용 현황 보고서를 작성해줘.',
    answer: '응답 생성 중 연결이 종료되어 답변을 완료하지 못했습니다.',
  },
  3269: {
    prompt: '프로젝트별 토큰 사용량을 분석해줘.',
    answer: '제공자 응답 시간이 초과되어 답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  },
  3268: {
    prompt: '신규 모델의 성능 비교표를 만들어줘.',
    answer: '요청한 모델을 사용할 수 없어 답변을 생성하지 못했습니다.',
  },
};

const llmErrorDetails = {
  3270: {
    code: 'connection_terminated',
    category: 'NETWORK_ERROR',
    retry: '1 / 2회 · 재시도 예정',
    timeout: '60초',
    nextAction: 'retry_request',
    message: '요청 처리 중 연결이 종료되었습니다.',
  },
  3269: {
    code: 'provider_timeout',
    category: 'PROVIDER_ERROR',
    retry: '2 / 2회 · 최종 시도',
    timeout: '60초',
    nextAction: 'show_failure_message',
    message: 'Provider request timed out.',
  },
  3268: {
    code: 'insufficient_credit_balance',
    category: 'PROVIDER_ERROR',
    retry: '2 / 2회 · 최종 시도',
    timeout: '60초',
    nextAction: 'show_failure_message',
    message: 'Insufficient credit balance.',
  },
};

const llmProjects = {
  3276: '정책 자동화',
  3275: '비용 최적화',
  3274: '문서 보안',
  3273: 'AI 운영 가이드',
  3272: '회의록 자동화',
  3271: '고객 문의 분류',
  3270: '사용 현황 리포트',
  3269: '비용 분석',
  3268: '모델 평가',
};

const tableConfig = {
  llm: {
    title: '요청 목록',
    columns: [
      'No.',
      '사용자',
      '부서',
      '직급',
      '프로젝트',
      '모델 / 제공자',
      '상태',
      '입/출력 토큰',
      '응답 시간',
      '요청 시각',
    ],
    widths: ['5%', '9%', '8%', '7%', '10%', '19%', '7%', '10%', '8%', '13%'],
    rows: llmRows,
  },
  tool: {
    title: '기록 목록',
    columns: [
      'No.',
      '도구 / 제공자',
      '사용자',
      '부서',
      '직급',
      '위치',
      '이벤트',
      '상태',
      '쿼터 / 비용',
      '승인',
      '생성 시각',
    ],
    widths: ['5%', '12%', '9%', '8%', '7%', '8%', '11%', '7%', '9%', '7%', '13%'],
    rows: toolRows,
  },
};

function getHistoryUserProfile(tab, row) {
  const identifiers =
    tab === 'tool' ? [row[3], row[4]] : tab === 'llm' ? [row[1], row[2]] : [row[1]];

  return (
    identifiers.map(identifier => historyUserProfiles[identifier]).find(Boolean) ?? {
      name: identifiers[0],
      department: '-',
      position: '-',
    }
  );
}

function formatHistoryDateTime24(value) {
  const match = String(value ?? '').match(
    /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})$/
  );
  if (!match) return value;

  const [, year, month, day, period, rawHour, minute] = match;
  const hour = (Number(rawHour) % 12) + (period === '오후' ? 12 : 0);
  const pad = number => String(number).padStart(2, '0');

  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${minute}`;
}

function getHistoryDisplayRow(tab, row) {
  const user = getHistoryUserProfile(tab, row);

  if (tab === 'llm') {
    return [
      row[0],
      user.name,
      user.department,
      user.position,
      llmProjects[row[0]] ?? '-',
      `${row[3]} / ${row[4]}`,
      row[5],
      row[6],
      row[7],
      formatHistoryDateTime24(row[8]),
    ];
  }

  return [
    row[0],
    `${row[1]} / ${row[2]}`,
    user.name,
    user.department,
    user.position,
    row[5],
    row[6],
    row[7],
    `${row[8]} / ${row[9]}`,
    row[10],
    formatHistoryDateTime24(row[12]),
  ];
}

function getHistoryDetailEntries(tab, row) {
  const user = getHistoryUserProfile(tab, row);

  if (tab === 'llm') {
    return [
      ['No.', row[0]],
      ['사용자', user.name],
      ['부서', user.department],
      ['직급', user.position],
      ['프로젝트', llmProjects[row[0]] ?? '-'],
      ['모델 / 제공자', `${row[3]} / ${row[4]}`],
      ['상태', row[5]],
      ['입/출력 토큰', row[6]],
      ['응답 시간', row[7]],
      ['요청 시각', formatHistoryDateTime24(row[8])],
      ['오류', row[9]],
    ];
  }

  return [
    ['No.', row[0]],
    ['도구 / 제공자', `${row[1]} / ${row[2]}`],
    ['사용자', user.name],
    ['부서', user.department],
    ['직급', user.position],
    ['위치', row[5]],
    ['이벤트', row[6]],
    ['상태', row[7]],
    ['쿼터 / 비용', `${row[8]} / ${row[9]}`],
    ['승인', row[10]],
    ['오류', row[11]],
    ['생성 시각', formatHistoryDateTime24(row[12])],
  ];
}

function filterHistoryRows(tab, query, status, dateRange) {
  const queryTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const dateIndex = { llm: 8, tool: 12 }[tab];

  return tableConfig[tab].rows.filter(row => {
    const user = getHistoryUserProfile(tab, row);
    const searchableText = `${row.join(' ')} ${user.name} ${user.department} ${user.position} ${
      tab === 'llm' ? (llmProjects[row[0]] ?? '') : ''
    }`.toLowerCase();
    const matchesQuery = queryTerms.every(term => searchableText.includes(term));
    const matchesStatus = status === '전체 상태' || row.includes(status);
    const matchesDate = isDateValueInRange(row[dateIndex], dateRange.startDate, dateRange.endDate);
    return matchesQuery && matchesStatus && matchesDate;
  });
}

function getCsvContent(tab, rows) {
  const csvConfig = {
    llm: {
      columns: tableConfig.llm.columns,
      mapRow: row => getHistoryDisplayRow('llm', row),
    },
    tool: {
      columns: tableConfig.tool.columns,
      mapRow: row => getHistoryDisplayRow('tool', row),
    },
  }[tab];
  const escapeValue = value => `"${String(value ?? '').replaceAll('"', '""')}"`;

  return [csvConfig.columns, ...rows.map(csvConfig.mapRow)]
    .map(row => row.map(escapeValue).join(','))
    .join('\r\n');
}

function StatusBadge({ value }) {
  const tone = ['성공', '승인'].includes(value)
    ? 'bg-emerald-50 text-emerald-600'
    : ['실패', '거절'].includes(value)
      ? 'bg-rose-50 text-rose-500'
      : 'bg-amber-50 text-amber-600';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>
      {value}
    </span>
  );
}

function StackedValue({ primary, secondary }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-slate-900">{primary}</p>
      <p className="mt-1 truncate text-xs text-slate-400">{secondary}</p>
    </div>
  );
}

function LlmErrorLog({ row }) {
  const error = llmErrorDetails[row[0]] ?? {
    code: row[9] === '-' ? 'unknown_error' : row[9],
    category: 'REQUEST_ERROR',
    retry: '- / 2회',
    timeout: '60초',
    nextAction: 'show_failure_message',
    message: row[9] === '-' ? '요청 처리 중 알 수 없는 오류가 발생했습니다.' : row[9],
  };
  const entries = [
    ['오류 코드', error.code],
    ['오류 분류', error.category],
    ['재시도', error.retry],
    ['타임아웃', error.timeout],
    ['다음 조치', error.nextAction],
    ['오류 메시지', error.message],
  ];

  return (
    <div className="mt-4 overflow-hidden rounded-[10px] border border-[#E2E8F0] bg-white">
      <header className="border-b border-[#E2E8F0] px-4 py-4">
        <h4 className="text-base font-bold text-[#526078]">요청 #{row[0]} 오류 확인</h4>
      </header>
      <dl className="grid gap-x-6 gap-y-3 px-4 py-5 text-[13px] sm:grid-cols-[7rem_minmax(0,1fr)]">
        {entries.map(([label, value]) => (
          <Fragment key={label}>
            <dt className="font-semibold text-[#64728C]">{label}</dt>
            <dd
              className={`min-w-0 break-words ${
                label === '오류 메시지' ? 'font-medium text-rose-500' : 'text-[#303746]'
              }`}
            >
              {value}
            </dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}

function AgentDetailSection({ title, count, status, children }) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[#E2E8F0] bg-white">
      <header className="flex items-center gap-2 border-b border-[#E2E8F0] px-4 py-3.5">
        <h5 className="text-sm font-bold text-[#303746]">{title}</h5>
        {status ? (
          <StatusBadge value={status} />
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
            {count}건
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

function AgentExecutionDetail({ llmRow }) {
  const [activeDetailTab, setActiveDetailTab] = useState('agent');
  const agent = agentRows.find(item => String(item[3]).includes(`LLM#${llmRow[0]}`));
  if (!agent) return null;

  const user = getHistoryUserProfile('llm', llmRow);
  const agentNumber = Number(String(agent[0]).replace('#', ''));
  const invocationId = Number.isFinite(agentNumber) ? agentNumber - 429 : '-';
  const approvalId = Number.isFinite(agentNumber) ? agentNumber - 886 : '-';
  const isFailed = agent[4] === '실패';
  const toolStatus = isFailed ? '건너뜀' : '성공';
  const toolError = isFailed ? agent[5] : '-';

  return (
    <div className="mt-5">
      <h4 className="mb-4 text-base font-bold text-[#526078]">실행 {agent[0]} 상세</h4>
      <div
        role="tablist"
        aria-label={`${agent[0]} 실행 상세 유형`}
        className="mb-4 flex border-b border-[#E2E8F0]"
      >
        {[
          ['agent', '에이전트 호출'],
          ['tool', '도구 호출'],
        ].map(([tabId, label]) => (
          <button
            key={tabId}
            type="button"
            role="tab"
            aria-selected={activeDetailTab === tabId}
            onClick={() => setActiveDetailTab(tabId)}
            className={`relative h-10 px-4 text-sm font-bold transition-colors ${
              activeDetailTab === tabId
                ? 'text-[#075DF6] after:absolute after:right-0 after:bottom-[-1px] after:left-0 after:h-0.5 after:bg-[#075DF6]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4">
        <div className={activeDetailTab === 'agent' ? 'contents' : 'hidden'}>
          <AgentDetailSection title="실행 정보" status={agent[4]}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] table-fixed text-left text-[13px]">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="w-[16%] px-4 py-3">항목</th>
                    <th className="w-[34%] px-4 py-3">값</th>
                    <th className="w-[16%] px-4 py-3">항목</th>
                    <th className="w-[34%] px-4 py-3">값</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">사용자</th>
                    <td className="px-4 py-3">{user.name}</td>
                    <th className="px-4 py-3 font-medium text-slate-500">프로젝트</th>
                    <td className="px-4 py-3">{llmProjects[llmRow[0]] ?? '-'}</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">위치</th>
                    <td className="px-4 py-3">{agent[3]}</td>
                    <th className="px-4 py-3 font-medium text-slate-500">오류</th>
                    <td className={isFailed ? 'px-4 py-3 text-rose-500' : 'px-4 py-3'}>
                      {agent[5]}
                    </td>
                  </tr>
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">도구 호출</th>
                    <td className="px-4 py-3">1건</td>
                    <th className="px-4 py-3 font-medium text-slate-500">승인</th>
                    <td className="px-4 py-3">1건</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AgentDetailSection>
        </div>

        <div className={activeDetailTab === 'agent' ? 'contents' : 'hidden'}>
          <AgentDetailSection title="도구 호출 / 승인" count={2}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] table-fixed text-left text-[13px]">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    {['구분', 'ID', '도구', '상태', '오류/사유'].map(label => (
                      <th key={label} className="px-4 py-3">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="px-4 py-3">호출</td>
                    <td className="px-4 py-3">{invocationId}</td>
                    <td className="px-4 py-3">web_search</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={toolStatus} />
                    </td>
                    <td className="px-4 py-3">{toolError}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">승인</td>
                    <td className="px-4 py-3">{approvalId}</td>
                    <td className="px-4 py-3">web_search</td>
                    <td className="px-4 py-3">
                      <StatusBadge value="승인" />
                    </td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AgentDetailSection>

          <AgentDetailSection title="실패 단계" count={isFailed ? 1 : 0}>
            {isFailed ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] table-fixed text-left text-[13px]">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                    <tr>
                      {['단계', '상태', '도구 / 승인', '오류', '소요 시간'].map(label => (
                        <th key={label} className="px-4 py-3">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-700">
                      <td className="px-4 py-3 font-semibold">web_search #1</td>
                      <td className="px-4 py-3">
                        <StatusBadge value={toolStatus} />
                      </td>
                      <td className="px-4 py-3">Invocation #{invocationId} / approval APPROVED</td>
                      <td className="px-4 py-3 text-rose-500">{toolError}</td>
                      <td className="px-4 py-3">{agent[6]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                조회된 실패 단계가 없습니다.
              </p>
            )}
          </AgentDetailSection>
        </div>

        <div className={activeDetailTab === 'agent' ? 'contents' : 'hidden'}>
          <AgentDetailSection title="전체 단계" count={1}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] table-fixed text-left text-[13px]">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    {['단계', '상태', '도구 / 승인', '오류', '소요 시간'].map(label => (
                      <th key={label} className="px-4 py-3">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-slate-700">
                    <td className="px-4 py-3 font-semibold">web_search #1</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={toolStatus} />
                    </td>
                    <td className="px-4 py-3">
                      Invocation #{invocationId} / LOCAL / approval APPROVED
                    </td>
                    <td className="px-4 py-3">{toolError}</td>
                    <td className="px-4 py-3">{agent[6]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AgentDetailSection>
        </div>

        <div className={activeDetailTab === 'tool' ? 'contents' : 'hidden'}>
          <AgentDetailSection title="도구 이벤트 상세" count={2}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] table-fixed text-left text-[13px]">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    {['이벤트', '도구 / 제공자', '쿼터 / 비용', '승인', '오류 / 사유'].map(
                      label => (
                        <th key={label} className="px-4 py-3">
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-semibold">
                      {isFailed ? 'INVOCATION_SKIPPED' : 'INVOCATION_SUCCEEDED'}
                    </td>
                    <td className="px-4 py-3">web_search / LOCAL · {llmRow[4]}</td>
                    <td className="px-4 py-3">
                      {isFailed ? '0 / user_daily_tool - / -' : '1 / user_daily_tool 1 / 100'}
                    </td>
                    <td className="px-4 py-3">-</td>
                    <td className={isFailed ? 'px-4 py-3 text-rose-500' : 'px-4 py-3'}>
                      {toolError}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">APPROVAL_DECIDED</td>
                    <td className="px-4 py-3">web_search / LOCAL · {llmRow[4]}</td>
                    <td className="px-4 py-3">0 / user_daily_tool - / -</td>
                    <td className="px-4 py-3">
                      <StatusBadge value="승인" />
                    </td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AgentDetailSection>
        </div>
      </div>
    </div>
  );
}

function LlmConversationDetail({ row }) {
  const user = getHistoryUserProfile('llm', row);
  const conversation = llmConversations[row[0]] ?? {
    prompt: '요청 프롬프트 정보가 없습니다.',
    answer: row[9] === '-' ? '응답 정보가 없습니다.' : `응답 실패: ${row[9]}`,
  };
  const isFailed = row[5] === '실패';

  return (
    <section className="border-t border-[#E7EBF5] bg-white px-4 py-4">
      <h3 className="mb-4 text-sm font-bold text-[#23304A]">입력 프롬프트 및 답변</h3>
      <div className="max-h-[min(44vh,22rem)] overflow-y-auto rounded-[10px] border border-[#E2E8F0] bg-[#F8FBFF] px-4 py-4">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex min-w-0 items-start justify-end gap-3">
            <div className="flex min-w-0 max-w-[min(44rem,86%)] flex-col items-end gap-1">
              <span className="px-1 text-[11px] font-bold text-[#64728C]">{user.name}</span>
              <div className="min-w-0 rounded-[14px] rounded-tr-[4px] bg-[#075DF6] px-4 py-3 text-[clamp(0.74rem,0.87vw,0.78rem)] leading-[1.7] whitespace-pre-wrap text-white shadow-[0_8px_20px_rgba(15,23,42,0.06)] break-words [overflow-wrap:anywhere]">
                {conversation.prompt}
              </div>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#075DF6] text-white">
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3">
            <img
              src="/simbol.png"
              alt=""
              className="h-8 w-8 shrink-0 object-contain"
              aria-hidden="true"
            />
            <div className="flex min-w-0 max-w-[min(44rem,86%)] flex-col items-start gap-1">
              <span className="px-1 text-[11px] font-bold text-[#64728C]">
                {row[3]} · {row[4]}
              </span>
              <div
                className={`min-w-0 rounded-[14px] rounded-tl-[4px] border px-4 py-3 text-[clamp(0.74rem,0.87vw,0.78rem)] leading-[1.7] whitespace-pre-wrap shadow-[0_8px_20px_rgba(15,23,42,0.06)] break-words [overflow-wrap:anywhere] ${
                  isFailed
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-[#D6E9FF] bg-white text-[#2F3A56]'
                }`}
              >
                {conversation.answer}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isFailed ? <LlmErrorLog row={row} /> : null}
      <AgentExecutionDetail llmRow={row} />
    </section>
  );
}

function renderCells(tab, row) {
  const user = getHistoryUserProfile(tab, row);

  if (tab === 'llm') {
    const [id, , , model, provider, status, tokens, duration, createdAt] = row;
    return [
      id,
      <span key="user" className="font-semibold text-slate-900">
        {user.name}
      </span>,
      <span key="department" className="text-slate-600">
        {user.department}
      </span>,
      <span key="position" className="text-slate-600">
        {user.position}
      </span>,
      <span key="project" className="font-medium text-slate-700">
        {llmProjects[row[0]] ?? '-'}
      </span>,
      <StackedValue key="model" primary={model} secondary={provider} />,
      <StatusBadge key="status" value={status} />,
      tokens,
      duration,
      formatHistoryDateTime24(createdAt),
    ];
  }

  const [id, tool, provider, , , location, event, status, query, quota, approval, , createdAt] =
    row;
  return [
    id,
    <StackedValue key="tool" primary={tool} secondary={provider} />,
    <span key="user" className="font-semibold text-slate-900">
      {user.name}
    </span>,
    <span key="department" className="text-slate-600">
      {user.department}
    </span>,
    <span key="position" className="text-slate-600">
      {user.position}
    </span>,
    <span key="location" className="text-slate-400">
      {location}
    </span>,
    <span key="event" className="font-semibold text-slate-900">
      {event}
    </span>,
    <StatusBadge key="status" value={status} />,
    <StackedValue key="quota" primary={query} secondary={quota} />,
    approval,
    formatHistoryDateTime24(createdAt),
  ];
}

function LogTable({
  tab,
  query,
  status,
  dateRange,
  selectedRowIds,
  expandedRowId,
  onToggleRowSelection,
  onToggleAllRowsSelection,
  onDetail,
}) {
  const config = tableConfig[tab];
  const filteredRows = useMemo(
    () => filterHistoryRows(tab, query, status, dateRange),
    [dateRange, query, status, tab]
  );
  const allRowsSelected =
    filteredRows.length > 0 && filteredRows.every(row => selectedRowIds.includes(row[0]));
  return (
    <section className={monitoringTableSurfaceClass}>
      <TableListHeader title={config.title} count={historyTabCounts[tab]} />
      <div className="overflow-x-auto">
        <table className={`${monitoringTableClass} min-w-[68rem]`}>
          <colgroup>
            <col style={{ width: '4%' }} />
            {config.widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead className={monitoringTableHeadClass}>
            <tr
              className={`${monitoringTableHeaderRowClass} !text-[clamp(0.74rem,0.84vw,0.84rem)]`}
            >
              <th className={`${monitoringTableHeaderCellClass} px-0 text-center align-middle`}>
                <input
                  type="checkbox"
                  checked={allRowsSelected}
                  onChange={() => onToggleAllRowsSelection(filteredRows.map(row => row[0]))}
                  aria-label="현재 목록 전체 선택"
                  className="mx-auto block h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] cursor-pointer rounded border-slate-300 accent-[#075DF6]"
                />
              </th>
              {config.columns.map(column => (
                <th key={column} className={`${monitoringTableHeaderCellClass} whitespace-nowrap`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[clamp(0.74rem,0.84vw,0.84rem)] leading-[1.4] text-[#344054]">
            {filteredRows.length ? (
              filteredRows.map((row, rowIndex) => {
                const isExpanded = tab === 'llm' && expandedRowId === row[0];

                return (
                  <Fragment key={`${tab}-${row[0]}`}>
                    <tr
                      className={monitoringTableRowClass({
                        selected: isExpanded,
                        striped: rowIndex % 2 === 1,
                        interactive: true,
                      })}
                      onClick={() => onDetail(row)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onDetail(row);
                        }
                      }}
                      aria-expanded={tab === 'llm' ? isExpanded : undefined}
                      tabIndex={0}
                    >
                      <td
                        className={monitoringTableCellClass(
                          rowIndex,
                          'px-0 text-center align-middle'
                        )}
                        onClick={event => event.stopPropagation()}
                        onKeyDown={event => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRowIds.includes(row[0])}
                          onChange={() => onToggleRowSelection(row[0])}
                          aria-label={`${row[0]} 행 선택`}
                          className="mx-auto block h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] cursor-pointer rounded border-slate-300 accent-[#075DF6]"
                        />
                      </td>
                      {renderCells(tab, row).map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={monitoringTableCellClass(rowIndex, 'align-middle')}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                    {isExpanded ? (
                      <tr>
                        <td colSpan={config.columns.length + 1} className="p-0">
                          <LlmConversationDetail row={row} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={config.columns.length + 1}
                  className="h-56 text-center text-sm text-slate-400"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DetailModal({ tab, row, onClose }) {
  if (!row) return null;
  const entries = getHistoryDetailEntries(tab, row);

  return (
    <div className="app-modal-stage z-[100]">
      <button
        type="button"
        aria-label="상세 닫기"
        className="app-modal-backdrop"
        onClick={onClose}
      />
      <div role="dialog" aria-modal="true" className="app-modal-panel app-modal-panel--lg">
        <div className="app-modal-header flex items-center justify-between border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">로그 상세</h3>
            <p className="mt-1 text-sm text-slate-400">선택한 기록의 처리 정보를 확인합니다.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="app-modal-body grid gap-3 sm:grid-cols-2">
          {entries.map(([label, value], index) => (
            <div
              key={`${label}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-semibold text-slate-400">{label}</p>
              <p className="mt-2 break-words text-sm font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [defaultDateRange] = useState(() => createDefaultDateRange());
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const activeTab = 'llm';
  const [status, setStatus] = useState('전체 상태');
  const [searchInput, setSearchInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailRow, setDetailRow] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const filteredRows = useMemo(
    () => filterHistoryRows(activeTab, submittedQuery, status, dateRange),
    [activeTab, dateRange, status, submittedQuery]
  );
  const downloadRows = useMemo(
    () => filteredRows.filter(row => selectedRowIds.includes(row[0])),
    [filteredRows, selectedRowIds]
  );

  const handleSearch = () => {
    setSubmittedQuery(searchInput.trim());
    setCurrentPage(1);
    setDetailRow(null);
    setSelectedRowIds([]);
  };
  const handleReset = () => {
    setDateRange(defaultDateRange);
    setStatus('전체 상태');
    setSearchInput('');
    setSubmittedQuery('');
    setCurrentPage(1);
    setDetailRow(null);
    setSelectedRowIds([]);
  };
  const handleToggleRowSelection = rowId => {
    setSelectedRowIds(current =>
      current.includes(rowId) ? current.filter(id => id !== rowId) : [...current, rowId]
    );
  };
  const handleToggleAllRowsSelection = rowIds => {
    setSelectedRowIds(current => {
      const allSelected = rowIds.length > 0 && rowIds.every(id => current.includes(id));
      if (allSelected) return current.filter(id => !rowIds.includes(id));

      return [...new Set([...current, ...rowIds])];
    });
  };
  const handleOpenDetail = row => {
    setDetailRow(current => (activeTab === 'llm' && current?.[0] === row[0] ? null : row));
  };
  const handleDownloadCsv = () => {
    if (!downloadRows.length) return;

    const csv = getCsvContent(activeTab, downloadRows);
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `ai-request-history-${activeTab}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  };
  const filterGridClass = 'xl:grid-cols-[10.25rem_9rem_minmax(0,1fr)_5.25rem_3rem_3rem]';

  return (
    <div className="garim-external-root min-h-full bg-white text-[#111827]">
      <PageLayout gapClassName="gap-[var(--app-gap-md)]" bottomPaddingClassName="pb-0">
        <section
          className={`grid items-end gap-[var(--app-gap-sm)] md:grid-cols-2 ${filterGridClass}`}
        >
          <DateRangePicker
            label="조회 기간"
            labelClassName="mb-1.5 block text-xs font-bold text-slate-700"
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={range => {
              setDateRange(range);
              setCurrentPage(1);
              setDetailRow(null);
              setSelectedRowIds([]);
            }}
            widthClass="w-full min-w-0"
          />
          <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">상태</span>
            <CustomDropdown
              value={status}
              onChange={value => {
                setStatus(value);
                setCurrentPage(1);
                setDetailRow(null);
                setSelectedRowIds([]);
              }}
              options={
                activeTab === 'tool'
                  ? ['전체 상태', '성공', '승인', '거절', '건너뜀', 'ALLOWED']
                  : ['전체 상태', '성공', '실패']
              }
              ariaLabel="상태 선택"
              className="[&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:text-[clamp(0.82rem,0.95vw,0.9rem)] [&>button]:font-semibold"
            />
          </label>
          <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">통합 검색</span>
            <AppSearchField
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              placeholder="사용자, 모델, 프로젝트, 도구 또는 ID 검색..."
              className="w-full"
            />
          </label>
          <AppButton onClick={handleSearch} className="h-[var(--app-control-lg)] w-full">
            검색
          </AppButton>
          <MonitoringIconButtonTooltip label="초기화">
            <MonitoringResetButton
              onClick={handleReset}
              widthClass="w-[var(--app-control-lg)] min-w-[var(--app-control-lg)]"
              aria-label="초기화"
            />
          </MonitoringIconButtonTooltip>
          <MonitoringIconButtonTooltip
            label={downloadRows.length ? 'CSV 다운로드' : '항목을 선택하세요'}
          >
            <MonitoringActionButton
              variant="csvDownload"
              heightClass="h-[var(--app-control-lg)]"
              widthClass="w-[var(--app-control-lg)] min-w-[var(--app-control-lg)] px-0"
              onClick={handleDownloadCsv}
              disabled={!downloadRows.length}
              aria-label="CSV 다운로드"
            >
              <Download
                className="h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] shrink-0"
                strokeWidth={2.8}
                aria-hidden="true"
              />
            </MonitoringActionButton>
          </MonitoringIconButtonTooltip>
        </section>
        <LogTable
          tab={activeTab}
          query={submittedQuery}
          status={status}
          dateRange={dateRange}
          selectedRowIds={selectedRowIds}
          expandedRowId={activeTab === 'llm' ? detailRow?.[0] : null}
          onToggleRowSelection={handleToggleRowSelection}
          onToggleAllRowsSelection={handleToggleAllRowsSelection}
          onDetail={handleOpenDetail}
        />
      </PageLayout>
      <FixedPaginationBar
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(historyTabCounts.llm / PAGE_SIZE))}
        onPageChange={setCurrentPage}
      />
      {activeTab !== 'llm' ? (
        <DetailModal tab={activeTab} row={detailRow} onClose={() => setDetailRow(null)} />
      ) : null}
    </div>
  );
}
