import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileCode } from 'lucide-react';
import { useFileContent } from '../hooks/useFileContent';
import { Button } from '../../../shared/view/ui';
import MarkdownRenderer from './MarkdownRenderer';
import CodeHighlighter from './CodeHighlighter';

function isMarkdownFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith('.md') || lower.endsWith('.mdx');
}

type ProjectStructurePreviewProps = {
  projectName: string;
  filePath: string | null;
  isMobile: boolean;
  onBack?: () => void;
};

export default function ProjectStructurePreview({
  projectName,
  filePath,
  isMobile,
  onBack,
}: ProjectStructurePreviewProps) {
  const { t } = useTranslation();
  const { content, loading, error, isBinary, isTruncated, isImage, imageUrl } = useFileContent(projectName, filePath);

  if (!filePath) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <FileCode className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('structure.noFileSelected')}</p>
        </div>
      </div>
    );
  }

  const fileName = filePath.split(/[/\\]/).pop() ?? filePath;
  const isMarkdown = isMarkdownFile(fileName);

  return (
    <div className="flex h-full flex-col">
      {/* Preview header */}
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        {isMobile && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-7 w-7 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <span className="truncate text-xs text-muted-foreground" title={filePath}>
          {fileName}
        </span>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : isBinary ? (
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-center">
              <FileCode className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t('structure.binaryFile')}</p>
            </div>
          </div>
        ) : isImage ? (
          <div className="flex h-full items-center justify-center p-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={fileName}
                className="max-h-full max-w-full object-contain"
              />
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
        ) : content !== null ? (
          <>
            {isTruncated && (
              <div className="sticky top-0 z-10 bg-warning/10 px-3 py-1.5 text-center text-xs text-warning-foreground">
                {t('structure.fileTooLarge')}
              </div>
            )}
            {isMarkdown ? (
              <MarkdownRenderer content={content} />
            ) : (
              <CodeHighlighter content={content} fileName={fileName} />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
