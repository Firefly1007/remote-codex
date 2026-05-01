import { useTranslation } from 'react-i18next';
import type { FileTreeNode } from '../types';
import ProjectStructureNode from './ProjectStructureNode';

type ProjectStructureTreeProps = {
  files: FileTreeNode[];
  expandedDirs: Set<string>;
  selectedFilePath: string | null;
  onToggleDir: (path: string) => void;
  onSelectFile: (path: string) => void;
  error?: string | null;
};

export default function ProjectStructureTree({
  files,
  expandedDirs,
  selectedFilePath,
  onToggleDir,
  onSelectFile,
  error,
}: ProjectStructureTreeProps) {
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">{t('structure.noFilesFound')}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto overscroll-contain">
      <div className="py-1">
        {files.map((node) => (
          <ProjectStructureNode
            key={node.path}
            node={node}
            level={0}
            expandedDirs={expandedDirs}
            selectedFilePath={selectedFilePath}
            onToggleDir={onToggleDir}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    </div>
  );
}
