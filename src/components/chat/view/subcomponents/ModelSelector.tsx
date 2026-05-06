import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { CLAUDE_MODELS, CURSOR_MODELS, CODEX_MODELS, GEMINI_MODELS } from '../../../../../shared/modelConstants';
import { authenticatedFetch } from '../../../../utils/api';
import type { Provider } from '../../types/types';

interface ModelSelectorProps {
  provider: Provider | string;
  currentModel: string;
  onModelChange: (model: string) => void;
}

const STATIC_CONFIGS: Record<string, { OPTIONS: { value: string; label: string }[]; DEFAULT: string }> = {
  claude: CLAUDE_MODELS,
  cursor: CURSOR_MODELS,
  codex: CODEX_MODELS,
  gemini: GEMINI_MODELS,
};

export default function ModelSelector({ provider, currentModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  const updateButtonRect = useCallback(() => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, []);

  // Fetch configured model from backend and merge with static options
  const fetchModels = useCallback(async () => {
    const staticConfig = STATIC_CONFIGS[provider] || CLAUDE_MODELS;
    let mergedOptions = [...staticConfig.OPTIONS];

    try {
      if (provider === 'cursor') {
        const res = await authenticatedFetch('/api/cursor/config');
        const data = await res.json();
        if (data.success && data.config?.model?.modelId) {
          const configModel = data.config.model.modelId as string;
          if (!mergedOptions.some((o) => o.value === configModel)) {
            mergedOptions.unshift({ value: configModel, label: configModel });
          }
        }
      } else if (provider === 'codex') {
        const res = await authenticatedFetch('/api/codex/config');
        const data = await res.json();
        if (data.success && data.config?.model) {
          const configModel = data.config.model as string;
          if (!mergedOptions.some((o) => o.value === configModel)) {
            mergedOptions.unshift({ value: configModel, label: configModel });
          }
        }
      }
    } catch {
      // Fall back to static options on error
    }

    setOptions(mergedOptions);
  }, [provider]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const currentLabel = options.find((o) => o.value === currentModel)?.label || currentModel;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateButtonRect();
      window.addEventListener('scroll', updateButtonRect, true);
      window.addEventListener('resize', updateButtonRect);
      return () => {
        window.removeEventListener('scroll', updateButtonRect, true);
        window.removeEventListener('resize', updateButtonRect);
      };
    }
  }, [isOpen, updateButtonRect]);

  const dropdownContent = isOpen && buttonRect ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] max-h-60 w-56 overflow-y-auto rounded-lg border border-border/50 bg-card/95 shadow-lg backdrop-blur-md"
      style={{
        bottom: window.innerHeight - buttonRect.top + 4,
        left: buttonRect.left,
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            onModelChange(option.value);
            setIsOpen(false);
          }}
          className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent/50 ${
            option.value === currentModel
              ? 'bg-primary/8 font-medium text-primary'
              : 'text-foreground'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      >
        <span className="max-w-[120px] truncate">{currentLabel}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownContent}
    </div>
  );
}
