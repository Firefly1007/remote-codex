import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Brain, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProviderThinkingConfig } from '../../constants/providerThinkingConfigs';
import type { ThinkingModeDef } from '../../constants/providerThinkingConfigs';

type ThinkingModeSelectorProps = {
  provider: string;
  selectedMode: string;
  onModeChange: (modeId: string) => void;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
};

function ThinkingModeSelector({ provider, selectedMode, onModeChange, onClose, className = '', compact = false }: ThinkingModeSelectorProps) {
  const { t } = useTranslation('chat');

  const config = getProviderThinkingConfig(provider);
  const modes: ThinkingModeDef[] = config?.modes || [];

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  const updateButtonRect = useCallback(() => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const currentMode = modes.find((mode) => mode.id === selectedMode) || modes[0];
  const IconComponent = currentMode?.icon || Brain;

  const getModeDisplayName = (mode: ThinkingModeDef) => {
    return t(`thinkingMode.providers.${provider}.modes.${mode.translationKey}.name`, { defaultValue: mode.translationKey });
  };

  const dropdownContent = isOpen && buttonRect ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
      style={{
        bottom: window.innerHeight - buttonRect.top + 8,
        right: window.innerWidth - buttonRect.right,
      }}
    >
      <div className="border-b border-gray-200 p-3 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('thinkingMode.selector.title')}
          </h3>
          <button
            onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t(`thinkingMode.providers.${provider}.description`, { defaultValue: '' })}
        </p>
      </div>

      <div className="py-1">
        {modes.map((mode) => {
          const ModeIcon = mode.icon;
          const isSelected = mode.id === selectedMode;

          return (
            <button
              key={mode.id}
              onClick={() => {
                onModeChange(mode.id);
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${mode.icon ? mode.color : 'text-gray-400'}`}>
                  {ModeIcon ? <ModeIcon className="h-5 w-5" /> : <div className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {getModeDisplayName(mode)}
                    </span>
                    {isSelected && (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {t('thinkingMode.selector.active')}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {t(`thinkingMode.providers.${provider}.modes.${mode.translationKey}.description`, { defaultValue: '' })}
                  </p>
                  {mode.prefix && (
                    <code className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                      {mode.prefix}
                    </code>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Tip:</strong> {t('thinkingMode.selector.tip')}
        </p>
      </div>
    </div>,
    document.body
  ) : null;

  if (!config || modes.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {compact ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          title={t('thinkingMode.buttonTitle', { mode: currentMode ? getModeDisplayName(currentMode) : '' })}
        >
          <IconComponent className={`h-3 w-3 ${currentMode?.color || ''}`} />
          <span>{currentMode ? getModeDisplayName(currentMode) : ''}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 sm:h-10 sm:w-10 ${selectedMode === 'none'
              ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800'
            }`}
          title={t('thinkingMode.buttonTitle', { mode: currentMode ? getModeDisplayName(currentMode) : '' })}
        >
          <IconComponent className={`h-5 w-5 ${currentMode?.color || ''}`} />
        </button>
      )}

      {dropdownContent}
    </div>
  );
}

export default ThinkingModeSelector;
