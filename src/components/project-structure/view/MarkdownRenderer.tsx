import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../../contexts/ThemeContext';
import SyntaxHighlighter from './prismLanguages';

type MarkdownRendererProps = {
  content: string;
};

function getMarkdownComponents(isDarkMode: boolean): Components {
  return {
    code: ({ className, children, ...props }) => {
      const raw = String(children ?? '').replace(/\n$/, '');
      const match = /language-(\w+)/.exec(className || '');
      const isBlock = match || /\n/.test(raw);

      if (!isBlock) {
        return (
          <code
            className="whitespace-pre-wrap break-words rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[0.9em]"
            {...props}
          >
            {children}
          </code>
        );
      }

      const language = match?.[1] ?? 'text';
      return (
        <div className="relative my-2">
          {language !== 'text' && (
            <div className="absolute left-3 top-2 z-10 text-xs font-medium uppercase text-muted-foreground/60">
              {language}
            </div>
          )}
          <SyntaxHighlighter
            language={language}
            style={isDarkMode ? vscDarkPlus : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              padding: language !== 'text' ? '2rem 1rem 1rem 1rem' : '1rem',
            }}
            codeTagProps={{
              style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
            }}
          >
            {raw}
          </SyntaxHighlighter>
        </div>
      );
    },
    h1: ({ children }) => <h1 className="mb-3 mt-4 text-xl font-bold first:mt-0">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-2 mt-3 text-lg font-semibold first:mt-0">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-1 mt-2 text-sm font-semibold first:mt-0">{children}</h4>,
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-2 border-l-4 border-border/60 pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 hover:underline dark:text-blue-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="my-2 overflow-x-auto">
        <table className="min-w-full border-collapse border border-border/60 text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/30">{children}</thead>,
    th: ({ children }) => (
      <th className="border border-border/60 px-3 py-1.5 text-left font-semibold">{children}</th>
    ),
    td: ({ children }) => (
      <td className="border border-border/60 px-3 py-1.5 align-top">{children}</td>
    ),
    hr: () => <hr className="my-4 border-border/60" />,
    img: ({ src, alt }) => <img src={src} alt={alt} className="my-2 max-w-full rounded" />,
    pre: ({ children }) => <div>{children}</div>,
  };
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const remarkPlugins = useMemo(() => [remarkGfm], []);
  const { isDarkMode } = useTheme();
  const components = useMemo(() => getMarkdownComponents(isDarkMode), [isDarkMode]);

  return (
    <div className="px-4 py-3 text-sm leading-relaxed text-foreground">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
