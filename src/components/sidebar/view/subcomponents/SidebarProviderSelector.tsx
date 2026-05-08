import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import SessionProviderLogo from '../../../llm-logo-provider/SessionProviderLogo';
import { IS_CODEX_ONLY_HARDENED } from '../../../../constants/config';
import { authenticatedFetch } from '../../../../utils/api';
import type { SessionProvider } from '../../../../types/app';

const PROVIDERS: { id: SessionProvider; name: string }[] = [
  { id: 'claude', name: 'Claude' },
  { id: 'cursor', name: 'Cursor' },
  { id: 'codex', name: 'Codex' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'kimi', name: 'Kimi' },
];

type CliStatus = 'idle' | 'loading' | 'success' | 'error';

export default function SidebarProviderSelector() {
  const [provider, setProvider] = useState<SessionProvider>(
    () => (localStorage.getItem('selected-provider') as SessionProvider) || 'claude'
  );
  const [cliStatus, setCliStatus] = useState<Record<string, CliStatus>>({});
  const [cliVersions, setCliVersions] = useState<Record<string, string | null>>({});

  useEffect(() => {
    localStorage.setItem('selected-provider', provider);
    window.dispatchEvent(new CustomEvent('provider-changed', { detail: provider }));
  }, [provider]);

  const testCli = async (p: SessionProvider) => {
    setCliStatus((prev) => ({ ...prev, [p]: 'loading' }));
    try {
      const res = await authenticatedFetch(`/api/cli-status?provider=${p}`);
      const data = await res.json();
      const result = data[p];
      if (result?.available) {
        setCliStatus((prev) => ({ ...prev, [p]: 'success' }));
        setCliVersions((prev) => ({ ...prev, [p]: result.version || null }));
      } else {
        setCliStatus((prev) => ({ ...prev, [p]: 'error' }));
      }
    } catch {
      setCliStatus((prev) => ({ ...prev, [p]: 'error' }));
    }
  };

  const visibleProviders = IS_CODEX_ONLY_HARDENED
    ? PROVIDERS.filter((p) => p.id === 'codex')
    : PROVIDERS;

  return (
    <div className="px-2 py-1.5">
      <div className="flex items-center gap-1">
        {visibleProviders.map((p) => {
          const active = provider === p.id;
          const status = cliStatus[p.id];
          return (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={`group relative flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 transition-all ${
                active
                  ? 'bg-accent shadow-sm'
                  : 'hover:bg-accent/50'
              }`}
              title={p.name}
            >
              <SessionProviderLogo
                provider={p.id}
                className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`}
              />
              <span className={`text-[9px] leading-none ${active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {p.name}
              </span>
              {/* CLI status indicator */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  testCli(p.id);
                }}
                className="flex h-3.5 items-center gap-0.5"
                title={status === 'success' ? (cliVersions[p.id] || 'Connected') : status === 'error' ? 'Not available' : 'Test connection'}
              >
                {status === 'loading' && <Loader2 className="h-2.5 w-2.5 animate-spin text-muted-foreground/50" />}
                {status === 'success' && <Wifi className="h-2.5 w-2.5 text-green-500" />}
                {status === 'error' && <WifiOff className="h-2.5 w-2.5 text-red-400" />}
                {!status && <Wifi className="h-2.5 w-2.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
}
