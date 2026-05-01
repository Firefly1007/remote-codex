import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import type { Project } from '../../../types/app';
import { useProjectStructureData } from '../hooks/useProjectStructureData';
import ProjectStructureTree from './ProjectStructureTree';
import ProjectStructurePreview from './ProjectStructurePreview';
import ProjectStructureLoadingState from './ProjectStructureEmptyState';
import { Button } from '../../../shared/view/ui';

type ProjectStructureProps = {
  selectedProject: Project;
  isMobile: boolean;
};

export default function ProjectStructure({ selectedProject, isMobile }: ProjectStructureProps) {
  const { t } = useTranslation();
  const { files, loading, error, refresh } = useProjectStructureData(selectedProject);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const handleToggleDir = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleSelectFile = useCallback((filePath: string) => {
    setSelectedFilePath(filePath);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedFilePath(null);
  }, []);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h3 className="truncate text-sm font-medium text-foreground">
            {selectedProject.displayName}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="h-7 w-7 p-0"
          title={t('structure.refresh')}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Content */}
      {loading && files.length === 0 ? (
        <ProjectStructureLoadingState />
      ) : isMobile ? (
        // Mobile: stacked layout
        selectedFilePath ? (
          <ProjectStructurePreview
            projectName={selectedProject.name}
            filePath={selectedFilePath}
            isMobile
            onBack={handleBack}
          />
        ) : (
          <ProjectStructureTree
            files={files}
            expandedDirs={expandedDirs}
            selectedFilePath={selectedFilePath}
            onToggleDir={handleToggleDir}
            onSelectFile={handleSelectFile}
            error={error}
          />
        )
      ) : (
        // Desktop: side-by-side layout
        <div className="flex min-h-0 flex-1">
          <div className="w-[35%] min-w-[200px] border-r border-border/60">
            <ProjectStructureTree
              files={files}
              expandedDirs={expandedDirs}
              selectedFilePath={selectedFilePath}
              onToggleDir={handleToggleDir}
              onSelectFile={handleSelectFile}
              error={error}
            />
          </div>
          <div className="flex-1 min-w-0">
            <ProjectStructurePreview
              projectName={selectedProject.name}
              filePath={selectedFilePath}
              isMobile={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
