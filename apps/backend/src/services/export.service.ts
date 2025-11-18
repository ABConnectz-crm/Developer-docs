import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Document, ContentVersion } from '../entities';

export interface ExportOptions {
  format: 'docx' | 'pdf' | 'html';
  templatePath?: string;
  includeTableOfContents?: boolean;
}

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(ContentVersion)
    private contentVersionRepo: Repository<ContentVersion>,
  ) {}

  /**
   * Export document to specified format using Pandoc
   */
  async exportDocument(
    documentId: string,
    options: ExportOptions,
  ): Promise<Buffer> {
    try {
      // Get document and latest content
      const document = await this.documentRepo.findOne({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      const content = await this.contentVersionRepo.findOne({
        where: { documentId, versionTag: 'HEAD' },
        order: { createdAt: 'DESC' },
      });

      if (!content) {
        throw new Error(`No content found for document ${documentId}`);
      }

      // Create temporary files
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docs-export-'));
      const inputFile = path.join(tmpDir, 'input.md');
      const outputFile = path.join(tmpDir, `output.${options.format}`);

      try {
        // Write markdown to temp file
        const markdown = this.buildMarkdown(document, content);
        await fs.writeFile(inputFile, markdown, 'utf8');

        // Build Pandoc command
        const args = [
          inputFile,
          '-o', outputFile,
          '--standalone',
        ];

        if (options.includeTableOfContents) {
          args.push('--toc');
        }

        if (options.format === 'docx' && options.templatePath) {
          args.push('--reference-doc', options.templatePath);
        }

        if (options.format === 'pdf') {
          args.push('--pdf-engine=xelatex');
        }

        // Execute Pandoc
        await this.executePandoc(args);

        // Read output file
        const buffer = await fs.readFile(outputFile);

        this.logger.log(`Exported document ${documentId} to ${options.format}`);

        return buffer;
      } finally {
        // Cleanup temp files
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    } catch (error) {
      this.logger.error(`Export failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export multiple documents
   */
  async exportMultipleDocuments(
    documentIds: string[],
    options: ExportOptions,
  ): Promise<Buffer> {
    try {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docs-export-'));
      const inputFile = path.join(tmpDir, 'input.md');
      const outputFile = path.join(tmpDir, `output.${options.format}`);

      try {
        const markdownParts: string[] = [];

        for (const documentId of documentIds) {
          const document = await this.documentRepo.findOne({
            where: { id: documentId },
          });

          const content = await this.contentVersionRepo.findOne({
            where: { documentId, versionTag: 'HEAD' },
            order: { createdAt: 'DESC' },
          });

          if (document && content) {
            markdownParts.push(this.buildMarkdown(document, content));
            markdownParts.push('\n\n---\n\n'); // Page break
          }
        }

        await fs.writeFile(inputFile, markdownParts.join(''), 'utf8');

        const args = [
          inputFile,
          '-o', outputFile,
          '--standalone',
        ];

        if (options.includeTableOfContents) {
          args.push('--toc');
        }

        if (options.format === 'docx' && options.templatePath) {
          args.push('--reference-doc', options.templatePath);
        }

        await this.executePandoc(args);

        const buffer = await fs.readFile(outputFile);

        this.logger.log(`Exported ${documentIds.length} documents to ${options.format}`);

        return buffer;
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    } catch (error) {
      this.logger.error(`Multi-document export failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build complete markdown with frontmatter
   */
  private buildMarkdown(document: Document, content: ContentVersion): string {
    const parts: string[] = [];

    // Add title
    parts.push(`# ${document.title}\n\n`);

    // Add metadata if exists
    if (content.frontmatter && Object.keys(content.frontmatter).length > 0) {
      const { title, ...metadata } = content.frontmatter;
      if (Object.keys(metadata).length > 0) {
        parts.push('**Metadata:**\n\n');
        for (const [key, value] of Object.entries(metadata)) {
          parts.push(`- **${key}:** ${value}\n`);
        }
        parts.push('\n');
      }
    }

    // Add content
    parts.push(content.contentMd);

    return parts.join('');
  }

  /**
   * Execute Pandoc command
   */
  private executePandoc(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const pandoc = spawn('pandoc', args);

      let stderr = '';

      pandoc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pandoc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Pandoc exited with code ${code}: ${stderr}`));
        }
      });

      pandoc.on('error', (error) => {
        reject(new Error(`Failed to start Pandoc: ${error.message}`));
      });
    });
  }

  /**
   * Check if Pandoc is available
   */
  async isPandocAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const pandoc = spawn('pandoc', ['--version']);
      pandoc.on('close', (code) => {
        resolve(code === 0);
      });
      pandoc.on('error', () => {
        resolve(false);
      });
    });
  }
}
