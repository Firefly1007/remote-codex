/**
 * i18n Configuration
 *
 * Configures i18next for internationalization support.
 * Language is fixed to zh-CN (Simplified Chinese).
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation resources (Chinese only)
import zhCommon from './locales/zh-CN/common.json';
import zhSettings from './locales/zh-CN/settings.json';
import zhAuth from './locales/zh-CN/auth.json';
import zhSidebar from './locales/zh-CN/sidebar.json';
import zhChat from './locales/zh-CN/chat.json';
// eslint-disable-next-line import-x/order
import zhCodeEditor from './locales/zh-CN/codeEditor.json';
// eslint-disable-next-line import-x/order
import zhTasks from './locales/zh-CN/tasks.json';


// Language is fixed to zh-CN
const getSavedLanguage = () => 'zh-CN';

// Initialize i18next
i18n
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    // Resources containing all translations (Chinese only)
    resources: {
      'zh-CN': {
        common: zhCommon,
        settings: zhSettings,
        auth: zhAuth,
        sidebar: zhSidebar,
        chat: zhChat,
        codeEditor: zhCodeEditor,
        tasks: zhTasks,
      },
    },

    // Default language
    lng: getSavedLanguage(),

    // Fallback language when a translation is missing
    fallbackLng: 'zh-CN',

    // Enable debug mode in development (logs missing keys to console)
    debug: import.meta.env.DEV,

    // Namespaces - load only what's needed
    ns: ['common', 'settings', 'auth', 'sidebar', 'chat', 'codeEditor', 'tasks'],
    defaultNS: 'common',

    // Key separator for nested keys (default: '.')
    keySeparator: '.',

    // Namespace separator (default: ':')
    nsSeparator: ':',

    // Save missing translations (disabled - requires manual review)
    saveMissing: false,

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React-specific settings
    react: {
      useSuspense: true, // Use Suspense for lazy-loading
      bindI18n: 'languageChanged', // Re-render on language change
      bindI18nStore: false, // Don't re-render on resource changes
    },

  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('userLanguage', lng);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
});

export default i18n;
