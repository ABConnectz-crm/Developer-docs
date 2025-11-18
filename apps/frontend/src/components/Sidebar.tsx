'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { NavigationNode } from '@docs/shared';

interface SidebarProps {
  navigation: NavigationNode[];
  currentPath?: string;
}

export function Sidebar({ navigation, currentPath }: SidebarProps) {
  return (
    <nav className="h-full overflow-y-auto sidebar-scroll py-4">
      <div className="px-3">
        {navigation.map((node) => (
          <NavigationItem
            key={node.id}
            node={node}
            currentPath={currentPath}
            level={0}
          />
        ))}
      </div>
    </nav>
  );
}

interface NavigationItemProps {
  node: NavigationNode;
  currentPath?: string;
  level: number;
}

function NavigationItem({ node, currentPath, level }: NavigationItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = currentPath === node.path;

  // Convert ltree path (dots) to URL path (slashes)
  const urlPath = node.path.replace(/\./g, '/');

  return (
    <div className="mb-1">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-medium'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        )}
        {!hasChildren && <FileText size={14} className="text-slate-400 dark:text-slate-500" />}
        <Link href={`/docs/${urlPath}`} className="flex-1">
          {node.title}
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <NavigationItem
              key={child.id}
              node={child}
              currentPath={currentPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
