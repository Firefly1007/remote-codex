import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import type { FileTreeNode } from '../types';
import { getFileIconData } from '../../file-tree/constants/fileIcons';
import { cn } from '../../../lib/utils';

type ProjectStructureNodeProps = {
  node: FileTreeNode;
  level: number;
  expandedDirs: Set<string>;
  selectedFilePath: string | null;
  onToggleDir: (path: string) => void;
  onSelectFile: (path: string) => void;
};

export default function ProjectStructureNode({
  node,
  level,
  expandedDirs,
  selectedFilePath,
  onToggleDir,
  onSelectFile,
}: ProjectStructureNodeProps) {
  const isDir = node.type === 'directory';
  const isExpanded = isDir && expandedDirs.has(node.path);
  const isSelected = !isDir && selectedFilePath === node.path;

  const handleClick = () => {
    if (isDir) {
      onToggleDir(node.path);
    } else {
      onSelectFile(node.path);
    }
  };

  const iconSizeClass = 'h-4 w-4 flex-shrink-0';

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'flex w-full items-center gap-1.5 px-2 text-left text-sm hover:bg-accent/40',
          'min-h-[44px] sm:min-h-[32px]',
          isSelected && 'bg-accent/60',
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {isDir ? (
          <>
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform',
                isExpanded && 'rotate-90',
              )}
            />
            {isExpanded ? (
              <FolderOpen className={cn(iconSizeClass, 'text-blue-500')} />
            ) : (
              <Folder className={cn(iconSizeClass, 'text-blue-500')} />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 flex-shrink-0" />
            {(() => {
              const { icon: IconComponent, color } = getFileIconData(node.name);
              return <IconComponent className={cn(iconSizeClass, color)} />;
            })()}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isDir && isExpanded && node.children?.map((child) => (
        <ProjectStructureNode
          key={child.path}
          node={child}
          level={level + 1}
          expandedDirs={expandedDirs}
          selectedFilePath={selectedFilePath}
          onToggleDir={onToggleDir}
          onSelectFile={onSelectFile}
        />
      ))}
    </>
  );
}
