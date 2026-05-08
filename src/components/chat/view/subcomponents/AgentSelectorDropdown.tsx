import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import SessionProviderLogo from '../../../llm-logo-provider/SessionProviderLogo';
import { CLAUDE_MODELS, CURSOR_MODELS, CODEX_MODELS, GEMINI_MODELS, KIMI_MODELS } from '../../../../shared/modelConstants';
import { authenticatedFetch } from '../../../utils/api';
import type { SessionProvider } from '../../../../types/app';

type ProviderOption = {
  id: SessionProvider;
  name: string;
  models: { value: string; label: string }[];
};

const PROVIDERS: ProviderOption[] = [
  { id: 'claude', name: 'Claude', models: CLAUDE_MODELS.OPTIONS },
  { id: 'cursor', name: 'Cursor', models: CURSOR_MODELS.OPTIONS },
  { id: 'codex', name: 'Codex', models: CODEX_MODELS.OPTIONS },
  { id: 'gemini', name: 'Gemini', models: GEMINI_MODELS.OPTIONS },
  { id: 'kimi', name: 'Kimi', models: KIMI_MODELS.OPTIONS },
];

type AuthStatus = {
  authenticated: boolean;
  loading: boolean;
};

type AgentSelectorDropdownProps = {
  provider: SessionProvider;
  currentModel: string;
  onProviderChange: (provider: SessionProvider) => void;
  onModelChange: (model: string) => void;
  compact?: boolean;
};

export default function AgentSelectorDropdown({
  provider,
  currentModel,
  onProviderChange,
  onModelChange,
  compact = false,
}: AgentSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [authStatuses, setAuthStatuses] = useState<Record<string, AuthStatus>>({});
  const [dynamicModels, setDynamicModels] = useState<Record<string, { value: string; label: string }[]>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  const currentProviderConfig = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];
  const currentModelLabel =
    (dynamicModels[provider] || currentProviderConfig.models).find((m) => m.value === currentModel)?.label || currentModel;

  // Fetch auth statuses
  useEffect(() => {
    let cancelled = false;
    const checkAll = async () => {
      const entries: Record<string, AuthStatus> = {};
      await Promise.allSettled(
        PROVIDERS.map(async (p) => {
          try {
            const res = await authenticatedFetch(`/api/cli/${p.id}/status`);
            if (cancelled) return;
            const data = await res.json();
            entries[p.id] = { authenticated: data.authenticated, loading: false };
          } catch {
            if (cancelled) return;
            entries[p.id] = { authenticated: false, loading: false };
          }
        }),
      );
      if (!cancelled) setAuthStatuses(entries);
    };
    checkAll();
    return () => { cancelled = true; };
  }, []);

  // Fetch dynamic models for cursor/codex when dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    const fetchDynamic = async () => {
      const newDynamic: Record<string, { value: string; label: string }[]> = {};
      await Promise.allSettled([
        (async () => {
          try {
            const res = await authenticatedFetch('/api/cursor/config');
            const data = await res.json();
            if (data.success && data.config?.model?.modelId) {
              const configModel = data.config.model.modelId as string;
              const staticModels = CURSOR_MODELS.OPTIONS;
              if (!staticModels.some((o) => o.value === configModel)) {
                newDynamic.cursor = [{ value: configModel, label: configModel }, ...staticModels];
              }
            }
          } catch { /* ignore */ }
        })(),
        (async () => {
          try {
            const res = await authenticatedFetch('/api/codex/config');
            const data = await res.json();
            if (data.success && data.config?.model) {
              const configModel = data.config.model as string;
              const staticModels = CODEX_MODELS.OPTIONS;
              if (!staticModels.some((o) => o.value === configModel)) {
                newDynamic.codex = [{ value: configModel, label: configModel }, ...staticModels];
              }
            }
          } catch { /* ignore */ }
        })(),
      ]);
      if (Object.keys(newDynamic).length > 0) {
        setDynamicModels((prev) => ({ ...prev, ...newDynamic }));
      }
    };
    fetchDynamic();
  }, [isOpen]);

  const updateButtonRect = useCallback(() => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, []);

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

  const handleProviderSelect = (p: SessionProvider) => {
    onProviderChange(p);
    // Auto-select default model for the new provider
    const config = PROVIDERS.find((pr) => pr.id === p);
    if (config) {
      const models = dynamicModels[p] || config.models;
      const defaultModel = p === 'claude' ? CLAUDE_MODELS.DEFAULT
        : p === 'cursor' ? CURSOR_MODELS.DEFAULT
        : p === 'codex' ? CODEX_MODELS.DEFAULT
        : p === 'gemini' ? GEMINI_MODELS.DEFAULT
        : KIMI_MODELS.DEFAULT;
      // Only change model if current model is not in the new provider's list
      if (!models.some((m) => m.value === currentModel)) {
        onModelChange(defaultModel);
      }
    }
  };

  const handleModelSelect = (model: string) => {
    onModelChange(model);
    setIsOpen(false);
  };

  const getStatusDot = (pId: string) => {
    const status = authStatuses[pId];
    if (!status) return 'bg-muted-foreground/30';
    if (status.loading) return 'bg-muted-foreground/30 animate-pulse';
    if (status.authenticated) return 'bg-green-500';
    return 'bg-red-400';
  };

  const dropdownContent = isOpen && buttonRect ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-xl backdrop-blur-md"
      style={{
        bottom: Math.min(window.innerHeight - buttonRect.top + 4, window.innerHeight - 16),
        left: Math.max(8, Math.min(buttonRect.left, window.innerWidth - 320)),
        maxHeight: Math.min(420, buttonRect.top - 16),
        width: 300,
      }}
    >
      <div className="overflow-y-auto" style={{ maxHeight: Math.min(420, buttonRect.top - 16) }}>
        {PROVIDERS.map((p) => {
          const isActive = p.id === provider;
          const models = dynamicModels[p.id] || p.models;

          return (
            <div key={p.id}>
              {/* Provider header */}
              <button
                type="button"
                onClick={() => handleProviderSelect(p.id)}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/8 text-foreground'
                    : 'text-foreground hover:bg-accent/50'
                }`}
              >
                <SessionProviderLogo provider={p.id} className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate font-medium">{p.name}</span>
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${getStatusDot(p.id)}`} />
                {isActive && <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />}
              </button>

              {/* Models for active provider */}
              {isActive && (
                <div className="border-t border-border/30 bg-muted/20 px-2 py-1.5">
                  {models.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => handleModelSelect(m.value)}
                      className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                        m.value === currentModel
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) updateButtonRect();
        }}
        className={`flex items-center gap-1 rounded-md transition-colors hover:bg-accent/60 ${
          compact ? 'p-1.5' : 'gap-1.5 px-2 py-1'
        }`}
        title={`${currentProviderConfig.name} — ${currentModelLabel}`}
      >
        <SessionProviderLogo provider={provider} className="h-4 w-4 flex-shrink-0" />
        {!compact && (
          <span className="max-w-[100px] truncate text-xs font-medium text-muted-foreground">
            {currentModelLabel}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownContent}
    </div>
  );
}
