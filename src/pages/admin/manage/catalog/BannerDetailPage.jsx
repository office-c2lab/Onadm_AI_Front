import { useMemo, useState } from 'react';
import { ArrowLeft, ImagePlus, Search } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import StoreToolIcon from '../../../user/aistore/components/StoreToolIcon.jsx';
import { catalogItems } from '../data.js';
import { deleteCatalogBanner, getCatalogBanners, updateCatalogBanner } from './catalogStore.js';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function BannerDetailPage() {
  const { bannerId } = useParams();
  const navigate = useNavigate();
  const isCreating = bannerId === 'new';
  const publishedTools = useMemo(
    () => catalogItems.filter(item => item.publication === '게시 중'),
    []
  );
  const sourceBanner = getCatalogBanners().find(item => item.id === bannerId);
  const [banner, setBanner] = useState(() =>
    isCreating
      ? {
          id: `banner-${Date.now()}`,
          toolId: '',
          title: '',
          description: '',
          image: '',
          imageName: '',
        }
      : sourceBanner
  );
  const [toolQuery, setToolQuery] = useState('');
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!banner) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">배너를 찾을 수 없습니다.</h1>
        <Link
          to="/admin/manage/catalog"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          스토어 진열 관리로 돌아가기
        </Link>
      </div>
    );
  }

  const toolKeyword = toolQuery.trim().toLowerCase();
  const selectedTool = publishedTools.find(item => (item.storeId ?? item.id) === banner.toolId);
  const visibleTools = publishedTools.filter(tool =>
    `${tool.name} ${tool.type} ${tool.storeCategory || tool.category}`
      .toLowerCase()
      .includes(toolKeyword)
  );
  const update = changes => {
    setBanner(current => ({ ...current, ...changes }));
    setError('');
  };
  const selectTool = toolId => {
    const tool = publishedTools.find(item => (item.storeId ?? item.id) === toolId);
    update({
      toolId,
      title: tool?.name ?? '',
      description: tool?.summary ?? '',
    });
  };
  const selectImage = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('배너 이미지는 2MB 이하로 업로드해 주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update({ image: String(reader.result), imageName: file.name });
    reader.onerror = () => setError('이미지를 불러오지 못했습니다. 다시 시도해 주세요.');
    reader.readAsDataURL(file);
  };
  const save = () => {
    if (!banner.toolId) {
      setError('배너와 연결할 도구를 선택해 주세요.');
      return;
    }
    if (!banner.title.trim()) {
      setError('배너 제목을 입력해 주세요.');
      return;
    }
    if (!banner.image) {
      setError('배너 이미지를 업로드해 주세요.');
      return;
    }
    try {
      updateCatalogBanner({
        ...banner,
        title: banner.title.trim(),
        description: banner.description.trim(),
      });
      navigate('/admin/manage/catalog');
    } catch {
      setError('배너를 저장하지 못했습니다. 이미지 용량을 줄여 다시 시도해 주세요.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-14 pt-6 text-slate-900">
      <Link
        to="/admin/manage/catalog"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 스토어 진열 관리로 돌아가기
      </Link>

      <header className="py-8 sm:py-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {isCreating ? '배너 추가' : '배너 수정'}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          사용자 스토어 홈에 노출할 배너와 연결 도구를 설정합니다.
        </p>
      </header>

      <section className="border-t border-slate-200 py-9">
        <h2 className="text-lg font-bold">연결 도구</h2>
        {selectedTool && (
          <div className="mt-5">
            <p className="text-sm font-medium text-slate-700">현재 선택된 도구</p>
            <div className="mt-2 flex min-h-[72px] items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <StoreToolIcon
                tool={{ ...selectedTool, id: selectedTool.storeId ?? selectedTool.id }}
                small
              />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-slate-900">
                  {selectedTool.name}
                </strong>
                <span className="mt-1 block truncate text-xs text-slate-500">
                  {selectedTool.type} · {selectedTool.storeCategory || selectedTool.category}
                </span>
              </div>
              <span className="shrink-0 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                선택됨
              </span>
            </div>
          </div>
        )}
        <p className="mt-5 text-sm font-medium text-slate-700">
          {selectedTool ? '연결 도구 변경' : '연결할 도구 선택'}
        </p>
        <label className="relative mt-2 block">
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="search"
            value={toolQuery}
            onChange={event => setToolQuery(event.target.value)}
            placeholder="게시 중인 도구 검색"
            className="h-11 w-full rounded-lg bg-slate-100 pr-4 pl-11 text-sm outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <div className="mt-3 max-h-72 divide-y divide-slate-100 overflow-y-auto border-y border-slate-200">
          {visibleTools.map(tool => {
            const toolId = tool.storeId ?? tool.id;
            const selected = banner.toolId === toolId;
            return (
              <div key={tool.id} className="flex min-h-16 items-center gap-3 py-2.5">
                <StoreToolIcon tool={{ ...tool, id: toolId }} small />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold">{tool.name}</strong>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {tool.type} · {tool.storeCategory || tool.category}
                  </span>
                </div>
                <AiStoreActionButton
                  size="compact"
                  variant={selected ? 'info' : 'secondary'}
                  disabled={selected}
                  onClick={() => selectTool(toolId)}
                >
                  {selected ? '선택됨' : '선택'}
                </AiStoreActionButton>
              </div>
            );
          })}
          {!visibleTools.length && (
            <p className="py-10 text-center text-sm text-slate-400">
              검색 조건에 맞는 도구가 없습니다.
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 py-9">
        <h2 className="text-lg font-bold">배너 정보</h2>
        <div className="mt-5 grid gap-5">
          <label className="text-sm font-medium text-slate-700">
            제목
            <input
              value={banner.title}
              onChange={event => update({ title: event.target.value })}
              placeholder="배너 제목을 입력하세요."
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            설명
            <textarea
              value={banner.description}
              onChange={event => update({ description: event.target.value })}
              placeholder="배너 설명을 입력하세요."
              className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div>
            <span className="text-sm font-medium text-slate-700">배너 이미지</span>
            <label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-5 py-5 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
              <ImagePlus size={22} className="text-blue-600" />
              <span className="mt-2 text-sm font-semibold text-slate-700">
                {banner.imageName || '이미지 선택'}
              </span>
              <span className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP · 최대 2MB</span>
              <input type="file" accept="image/*" onChange={selectImage} className="sr-only" />
            </label>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 py-9">
        <h2 className="text-lg font-bold">미리보기</h2>
        <div className="relative mt-5 min-h-56 overflow-hidden rounded-xl bg-gradient-to-br from-blue-950 to-blue-600">
          {banner.image && (
            <img
              src={banner.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/20 to-transparent" />
          <div className="relative flex min-h-56 max-w-xl flex-col justify-center px-7 py-8 text-white">
            <strong className="text-2xl font-bold">{banner.title || '배너 제목'}</strong>
            <span className="mt-2 line-clamp-2 text-sm text-white/85">
              {banner.description || '배너 설명이 표시됩니다.'}
            </span>
            <span className="mt-4 w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900">
              자세히 보기
            </span>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur">
        {!isCreating && (
          <AiStoreActionButton variant="danger" size="large" onClick={() => setDeleteOpen(true)}>
            배너 삭제
          </AiStoreActionButton>
        )}
        {error && (
          <span role="alert" className="text-sm font-medium text-red-600">
            {error}
          </span>
        )}
        <AiStoreActionButton size="large" className="ml-auto" onClick={save}>
          {isCreating ? '배너 추가' : '변경사항 저장'}
        </AiStoreActionButton>
      </div>

      <AiStoreConfirmModal
        open={deleteOpen}
        title="배너를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteCatalogBanner(banner.id);
          navigate('/admin/manage/catalog');
        }}
      >
        <strong className="font-semibold text-slate-900">{banner.title}</strong> 배너가 사용자
        스토어 홈에서 제거됩니다.
      </AiStoreConfirmModal>
    </div>
  );
}
