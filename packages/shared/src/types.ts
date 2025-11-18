/**
 * Shared type definitions for the Enterprise Documentation System
 */

export interface Project {
  id: string;
  name: string;
  slug: string;
  repositoryUrl?: string;
  apiKeyHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  projectId: string;
  path: string; // ltree path e.g., "engineering.backend.api"
  slug: string;
  title: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentVersion {
  id: string;
  documentId: string;
  versionTag: string; // e.g., "HEAD", "v1.2.0"
  contentMd: string;
  frontmatter: Record<string, any>;
  contentHash: string;
  createdAt: Date;
}

export interface DocumentWithContent extends Document {
  content: string;
  frontmatter: Record<string, any>;
  versionTag: string;
}

export interface Frontmatter {
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  order?: number;
  status?: 'draft' | 'published' | 'archived';
  [key: string]: any;
}

export interface UploadResult {
  created: number;
  updated: number;
  deleted: number;
  errors: Array<{ file: string; error: string }>;
}

export interface SearchResult {
  documentId: string;
  title: string;
  path: string;
  snippet: string;
  rank: number;
}

export interface NavigationNode {
  id: string;
  slug: string;
  title: string;
  path: string;
  children: NavigationNode[];
  orderIndex: number;
}

export interface ExportOptions {
  format: 'docx' | 'pdf' | 'html';
  templatePath?: string;
  includeTableOfContents?: boolean;
}

export interface CLIConfig {
  projectId: string;
  apiEndpoint: string;
  apiKey: string;
  contentDirectory: string;
}
