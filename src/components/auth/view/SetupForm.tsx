import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AuthErrorAlert from './AuthErrorAlert';
import AuthInputField from './AuthInputField';
import AuthScreenLayout from './AuthScreenLayout';

type SetupFormState = {
  username: string;
  password: string;
  confirmPassword: string;
};

const initialState: SetupFormState = {
  username: '',
  password: '',
  confirmPassword: '',
};

function validateSetupForm(formState: SetupFormState, t: (key: string) => string): string | null {
  if (!formState.username.trim() || !formState.password || !formState.confirmPassword) {
    return t('setup.errors.fillAll');
  }

  if (formState.username.trim().length < 3) {
    return t('setup.errors.usernameLength');
  }

  if (formState.password.length < 6) {
    return t('setup.errors.passwordLength');
  }

  if (formState.password !== formState.confirmPassword) {
    return t('setup.errors.passwordMismatch');
  }

  return null;
}

export default function SetupForm() {
  const { t } = useTranslation('auth');
  const { register } = useAuth();

  const [formState, setFormState] = useState<SetupFormState>(initialState);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof SetupFormState, value: string) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage('');

      const validationError = validateSetupForm(formState, t);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      setIsSubmitting(true);
      const result = await register(formState.username.trim(), formState.password);
      if (!result.success) {
        setErrorMessage(result.error);
      }
      setIsSubmitting(false);
    },
    [formState, register],
  );

  return (
    <AuthScreenLayout
      title={t('setup.title')}
      description={t('setup.description')}
      footerText={t('setup.footer')}
      logo={<img src="/logo.svg" alt="CloudCLI" className="h-16 w-16" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInputField
          id="username"
          label={t('setup.username')}
          value={formState.username}
          onChange={(value) => updateField('username', value)}
          placeholder={t('setup.placeholders.username')}
          isDisabled={isSubmitting}
        />

        <AuthInputField
          id="password"
          label={t('setup.password')}
          value={formState.password}
          onChange={(value) => updateField('password', value)}
          placeholder={t('setup.placeholders.password')}
          isDisabled={isSubmitting}
          type="password"
        />

        <AuthInputField
          id="confirmPassword"
          label={t('setup.confirmPassword')}
          value={formState.confirmPassword}
          onChange={(value) => updateField('confirmPassword', value)}
          placeholder={t('setup.placeholders.confirmPassword')}
          isDisabled={isSubmitting}
          type="password"
        />

        <AuthErrorAlert errorMessage={errorMessage} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isSubmitting ? t('setup.loading') : t('setup.submit')}
        </button>
      </form>
    </AuthScreenLayout>
  );
}
