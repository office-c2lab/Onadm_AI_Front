import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Folder, Trash2, X } from 'lucide-react';

import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';

const memoryOptions = [
  { value: 'default', label: '기본' },
  { value: 'project-only', label: '프로젝트 전용' },
];

const libraryAccessOptions = [
  { value: 'enabled', label: '활성화됨' },
  { value: 'disabled', label: '비활성화됨' },
];

export default function ProjectSettingsModal({ open, project, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [instructions, setInstructions] = useState(project?.instructions ?? '');
  const [memoryMode, setMemoryMode] = useState(project?.memoryMode ?? 'default');
  const [libraryAccess, setLibraryAccess] = useState(project?.libraryAccess ?? 'enabled');

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = event => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        onSave({
          ...project,
          title: title.trim() || project.title,
          instructions: instructions.trim(),
          memoryMode,
          libraryAccess,
        });
        onClose();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [instructions, libraryAccess, memoryMode, onClose, onSave, open, project, title]);

  if (!open || !project || typeof document === 'undefined') return null;

  const saveAndClose = () => {
    onSave({
      ...project,
      title: title.trim() || project.title,
      instructions: instructions.trim(),
      memoryMode,
      libraryAccess,
    });
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-black/20 px-4 py-8 backdrop-blur-[1px]"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) saveAndClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-settings-title"
        className="max-h-[calc(100dvh-32px)] w-full max-w-[514px] overflow-y-auto rounded-2xl bg-white p-[18px] shadow-[0_18px_60px_rgba(0,0,0,0.2)] [scrollbar-width:thin]"
      >
        <header className="flex items-center justify-between gap-4">
          <h2 id="project-settings-title" className="text-[19px] font-semibold text-[#202020]">
            프로젝트 설정
          </h2>
          <button
            type="button"
            onClick={saveAndClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#444] hover:bg-[#f1f1f1]"
            aria-label="프로젝트 설정 닫기"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </header>

        <label
          htmlFor="project-settings-name"
          className="mt-6 block text-[13px] font-medium text-[#333]"
        >
          프로젝트 이름
        </label>
        <div className="mt-2 flex h-10 items-center gap-2.5 rounded-lg border border-[#dedede] px-3 focus-within:border-[#9db9f4] focus-within:ring-2 focus-within:ring-[#eaf1ff]">
          <Folder className="h-[18px] w-[18px] shrink-0 text-[#333]" strokeWidth={1.7} />
          <input
            id="project-settings-name"
            value={title}
            onChange={event => setTitle(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[#222] outline-none"
          />
        </div>

        <label
          htmlFor="project-settings-instructions"
          className="mt-5 block text-[13px] font-medium text-[#333]"
        >
          지침
        </label>
        <p className="mt-1 text-[12px] leading-5 text-[#888]">
          컨텍스트를 설정하고 이 프로젝트에서 ONDAM AI의 응답 방식을 맞춤 설정합니다.
        </p>
        <textarea
          id="project-settings-instructions"
          value={instructions}
          onChange={event => setInstructions(event.target.value)}
          placeholder="예: 스페인어로 답해줘. 최신 JavaScript 문서를 참고해줘. 답변은 짧고 핵심적으로 해줘."
          className="mt-1.5 min-h-[60px] w-full resize-none rounded-lg border border-[#dedede] px-3 py-2.5 text-[13px] leading-5 text-[#333] outline-none placeholder:text-[#999] focus:border-[#9db9f4] focus:ring-2 focus:ring-[#eaf1ff]"
        />

        <div className="mt-5">
          <p className="text-[13px] font-medium text-[#333]">메모리</p>
          <CustomDropdown
            value={memoryMode}
            options={memoryOptions}
            onChange={setMemoryMode}
            ariaLabel="프로젝트 메모리 설정"
            className="mt-2"
          />
          <p className="mt-1.5 text-[12px] leading-5 text-[#888]">
            이 프로젝트와 외부 채팅은 서로의 메모리에 액세스할 수 있습니다.
          </p>
        </div>

        <div className="mt-5">
          <p className="text-[13px] font-medium text-[#333]">라이브러리 액세스</p>
          <CustomDropdown
            value={libraryAccess}
            options={libraryAccessOptions}
            onChange={setLibraryAccess}
            ariaLabel="프로젝트 라이브러리 액세스 설정"
            className="mt-2"
          />
          <p className="mt-1.5 text-[12px] leading-5 text-[#888]">
            이 프로젝트는 비공개로 유지되는 동안 파일 라이브러리에 액세스할 수 있습니다. 이
            프로젝트를 공유하면 라이브러리 액세스가 비활성화됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(project);
          }}
          className="mt-6 flex h-9 items-center gap-2 rounded-full bg-[#fff0f0] px-4 text-[13px] font-semibold text-[#e03131] transition hover:bg-[#ffe3e3]"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
          프로젝트 삭제
        </button>
      </section>
    </div>,
    document.body
  );
}
