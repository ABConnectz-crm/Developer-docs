import { CopyButton } from '@/components/CopyButton';
import { Mermaid } from '@/components/Mermaid';

// Custom MDX components
export const mdxComponents = {
  // Custom code block with copy button
  pre: ({ children, ...props }: any) => {
    const codeString = children?.props?.children || '';
    const language = children?.props?.className?.replace('language-', '') || '';

    // Check if it's a mermaid diagram
    if (language === 'mermaid') {
      return <Mermaid chart={codeString} />;
    }

    return (
      <div className="relative group">
        <CopyButton text={codeString} />
        <pre {...props}>{children}</pre>
      </div>
    );
  },

  // Custom code inline
  code: ({ children, ...props }: any) => (
    <code
      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200"
      {...props}
    >
      {children}
    </code>
  ),

  // Custom heading with anchor
  h1: ({ children, ...props }: any) => (
    <h1
      className="text-4xl font-bold text-slate-900 dark:text-white mt-8 mb-4"
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({ children, ...props }: any) => (
    <h2
      className="text-3xl font-semibold text-slate-900 dark:text-white mt-8 mb-4"
      {...props}
    >
      {children}
    </h2>
  ),

  h3: ({ children, ...props }: any) => (
    <h3
      className="text-2xl font-semibold text-slate-900 dark:text-white mt-6 mb-3"
      {...props}
    >
      {children}
    </h3>
  ),

  h4: ({ children, ...props }: any) => (
    <h4
      className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-3"
      {...props}
    >
      {children}
    </h4>
  ),

  // Custom paragraph
  p: ({ children, ...props }: any) => (
    <p className="text-slate-700 dark:text-slate-300 leading-7 mb-4" {...props}>
      {children}
    </p>
  ),

  // Custom link
  a: ({ children, ...props }: any) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:underline"
      {...props}
    >
      {children}
    </a>
  ),

  // Custom list
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2" {...props}>
      {children}
    </ul>
  ),

  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2" {...props}>
      {children}
    </ol>
  ),

  // Custom blockquote
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Custom table
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table
        className="min-w-full divide-y divide-slate-200 dark:divide-slate-700"
        {...props}
      >
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }: any) => (
    <thead className="bg-slate-50 dark:bg-slate-800" {...props}>
      {children}
    </thead>
  ),

  th: ({ children, ...props }: any) => (
    <th
      className="px-4 py-2 text-left text-sm font-semibold text-slate-900 dark:text-white"
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }: any) => (
    <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300" {...props}>
      {children}
    </td>
  ),

  // Custom hr
  hr: (props: any) => (
    <hr className="my-8 border-slate-200 dark:border-slate-700" {...props} />
  ),
};
