import { FileText, FolderOpen, Image, LibraryBig } from 'lucide-react';
import { useState } from 'react';

const libraryTabs = [
  { id: 'all', label: '전체', icon: LibraryBig },
  { id: 'folders', label: '폴더', icon: FolderOpen },
  { id: 'images', label: '이미지', icon: Image },
  { id: 'files', label: '파일', icon: FileText },
];

const emptyMessages = {
  all: {
    title: '라이브러리가 비어 있습니다',
    description: '대화에서 저장한 이미지와 파일이 이곳에 모입니다.',
  },
  images: {
    title: '저장된 이미지가 없습니다',
    description: '대화에서 생성하거나 저장한 이미지가 이곳에 표시됩니다.',
  },
  files: {
    title: '저장된 파일이 없습니다',
    description: '대화에서 업로드하거나 저장한 파일이 이곳에 표시됩니다.',
  },
  folders: {
    title: '생성된 폴더가 없습니다',
    description: '이미지와 파일을 폴더로 정리하면 이곳에 표시됩니다.',
  },
};

export default function LibraryView() {
  const [activeTab, setActiveTab] = useState('all');
  const activeTabItem = libraryTabs.find(tab => tab.id === activeTab) ?? libraryTabs[0];
  const EmptyIcon = activeTabItem.icon;
  const emptyMessage = emptyMessages[activeTab];

  return (
    <section className="min-h-full bg-white px-5 py-10 sm:px-8" aria-label="라이브러리">
      <div className="mx-auto w-full max-w-[1120px]">
        <h1 className="text-[27px] font-semibold tracking-[-0.025em] text-[#0d0d0d]">라이브러리</h1>

        <div
          className="mt-6 flex flex-wrap items-center gap-1"
          role="tablist"
          aria-label="라이브러리 분류"
        >
          {libraryTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="ondam-library-panel"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-[14px] transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#f1f1f1] font-medium text-[#171717]'
                  : 'text-[#666] hover:bg-[#f7f7f7] hover:text-[#333]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          id="ondam-library-panel"
          role="tabpanel"
          className="mt-5 flex min-h-[360px] flex-col items-center justify-center border-t border-[#e5e5e5] text-center"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3f5f8] text-[#677080]">
            <EmptyIcon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
          </span>
          <p className="mt-4 text-[14px] font-medium text-[#333]">{emptyMessage.title}</p>
          <p className="mt-1 max-w-sm text-[13px] leading-5 text-[#888]">
            {emptyMessage.description}
          </p>
        </div>
      </div>
    </section>
  );
}
