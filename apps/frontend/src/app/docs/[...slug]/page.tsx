import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { mdxComponents } from '@/lib/mdx-components';

// Mock function to get documents by path
// In production, this would query the backend API by ltree path
async function getDocumentByPath(path: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'default';

  try {
    // First get the document tree to find the document ID by path
    const treeResponse = await fetch(`${API_URL}/docs/tree/${projectId}`, {
      cache: 'no-store',
    });

    if (!treeResponse.ok) {
      return null;
    }

    const treeData = await treeResponse.json();
    const tree = treeData.data || [];

    // Recursively find document by path
    function findByPath(nodes: any[], targetPath: string): any {
      for (const node of nodes) {
        if (node.path === targetPath) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findByPath(node.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    }

    const doc = findByPath(tree, path);
    if (!doc) return null;

    // Now fetch the actual document content
    const docResponse = await fetch(`${API_URL}/docs/${doc.id}`, {
      cache: 'no-store',
    });

    if (!docResponse.ok) {
      return null;
    }

    const docData = await docResponse.json();
    return docData.data;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

export default async function DocumentPage({ params }: { params: { slug: string[] } }) {
  // Convert slug array to ltree path
  const ltreePath = params.slug.join('.');

  const document = await getDocumentByPath(ltreePath);

  if (!document) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          {document.title}
        </h1>

        {document.frontmatter?.description && (
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            {document.frontmatter.description}
          </p>
        )}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
          <MDXRemote
            source={document.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                  [rehypePrettyCode, { theme: 'github-dark' }],
                ],
              },
            }}
          />
        </div>

        {document.frontmatter?.tags && document.frontmatter.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              {document.frontmatter.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          <p>Last updated: {new Date(document.updatedAt).toLocaleDateString()}</p>
        </div>
      </article>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const ltreePath = params.slug.join('.');
  const document = await getDocumentByPath(ltreePath);

  if (!document) {
    return {
      title: 'Document Not Found',
    };
  }

  return {
    title: `${document.title} - Enterprise Docs`,
    description: document.frontmatter?.description || document.title,
  };
}
