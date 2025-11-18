import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as AdmZip from 'adm-zip';
import * as matter from 'gray-matter';
import * as crypto from 'crypto';
import { Document, ContentVersion, Project } from '../entities';
import { UploadResult } from '@docs/shared';

@Injectable()
export class DocsIngestionService {
  private readonly logger = new Logger(DocsIngestionService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(ContentVersion)
    private contentVersionRepo: Repository<ContentVersion>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  /**
   * Process uploaded ZIP file and sync documents to database
   */
  async processUpload(
    file: Express.Multer.File,
    projectId: string,
    versionTag: string = 'HEAD',
  ): Promise<UploadResult> {
    const result: UploadResult = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
    };

    try {
      // Verify project exists
      const project = await this.projectRepo.findOne({ where: { id: projectId } });
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Extract ZIP
      const zip = new AdmZip(file.buffer);
      const zipEntries = zip.getEntries();

      // Get existing documents for this project
      const existingDocs = await this.documentRepo.find({
        where: { projectId },
        relations: ['versions'],
      });
      const existingPaths = new Set(existingDocs.map((d) => d.path));
      const processedPaths = new Set<string>();

      // Process each markdown file
      for (const entry of zipEntries) {
        if (entry.isDirectory || !entry.name.endsWith('.md')) {
          continue;
        }

        try {
          const rawContent = entry.getData().toString('utf8');
          const { data: frontmatter, content } = matter(rawContent);

          // Convert file path to ltree path
          const ltreePath = this.transformPath(entry.entryName);
          processedPaths.add(ltreePath);

          // Extract slug from path
          const slug = this.extractSlug(entry.entryName);
          const title = frontmatter.title || this.extractTitle(entry.entryName);
          const orderIndex = frontmatter.order || 0;

          // Calculate content hash
          const contentHash = this.calculateHash(content);

          // Check if document exists
          let document = existingDocs.find((d) => d.path === ltreePath);

          if (!document) {
            // Create new document
            document = this.documentRepo.create({
              projectId,
              path: ltreePath,
              slug,
              title,
              orderIndex,
            });
            await this.documentRepo.save(document);
            result.created++;
            this.logger.log(`Created document: ${ltreePath}`);
          } else {
            // Update existing document
            document.title = title;
            document.orderIndex = orderIndex;
            document.slug = slug;
            await this.documentRepo.save(document);
          }

          // Check if content changed
          const latestVersion = await this.contentVersionRepo.findOne({
            where: { documentId: document.id, versionTag },
            order: { createdAt: 'DESC' },
          });

          if (!latestVersion || latestVersion.contentHash !== contentHash) {
            // Create new version
            const version = this.contentVersionRepo.create({
              documentId: document.id,
              versionTag,
              contentMd: content,
              frontmatter,
              contentHash,
            });
            await this.contentVersionRepo.save(version);
            result.updated++;
            this.logger.log(`Updated content for: ${ltreePath}`);
          }
        } catch (error) {
          result.errors.push({
            file: entry.entryName,
            error: error.message,
          });
          this.logger.error(`Error processing ${entry.entryName}: ${error.message}`);
        }
      }

      // Handle deletions (documents that exist in DB but not in upload)
      const deletedPaths = Array.from(existingPaths).filter(
        (path) => !processedPaths.has(path),
      );

      for (const path of deletedPaths) {
        const doc = existingDocs.find((d) => d.path === path);
        if (doc) {
          await this.documentRepo.remove(doc);
          result.deleted++;
          this.logger.log(`Deleted document: ${path}`);
        }
      }

      this.logger.log(
        `Upload complete: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted, ${result.errors.length} errors`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Upload processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transform file system path to ltree format
   * Example: "guides/getting-started/intro.md" -> "guides.getting_started.intro"
   */
  private transformPath(filePath: string): string {
    return filePath
      .replace(/\.md$/, '')
      .split('/')
      .map((segment) =>
        segment
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/^_+|_+$/g, ''),
      )
      .filter((s) => s.length > 0)
      .join('.');
  }

  /**
   * Extract slug from file path (last segment)
   */
  private extractSlug(filePath: string): string {
    const parts = filePath.replace(/\.md$/, '').split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Extract title from filename
   */
  private extractTitle(filePath: string): string {
    const parts = filePath.replace(/\.md$/, '').split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * Calculate SHA-256 hash of content
   */
  private calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get document hierarchy for navigation
   */
  async getDocumentTree(projectId: string): Promise<any[]> {
    const documents = await this.documentRepo.find({
      where: { projectId },
      order: { orderIndex: 'ASC', path: 'ASC' },
    });

    return this.buildTree(documents);
  }

  /**
   * Build nested tree structure from flat ltree paths
   */
  private buildTree(documents: Document[]): any[] {
    const tree: any[] = [];
    const pathMap = new Map<string, any>();

    for (const doc of documents) {
      const pathParts = doc.path.split('.');
      const node = {
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        path: doc.path,
        children: [],
        orderIndex: doc.orderIndex,
      };

      pathMap.set(doc.path, node);

      if (pathParts.length === 1) {
        // Root level
        tree.push(node);
      } else {
        // Find parent
        const parentPath = pathParts.slice(0, -1).join('.');
        const parent = pathMap.get(parentPath);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not found, add to root
          tree.push(node);
        }
      }
    }

    return tree;
  }

  /**
   * Get document by ID with latest content
   */
  async getDocumentById(documentId: string): Promise<any | null> {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
    });

    if (!document) {
      return null;
    }

    const content = await this.contentVersionRepo.findOne({
      where: { documentId, versionTag: 'HEAD' },
      order: { createdAt: 'DESC' },
    });

    if (!content) {
      return null;
    }

    return {
      id: document.id,
      projectId: document.projectId,
      path: document.path,
      slug: document.slug,
      title: document.title,
      orderIndex: document.orderIndex,
      content: content.contentMd,
      frontmatter: content.frontmatter,
      versionTag: content.versionTag,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  /**
   * Search documents
   */
  async searchDocuments(
    projectId: string,
    query: string,
    limit: number = 10,
  ): Promise<any[]> {
    const searchQuery = `
      SELECT
        d.id,
        d.title,
        d.path,
        d.slug,
        ts_headline('english', cv.content_md, websearch_to_tsquery('english', $1),
          'MaxWords=50, MinWords=25, ShortWord=3') as snippet,
        ts_rank(cv.search_vector, websearch_to_tsquery('english', $1)) as rank
      FROM documents d
      INNER JOIN content_versions cv ON cv.document_id = d.id
      WHERE d.project_id = $2
        AND cv.version_tag = 'HEAD'
        AND cv.search_vector @@ websearch_to_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT $3
    `;

    const results = await this.documentRepo.query(searchQuery, [
      query,
      projectId,
      limit,
    ]);

    return results;
  }

  /**
   * Update document content
   */
  async updateDocument(
    documentId: string,
    content: string,
    frontmatter: Record<string, any>,
    versionTag: string = 'HEAD',
  ): Promise<any> {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Update document metadata if provided in frontmatter
    if (frontmatter.title) {
      document.title = frontmatter.title;
    }
    if (frontmatter.order !== undefined) {
      document.orderIndex = frontmatter.order;
    }
    await this.documentRepo.save(document);

    // Calculate content hash
    const contentHash = this.calculateHash(content);

    // Create new content version
    const version = this.contentVersionRepo.create({
      documentId: document.id,
      versionTag,
      contentMd: content,
      frontmatter,
      contentHash,
    });

    await this.contentVersionRepo.save(version);

    this.logger.log(`Updated document: ${document.path}`);

    return this.getDocumentById(documentId);
  }

  /**
   * Delete document and all its versions
   */
  async deleteDocument(documentId: string): Promise<void> {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    await this.documentRepo.remove(document);

    this.logger.log(`Deleted document: ${document.path}`);
  }
}
