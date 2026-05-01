import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';

// Web
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import scss from 'react-syntax-highlighter/dist/esm/languages/prism/scss';
import less from 'react-syntax-highlighter/dist/esm/languages/prism/less';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import json5 from 'react-syntax-highlighter/dist/esm/languages/prism/json5';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

// Systems
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import zig from 'react-syntax-highlighter/dist/esm/languages/prism/zig';

// Scripting
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import perl from 'react-syntax-highlighter/dist/esm/languages/prism/perl';
import lua from 'react-syntax-highlighter/dist/esm/languages/prism/lua';
import dart from 'react-syntax-highlighter/dist/esm/languages/prism/dart';
import scala from 'react-syntax-highlighter/dist/esm/languages/prism/scala';
import elixir from 'react-syntax-highlighter/dist/esm/languages/prism/elixir';
import erlang from 'react-syntax-highlighter/dist/esm/languages/prism/erlang';
import haskell from 'react-syntax-highlighter/dist/esm/languages/prism/haskell';
import r from 'react-syntax-highlighter/dist/esm/languages/prism/r';

// Shell / Config
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import makefile from 'react-syntax-highlighter/dist/esm/languages/prism/makefile';
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini';
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml';

// Data / Query
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import graphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';

// Markup / Docs
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import latex from 'react-syntax-highlighter/dist/esm/languages/prism/latex';

// Other
import protobuf from 'react-syntax-highlighter/dist/esm/languages/prism/protobuf';
import nginx from 'react-syntax-highlighter/dist/esm/languages/prism/nginx';

const languages: [string, Parameters<typeof SyntaxHighlighter.registerLanguage>[1]][] = [
  ['javascript', javascript], ['js', javascript], ['mjs', javascript], ['cjs', javascript],
  ['jsx', jsx],
  ['typescript', typescript], ['ts', typescript], ['mts', typescript], ['cts', typescript],
  ['tsx', tsx],
  ['html', html], ['htm', html], ['vue', html], ['svelte', html],
  ['css', css],
  ['scss', scss], ['sass', scss],
  ['less', less],
  ['json', json], ['jsonc', json], ['json5', json5],
  ['yaml', yaml], ['yml', yaml],
  ['xml', html], ['xsd', html], ['xsl', html],
  ['svg', html],
  ['c', c], ['h', c],
  ['cpp', cpp], ['cxx', cpp], ['cc', cpp], ['hpp', cpp],
  ['csharp', csharp], ['cs', csharp],
  ['java', java],
  ['kotlin', kotlin], ['kt', kotlin], ['kts', kotlin],
  ['swift', swift],
  ['rust', rust], ['rs', rust],
  ['go', go],
  ['zig', zig],
  ['python', python], ['py', python], ['pyw', python],
  ['ruby', ruby], ['rb', ruby],
  ['php', php],
  ['perl', perl],
  ['lua', lua],
  ['dart', dart],
  ['scala', scala], ['sc', scala],
  ['elixir', elixir], ['ex', elixir], ['exs', elixir],
  ['erlang', erlang], ['erl', erlang],
  ['haskell', haskell], ['hs', haskell],
  ['r', r],
  ['bash', bash], ['sh', bash], ['zsh', bash],
  ['powershell', powershell], ['ps1', powershell],
  ['docker', docker], ['dockerfile', docker],
  ['makefile', makefile], ['mk', makefile],
  ['ini', ini], ['cfg', ini], ['conf', ini], ['env', ini],
  ['toml', toml],
  ['sql', sql], ['mysql', sql], ['pgsql', sql],
  ['graphql', graphql], ['gql', graphql],
  ['diff', diff], ['patch', diff],
  ['markdown', markdown], ['md', markdown], ['mdx', markdown],
  ['latex', latex], ['tex', latex],
  ['protobuf', protobuf], ['proto', protobuf],
  ['nginx', nginx],
];

for (const [name, lang] of languages) {
  SyntaxHighlighter.registerLanguage(name, lang);
}

export default SyntaxHighlighter;
