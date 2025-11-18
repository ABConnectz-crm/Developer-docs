'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { searchDocuments } from '@/lib/api';
import Link from 'next/link';

interface SearchBarProps {
  projectId: string;
}

export function SearchBar({ projectId }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDocs = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchDocuments(projectId, query, 5);
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchDocs, 300);
    return () => clearTimeout(debounce);
  }, [query, projectId]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documentation..."
          className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => {
                // Convert ltree path (dots) to URL path (slashes)
                const urlPath = result.path.replace(/\./g, '/');
                return (
                  <Link
                    key={result.id}
                    href={`/docs/${urlPath}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {result.title}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {result.path}
                  </div>
                    {result.snippet && (
                      <div
                        className="text-sm text-slate-500 dark:text-slate-500 mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.snippet }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
