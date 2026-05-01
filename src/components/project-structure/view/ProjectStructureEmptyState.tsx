import { useTranslation } from 'react-i18next';
import { FolderTree } from 'lucide-react';

export default function ProjectStructureEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <FolderTree className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{t('structure.loading')}</p>
      </div>
    </div>
  );
}
