import axios from 'axios';
import { DocumentWithContent, NavigationNode, SearchResult } from '@docs/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getDocumentTree(projectId: string): Promise<NavigationNode[]> {
  const response = await api.get(`/docs/tree/${projectId}`);
  return response.data.data;
}

export async function searchDocuments(
  projectId: string,
  query: string,
  limit?: number,
): Promise<SearchResult[]> {
  const response = await api.get('/docs/search', {
    params: { projectId, q: query, limit },
  });
  return response.data.data;
}

export async function getDocument(
  documentId: string,
): Promise<DocumentWithContent | null> {
  try {
    const response = await api.get(`/docs/${documentId}`);
    return response.data.data;
  } catch (error) {
    return null;
  }
}

export async function exportDocument(
  documentId: string,
  format: 'docx' | 'pdf' | 'html',
): Promise<Blob> {
  const response = await api.post(
    `/docs/export/${documentId}`,
    { format },
    { responseType: 'blob' },
  );
  return response.data;
}

export async function updateDocument(
  documentId: string,
  content: string,
  frontmatter?: Record<string, any>,
  versionTag?: string,
): Promise<DocumentWithContent> {
  const response = await api.put(`/docs/${documentId}`, {
    content,
    frontmatter,
    versionTag,
  });
  return response.data.data;
}

export async function deleteDocument(documentId: string): Promise<void> {
  await api.delete(`/docs/${documentId}`);
}

export async function uploadDocuments(
  file: File,
  projectId: string,
  versionTag: string = 'HEAD',
): Promise<{
  created: number;
  updated: number;
  deleted: number;
  errors: Array<{ file: string; error: string }>;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);
  formData.append('versionTag', versionTag);

  const response = await api.post('/docs/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.result;
}
