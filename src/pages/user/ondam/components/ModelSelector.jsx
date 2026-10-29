import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import openaiIcon from '../../../../assets/icons/openai.svg';
import geminiIcon from '../../../../assets/icons/gemini-color.svg';
import { models } from '../../../admin/control/internal/data.js';

const providerIcons = {
  openai: openaiIcon,
  google: geminiIcon,
};

const enabledModels = models
  .filter(model => model[5] === '사용')
  .map(model => ({
    id: model[0],
    provider: model[1],
    providerCode: model[2],
  }));

function ProviderIcon({ model }) {
  const icon = providerIcons[model.providerCode];

  return icon ? (
    <img src={icon} alt="" className="h-4 w-4" />
  ) : (
    <span className="grid h-4 w-4 place-items-center rounded bg-[#596cff] text-[9px] font-bold text-white">
      {model.provider.slice(0, 1)}
    </span>
  );
}

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(() => {
    const savedModelId = window.localStorage.getItem('ondam-selected-model');
    return enabledModels.some(model => model.id === savedModelId)
      ? savedModelId
      : enabledModels[0]?.id;
  });
  const containerRef = useRef(null);
  const selectedModel =
    enabledModels.find(model => model.id === selectedModelId) ?? enabledModels[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = event => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const selectModel = modelId => {
    setSelectedModelId(modelId);
    window.localStorage.setItem('ondam-selected-model', modelId);
    setIsOpen(false);
  };

  if (!selectedModel) return null;

  return (
    <div ref={containerRef} className="relative shrink-0">
      {isOpen && (
        <div
          role="menu"
          aria-label="모델 선택"
          className="absolute bottom-[calc(100%+14px)] right-0 z-50 w-[300px] overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-[0_10px_35px_rgba(0,0,0,0.14)]"
        >
          <div className="px-3 pb-2 pt-1.5">
            <p className="text-[14px] font-semibold text-[#242424]">모델 선택</p>
            <p className="mt-0.5 text-[11px] text-[#888]">사용 설정된 내부 AI 모델</p>
          </div>

          <div className="max-h-[300px] space-y-0.5 overflow-y-auto [scrollbar-width:thin]">
            {enabledModels.map(model => {
              const isSelected = model.id === selectedModel.id;

              return (
                <button
                  key={model.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => selectModel(model.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isSelected ? 'bg-[#eef4ff]' : 'hover:bg-[#f4f4f4]'
                  }`}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-black/[0.06] bg-white">
                    <ProviderIcon model={model} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-[#262626]">
                      {model.id}
                    </span>
                    <span className="block truncate text-[11px] text-[#888]">{model.provider}</span>
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-[#3c7cf6]" strokeWidth={2.2} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(value => !value)}
        className={`flex h-10 max-w-[112px] items-center gap-1.5 rounded-full px-2 text-[12px] transition-colors sm:max-w-[155px] sm:px-3 sm:text-[13px] ${
          isOpen ? 'bg-[#f0f0f0] text-[#333]' : 'text-[#666] hover:bg-[#f3f3f3]'
        }`}
        aria-label={`현재 모델: ${selectedModel.id}`}
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedModel.id}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
