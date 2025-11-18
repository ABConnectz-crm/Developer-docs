'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X, BookOpen } from 'lucide-react';
import { NavigationNode } from '@docs/shared';
import { getDocumentTree } from '@/lib/api';
import Link from 'next/link';

const DEFAULT_PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || 'default';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navigation, setNavigation] = useState<NavigationNode[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNavigation = async () => {
      try {
        const tree = await getDocumentTree(DEFAULT_PROJECT_ID);
        setNavigation(tree);
      } catch (error) {
        console.error('Failed to load navigation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNavigation();
  }, []);

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <BookOpen size={20} />
            <span>Docs</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-600 dark:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>
        {loading ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            Loading...
          </div>
        ) : (
          <Sidebar navigation={navigation} />
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 dark:text-slate-300"
            >
              <Menu size={24} />
            </button>
            <SearchBar projectId={DEFAULT_PROJECT_ID} />
          </div>
          <ThemeToggle />
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
