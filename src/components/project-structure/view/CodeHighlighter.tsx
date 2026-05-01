import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../../contexts/ThemeContext';
import SyntaxHighlighter from './prismLanguages';

type CodeHighlighterProps = {
  content: string;
  fileName: string;
};

const EXT_TO_LANGUAGE: Record<string, string> = {
  // JavaScript / TypeScript
  js: 'javascript', jsx: 'jsx', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'tsx', mts: 'typescript', cts: 'typescript',
  // Web
  html: 'html', htm: 'html', css: 'css', scss: 'scss', sass: 'sass',
  less: 'less', vue: 'vue', svelte: 'svelte', svg: 'xml',
  // JSON / YAML / TOML
  json: 'json', jsonc: 'json', json5: 'json',
  yaml: 'yaml', yml: 'yaml', toml: 'toml',
  // Python
  py: 'python', pyw: 'python', pyi: 'python',
  // Rust
  rs: 'rust',
  // Go
  go: 'go',
  // C / C++
  c: 'c', h: 'c', cpp: 'cpp', cxx: 'cpp', cc: 'cpp', hpp: 'cpp', hxx: 'cpp',
  // C#
  cs: 'csharp', csharp: 'csharp',
  // Java
  java: 'java',
  // Kotlin
  kt: 'kotlin', kts: 'kotlin',
  // Swift
  swift: 'swift',
  // Ruby
  rb: 'ruby', erb: 'erb',
  // PHP
  php: 'php',
  // Shell
  sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'powershell',
  ps1: 'powershell', psm1: 'powershell',
  bat: 'bat', cmd: 'bat',
  // SQL
  sql: 'sql', mysql: 'sql', pgsql: 'sql', sqlite: 'sql',
  // Markdown / Text
  md: 'markdown', mdx: 'markdown', txt: 'text', text: 'text', log: 'text',
  // Config / Infra
  dockerfile: 'dockerfile', docker: 'dockerfile',
  makefile: 'makefile', mk: 'makefile',
  xml: 'xml', xsd: 'xml', xsl: 'xml',
  ini: 'ini', cfg: 'ini', conf: 'ini', env: 'ini',
  graphql: 'graphql', gql: 'graphql',
  // Lua
  lua: 'lua',
  // Dart / Flutter
  dart: 'dart',
  // R
  r: 'r',
  // Haskell
  hs: 'haskell', lhs: 'haskell',
  // Scala
  scala: 'scala', sc: 'scala',
  // Elixir / Erlang
  ex: 'elixir', exs: 'elixir', erl: 'erlang',
  // Zig
  zig: 'zig',
  // Misc
  proto: 'protobuf',
  tf: 'hcl', hcl: 'hcl',
  nginx: 'nginx',
  diff: 'diff', patch: 'diff',
  csv: 'csv',
};

function getLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (EXT_TO_LANGUAGE[ext]) return EXT_TO_LANGUAGE[ext];
  // Handle special filenames
  const lower = fileName.toLowerCase();
  if (lower === 'dockerfile') return 'dockerfile';
  if (lower === 'makefile' || lower === 'gnumakefile') return 'makefile';
  if (lower === '.gitignore' || lower === '.gitattributes') return 'bash';
  if (lower === '.editorconfig' || lower === '.prettierrc') return 'json';
  return 'text';
}

const lineNumberStyle: React.CSSProperties = {
  minWidth: '2.5em',
  paddingRight: '1em',
  textAlign: 'right',
  userSelect: 'none',
  opacity: 0.5,
  fontSize: '0.75rem',
};

export default function CodeHighlighter({ content, fileName }: CodeHighlighterProps) {
  const language = getLanguage(fileName);
  const { isDarkMode } = useTheme();

  return (
    <SyntaxHighlighter
      language={language}
      style={isDarkMode ? vscDarkPlus : oneLight}
      showLineNumbers
      lineNumberStyle={lineNumberStyle}
      wrapLines
      customStyle={{
        margin: 0,
        borderRadius: 0,
        fontSize: '0.8125rem',
        lineHeight: '1.6',
        padding: '0.5rem 0',
        minHeight: '100%',
        background: 'transparent',
      }}
      codeTagProps={{
        style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
      }}
    >
      {content}
    </SyntaxHighlighter>
  );
}
