import Link from 'next/link';
import { BookOpen, Zap, Shield, Code } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Enterprise Documentation System
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Professional-grade, self-hosted documentation management with advanced
            features for modern development teams
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/docs"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              View Documentation
            </Link>
            <Link
              href="/api/docs/health"
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              API Health
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Docs-as-Code"
            description="Version-controlled documentation that lives alongside your codebase"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Lightning Fast"
            description="Server-side rendering with ltree database structure for instant navigation"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Enterprise Ready"
            description="SSO integration, RBAC, and complete data sovereignty"
          />
          <FeatureCard
            icon={<Code className="w-8 h-8" />}
            title="Developer Friendly"
            description="CLI-driven workflow, MDX support, and syntax highlighting"
          />
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Technology Stack
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <TechItem title="Frontend" items={['Next.js 14', 'React Server Components', 'Tailwind CSS']} />
            <TechItem title="Backend" items={['NestJS', 'TypeORM', 'PostgreSQL']} />
            <TechItem title="Features" items={['ltree hierarchy', 'Full-text search', 'Pandoc export']} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <div className="text-blue-600 dark:text-blue-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

function TechItem({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-600 dark:text-slate-300">• {item}</li>
        ))}
      </ul>
    </div>
  );
}
