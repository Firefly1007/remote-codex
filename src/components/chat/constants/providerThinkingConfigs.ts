import { Brain, Zap, Sparkles, Atom } from 'lucide-react';
import type { ComponentType } from 'react';

export interface ThinkingModeDef {
  id: string;
  translationKey: string;
  icon: ComponentType<{ className?: string }> | null;
  color: string;
  /** Text prefix prepended to message (Claude/Cursor) */
  prefix?: string;
  /** API parameter passed in options (Codex/Gemini/Kimi/Qwen) */
  thinkingParam?: Record<string, unknown>;
}

export interface ProviderThinkingConfig {
  descriptionKey: string;
  modes: ThinkingModeDef[];
}

const PROVIDER_THINKING_CONFIGS: Record<string, ProviderThinkingConfig> = {
  claude: {
    descriptionKey: 'claude',
    modes: [
      { id: 'none', translationKey: 'none', icon: null, color: 'text-gray-600' },
      { id: 'think', translationKey: 'think', icon: Brain, color: 'text-blue-600', prefix: 'think' },
      { id: 'think-hard', translationKey: 'thinkHard', icon: Zap, color: 'text-purple-600', prefix: 'think hard' },
      { id: 'think-harder', translationKey: 'thinkHarder', icon: Sparkles, color: 'text-indigo-600', prefix: 'think harder' },
      { id: 'ultrathink', translationKey: 'ultrathink', icon: Atom, color: 'text-red-600', prefix: 'ultrathink' },
    ],
  },
  codex: {
    descriptionKey: 'codex',
    modes: [
      { id: 'none', translationKey: 'none', icon: null, color: 'text-gray-600' },
      { id: 'low', translationKey: 'low', icon: Brain, color: 'text-blue-600', thinkingParam: { reasoning_effort: 'low' } },
      { id: 'medium', translationKey: 'medium', icon: Zap, color: 'text-purple-600', thinkingParam: { reasoning_effort: 'medium' } },
      { id: 'high', translationKey: 'high', icon: Sparkles, color: 'text-indigo-600', thinkingParam: { reasoning_effort: 'high' } },
    ],
  },
  cursor: {
    descriptionKey: 'cursor',
    modes: [
      { id: 'none', translationKey: 'none', icon: null, color: 'text-gray-600' },
      { id: 'think', translationKey: 'think', icon: Brain, color: 'text-blue-600', prefix: 'think' },
      { id: 'deep', translationKey: 'deep', icon: Zap, color: 'text-purple-600', prefix: 'think deeply' },
    ],
  },
  gemini: {
    descriptionKey: 'gemini',
    modes: [
      { id: 'none', translationKey: 'none', icon: null, color: 'text-gray-600' },
      { id: 'light', translationKey: 'light', icon: Brain, color: 'text-blue-600', thinkingParam: { thinkingBudget: 1024 } },
      { id: 'moderate', translationKey: 'moderate', icon: Zap, color: 'text-purple-600', thinkingParam: { thinkingBudget: 4096 } },
      { id: 'deep', translationKey: 'deep', icon: Sparkles, color: 'text-indigo-600', thinkingParam: { thinkingBudget: 16384 } },
    ],
  },
  kimi: {
    descriptionKey: 'kimi',
    modes: [
      { id: 'none', translationKey: 'none', icon: null, color: 'text-gray-600' },
      { id: 'on', translationKey: 'on', icon: Brain, color: 'text-blue-600', thinkingParam: { thinking: true } },
    ],
  },
};

export function getProviderThinkingConfig(provider: string): ProviderThinkingConfig | null {
  return PROVIDER_THINKING_CONFIGS[provider] || null;
}

export function getThinkingModeById(provider: string, modeId: string): ThinkingModeDef | null {
  const config = PROVIDER_THINKING_CONFIGS[provider];
  if (!config) return null;
  return config.modes.find((m) => m.id === modeId) || null;
}
