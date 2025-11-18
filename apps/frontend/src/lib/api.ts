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
