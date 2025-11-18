import { BookOpen, Upload, Search, FileDown } from 'lucide-react';

export default function DocsIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Welcome to the Documentation System
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Professional-grade documentation management for enterprise teams
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <FeatureBox
          icon={<Upload className="w-6 h-6" />}
          title="CLI Upload"
          description="Sync your documentation using the command-line interface. Run 'docs-cli sync' to upload your markdown files."
        />
        <FeatureBox
          icon={<Search className="w-6 h-6" />}
          title="Full-Text Search"
          description="Powerful PostgreSQL-powered search with highlighting and relevance ranking."
        />
        <FeatureBox
          icon={<BookOpen className="w-6 h-6" />}
          title="Hierarchical Navigation"
          description="Organize documentation in nested structures using the ltree database pattern."
        />
        <FeatureBox
          icon={<FileDown className="w-6 h-6" />}
          title="Export to DOCX"
          description="Export documentation to Word documents with corporate templates using Pandoc."
        />
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Getting Started
        </h2>
        <ol className="space-y-3 text-slate-700 dark:text-slate-300">
          <li className="flex gap-3">
            <span className="font-semibold text-blue-600 dark:text-blue-400">1.</span>
            <span>Install the CLI tool: <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">npm install -g @docs/cli</code></span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-blue-600 dark:text-blue-400">2.</span>
            <span>Initialize your project: <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">docs-cli init</code></span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-blue-600 dark:text-blue-400">3.</span>
            <span>Write your documentation in Markdown files</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-blue-600 dark:text-blue-400">4.</span>
            <span>Sync to the server: <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">docs-cli sync</code></span>
          </li>
        </ol>
      </div>
    </div>
  );
}

function FeatureBox({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-blue-600 dark:text-blue-400">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{description}</p>
    </div>
  );
}
