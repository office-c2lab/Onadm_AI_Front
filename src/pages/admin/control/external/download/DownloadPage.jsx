import {
  CircleCheck,
  Download,
  FileArchive,
  Folder,
  LogOut,
  Mail,
  MousePointerClick,
  Phone,
  Rocket,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import AppButton from '../components/AppButton.jsx';
import downloadBannerImage from '../../../../../assets/images/downloadbanner.png';
import packIcon from '../../../../../assets/images/pac.png';
import { useTemplateSettingsQuery } from '../queries/companySettingsQueries.js';
import {
  useMacosSetupDownloadMutation,
  useWindowsSetupDownloadMutation,
  useWindowsSetupMsiDownloadMutation,
} from '../queries/downloadQueries.js';
import { normalizeTemplateSettings } from '../utils/companyTemplate.js';

const installSteps = [
  [Download, '압축 파일 다운로드', 'ondam-ai-windows-setup.zip\n파일을 다운로드합니다.'],
  [FileArchive, '압축 해제', '다운로드한 zip 파일의\n압축을 풉니다.'],
  [LogOut, 'AI 서비스 종료', 'AI 서비스 웹페이지나 앱을\n완전히 종료합니다.'],
  [
    MousePointerClick,
    '설치 파일 실행',
    '압축을 푼 폴더 안에서\nondam-ai-start.cmd 파일을 실행합니다.',
  ],
  [ShieldCheck, '보안 확인 허용', 'Windows 보안 확인 창이나\n인증서 설치 확인 창을 허용합니다.'],
  [Rocket, '다시 접속', '브라우저 또는 앱을 다시 실행하고\nAI 서비스에 접속합니다.'],
];

const deleteSteps = [
  [LogOut, 'AI 서비스 종료', 'AI 서비스 웹페이지나 앱을\n완전히 종료합니다.'],
  [Folder, '설치 폴더 열기', '압축을 풀었던\nondam-ai-windows-setup 폴더를 엽니다.'],
  [Trash2, '삭제 파일 실행', 'ondam-ai-delete.cmd\n파일을 실행합니다.'],
  [ShieldCheck, '보안 확인 허용', 'Windows 보안 확인 창 내용을\n확인한 뒤 허용합니다.'],
  [Rocket, '다시 실행', '브라우저 또는 앱을\n다시 실행합니다.'],
];

const cautionItems = [
  ['파일 구성 유지', '파일 이름을 바꾸거나\n일부 파일만 따로 옮기지 마세요.'],
  [
    '같은 폴더에서 실행',
    'ondam-ai-start.cmd, enable.ps1,\nondam-ai-delete.cmd, disable.ps1은 같은 폴더에 있어야 합니다.',
  ],
  [
    'AI 서비스 완전 재실행',
    '설치 또는 삭제 후에는 AI 서비스 탭이나 앱을\n완전히 껐다가 다시 켜야 합니다.',
  ],
  [
    '인증서 확인 창',
    '인증서 설치 확인 창이 뜨는 것은 정상입니다.\n보안 정책 검사를 위해 필요한 절차입니다.',
  ],
];

const verifyItems = [
  ['AI 서비스 접속 확인', '서비스 접속이 정상적으로 가능한지 확인해 주세요.'],
  ['정책 반영 확인', '정책 또는 설정이 정상 반영되었는지 확인해 주세요.'],
  ['오류 메시지 확인', '오류 메시지가 표시되지 않는지 확인해 주세요.'],
  ['관리자 문의', '문제가 지속되면 관리자에게 문의해 주세요.'],
];

function Section({ children, className = '', ...props }) {
  return (
    <section
      className={`scroll-mt-28 rounded-[18px] border border-[#E5EAF3] bg-white p-8 shadow-[0_16px_42px_rgba(15,23,42,0.07)] ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="max-w-[52rem]">
      <h2 className="text-[1.75rem] font-black tracking-[-0.03em] text-slate-900">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-base font-semibold leading-7 text-[#526078]">
        {description}
      </p>
    </div>
  );
}

function CompactGuideCard({ icon, number, title, description }) {
  const Icon = icon;

  return (
    <div className="relative flex min-h-[13rem] flex-col items-center justify-center rounded-[14px] border border-[#E3E8F2] bg-white px-6 py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
      <span className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#075DF6] text-sm font-black text-white shadow-[0_8px_18px_rgba(7,93,246,0.22)]">
        {number}
      </span>
      <Icon className="h-12 w-12 text-[#075DF6]" />
      <div className="mt-5 min-h-[5rem]">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-[#526078]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  const { data: templateSettings } = useTemplateSettingsQuery();
  const template = normalizeTemplateSettings(templateSettings);
  const { mutate: requestWindowsSetupDownload, isPending: isDownloadPending } =
    useWindowsSetupDownloadMutation();
  const { mutate: requestWindowsSetupMsiDownload, isPending: isMsiDownloadPending } =
    useWindowsSetupMsiDownloadMutation();
  const { mutate: requestMacosSetupDownload, isPending: isMacosDownloadPending } =
    useMacosSetupDownloadMutation();

  const handleDownloadClick = () => {
    requestWindowsSetupDownload();
  };

  const handleMsiDownloadClick = () => {
    requestWindowsSetupMsiDownload();
  };

  const handleMacosDownloadClick = () => {
    requestMacosSetupDownload();
  };

  const handleFileDownloadSectionClick = () => {
    document.getElementById('pack-download')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#F3F6FA] text-[#111827]">
      <header className="sticky top-0 z-30 h-[4.5rem] bg-black">
        <div className="mx-auto flex h-full max-w-[min(100%,80rem)] items-center justify-between px-8">
          <div className="flex items-center">
            <img src={template.logoSrc} alt="ONDAM AI" className="h-8 w-auto" />
          </div>
          <nav className="hidden items-center gap-10 text-sm font-bold text-white md:flex">
            <a href="#apply" className="transition hover:text-[#B8DEFF]">
              설치 안내
            </a>
            <a href="#pack-download" className="transition hover:text-[#B8DEFF]">
              다운로드
            </a>
            <a href="#delete" className="transition hover:text-[#B8DEFF]">
              삭제 안내
            </a>
            <a href="#contact" className="transition hover:text-[#B8DEFF]">
              문의하기
            </a>
          </nav>
        </div>
      </header>

      <section
        className="relative flex min-h-[25rem] items-center justify-center overflow-hidden bg-[#080B28] bg-cover px-6 text-white"
        style={{
          backgroundImage: `url(${downloadBannerImage})`,
          backgroundPosition: 'center bottom',
        }}
      >
        <div className="relative z-10 mx-auto max-w-[min(100%,51.25rem)] text-center">
          <h1 className="text-[clamp(2.4rem,5vw,4.2rem)] font-bold leading-tight tracking-[-0.02em]">
            운영지원
          </h1>
          <p className="mx-auto mt-6 max-w-[42rem] text-xl font-semibold leading-8 ">
            ONDAM AI 적용에 필요한 압축 파일을 다운로드하고
            <br />
            실행 및 적용 방법을 확인해 주세요.
          </p>
          <div className="mt-9 flex flex-wrap justify-center">
            <AppButton
              onClick={handleFileDownloadSectionClick}
              className="h-16 px-8 text-lg font-black"
            >
              <Download className="h-5 w-5" />
              실행 파일 다운로드
            </AppButton>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[min(100%,80rem)] flex-col gap-16 px-8 py-12">
        <section id="apply" className="scroll-mt-28">
          <SectionHeader
            title="설치 안내"
            description={
              '다운로드한 압축 파일을 실행한 뒤 안내에 따라 ONDAM AI 설정을 적용해 주세요.\n설치 후 관련 대상 AI 서비스 접속은 회사 보안 프록시를 통해 연결되며,\n 정책에 따라 일부 요청은 허용·차단·기록될 수 있습니다.'
            }
          />

          <div className="mt-6 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {installSteps.map(([Icon, title, description], index) => (
              <CompactGuideCard
                key={title}
                icon={Icon}
                number={index + 1}
                title={title}
                description={description}
              />
            ))}
          </div>
        </section>

        <Section id="pack-download">
          <SectionHeader
            title="파일 다운로드"
            description={
              <>
                ONDAM AI 적용에 필요한 최신 파일을 다운로드하세요.
                <br />
                관리자가 안내한 환경에 맞는 파일을 선택해 실행해 주세요.
              </>
            }
          />

          <div className="mt-8 rounded-xl border border-[#DDE4EF] bg-[#FAFBFF] p-6">
            <div className="grid gap-6 lg:grid-cols-[10rem_1fr_auto] lg:items-center">
              <img src={packIcon} alt="" className="h-40 w-40 object-contain" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="break-all text-[clamp(1.35rem,3vw,2rem)] font-black tracking-[-0.03em] text-slate-900">
                    Windows 설정 패키지
                  </h3>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm font-bold text-[#64728C]">
                  <span>버전 v0.1.0</span>
                  <span>업데이트 2026.07.08</span>
                  <span>파일 형식 .zip</span>
                  <span>크기 4KB</span>
                </div>
                <p className="mt-6 text-base font-semibold text-[#526078]">
                  ONDAM AI 정책 및 환경 설정 적용을 위한 압축 파일입니다.
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-4 lg:min-w-[14rem]">
                <AppButton
                  onClick={handleDownloadClick}
                  disabled={isDownloadPending}
                  className="h-16 px-8 text-lg font-black"
                >
                  <Download className="h-5 w-5" />
                  {isDownloadPending ? '다운로드 준비 중' : '압축 파일 다운로드'}
                </AppButton>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#DDE4EF] bg-[#FAFBFF] p-6">
            <div className="grid gap-6 lg:grid-cols-[10rem_1fr_auto] lg:items-center">
              <img src={packIcon} alt="" className="h-40 w-40 object-contain" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="break-all text-[clamp(1.35rem,3vw,2rem)] font-black tracking-[-0.03em] text-slate-900">
                    Windows 설치 프로그램
                  </h3>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm font-bold text-[#64728C]">
                  <span>버전 v0.1.0</span>
                  <span>업데이트 2026.07.21</span>
                  <span>파일 형식 .msi</span>
                  <span>크기 340KB</span>
                </div>
                <p className="mt-6 text-base font-semibold text-[#526078]">
                  ONDAM AI를 설치할 수 있는 Windows 설치 파일입니다.
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-4 lg:min-w-[14rem]">
                <AppButton
                  onClick={handleMsiDownloadClick}
                  disabled={isMsiDownloadPending}
                  className="h-16 px-8 text-lg font-black"
                >
                  <Download className="h-5 w-5" />
                  {isMsiDownloadPending ? '다운로드 준비 중' : 'MSI 파일 다운로드'}
                </AppButton>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#DDE4EF] bg-[#FAFBFF] p-6">
            <div className="grid gap-6 lg:grid-cols-[10rem_1fr_auto] lg:items-center">
              <img src={packIcon} alt="" className="h-40 w-40 object-contain" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="break-all text-[clamp(1.35rem,3vw,2rem)] font-black tracking-[-0.03em] text-slate-900">
                    macOS 설정 패키지
                  </h3>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm font-bold text-[#64728C]">
                  <span>버전 v0.1.0</span>
                  <span>업데이트 2026.07.08</span>
                  <span>파일 형식 .zip</span>
                  <span>크기 6KB</span>
                </div>
                <p className="mt-6 text-base font-semibold text-[#526078]">
                  macOS 환경에서 ONDAM AI 정책 및 환경 설정을 적용하기 위한 압축 파일입니다.
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-4 lg:min-w-[14rem]">
                <AppButton
                  onClick={handleMacosDownloadClick}
                  disabled={isMacosDownloadPending}
                  className="h-16 px-8 text-lg font-black"
                >
                  <Download className="h-5 w-5" />
                  {isMacosDownloadPending ? '다운로드 준비 중' : 'macOS 파일 다운로드'}
                </AppButton>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <SectionHeader
            title="주의사항"
            description="설치 또는 삭제를 진행하기 전에 아래 내용을 확인해 주세요."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {cautionItems.map(([title, description]) => (
              <div
                key={title}
                className="flex min-h-[5.75rem] items-start gap-4 rounded-[10px] border border-[#E3E8F2] bg-[#FAFBFF] px-5 py-4"
              >
                <CircleCheck
                  className="mt-1 h-5 w-5 shrink-0 fill-[#168BFF] text-[#168BFF] [&>path:last-child]:stroke-white"
                  strokeWidth={3}
                />
                <div className="min-w-0">
                  <p className="text-base font-black text-slate-900">{title}</p>
                  <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-6 text-[#526078]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <section id="delete" className="scroll-mt-28">
          <SectionHeader
            title="삭제 안내"
            description={
              'ONDAM AI 적용을 해제해야 하는 경우 아래 순서대로 진행해 주세요.\n삭제 후에는 설정된 PAC 프록시와 설치된 인증서가 제거됩니다.'
            }
          />

          <div className="mt-6 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {deleteSteps.map(([Icon, title, description], index) => (
              <div
                key={title}
                className={
                  index === 3
                    ? 'xl:col-start-1 xl:translate-x-[calc(50%+0.875rem)]'
                    : index === 4
                      ? 'xl:col-start-2 xl:translate-x-[calc(50%+0.875rem)]'
                      : ''
                }
              >
                <CompactGuideCard
                  icon={Icon}
                  number={index + 1}
                  title={title}
                  description={description}
                />
              </div>
            ))}
          </div>
        </section>

        <Section>
          <SectionHeader
            title="적용 후 확인 방법"
            description="적용이 완료되면 아래 항목을 확인해 주세요."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {verifyItems.map(([title, description]) => (
              <div
                key={title}
                className="flex min-h-[5.75rem] items-start gap-4 rounded-[10px] border border-[#E3E8F2] bg-[#FAFBFF] px-5 py-4"
              >
                <CircleCheck
                  className="mt-1 h-5 w-5 shrink-0 fill-[#168BFF] text-[#168BFF] [&>path:last-child]:stroke-white"
                  strokeWidth={3}
                />
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#526078]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="contact">
          <SectionHeader
            title="문제가 발생했나요?"
            description="압축 파일 다운로드, 실행 또는 적용 중 문제가 발생하면 관리자에게 문의해 주세요."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
            <div className="flex items-center gap-5 rounded-[10px] border border-[#E3E8F2] bg-[#FAFBFF] px-10 py-7">
              <img src={template.logoSrc} alt="" className="h-20 w-20 shrink-0 object-contain" />
              <div>
                <p className="text-base font-black text-slate-900">{template.companyName}</p>
                <p className="mt-2 text-base font-bold leading-7 text-[#526078]">
                  {template.companyDescription}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 rounded-[10px] border border-[#E3E8F2] bg-[#FAFBFF] px-10 py-7">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#075DF6] text-[#F2F8FF]">
                <Mail className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-black text-slate-900">이메일</p>
                <p className="mt-2 text-base font-bold text-[#526078]">{template.adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 rounded-[10px] border border-[#E3E8F2] bg-[#FAFBFF] px-10 py-7">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#075DF6] text-[#F2F8FF]">
                <Phone className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-black text-slate-900">전화</p>
                <p className="mt-2 text-base font-bold text-[#526078]">{template.adminPhone}</p>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <footer className="mt-2 bg-[#101722]">
        <div className="mx-auto flex max-w-[min(100%,80rem)] flex-col gap-4 px-8 py-8 text-sm font-semibold text-white/62 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center">
              <img src={template.logoSrc} alt="ONDAM AI" className="h-8 w-auto" />
            </div>
            <span>{template.companyDescription}</span>
          </div>
          <span>© 2026 {template.companyName}. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
