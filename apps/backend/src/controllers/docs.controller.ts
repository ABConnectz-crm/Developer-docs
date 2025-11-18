import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Query,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Res,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocsIngestionService } from '../services/docs-ingestion.service';
import { ExportService, ExportOptions } from '../services/export.service';

@Controller('docs')
export class DocsController {
  private readonly logger = new Logger(DocsController.name);

  constructor(
    private readonly docsService: DocsIngestionService,
    private readonly exportService: ExportService,
  ) {}

  /**
   * Upload and sync documents
   * POST /api/docs/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  }))
  async uploadDocuments(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
    @Body('versionTag') versionTag?: string,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    if (!projectId) {
      throw new HttpException('Project ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.docsService.processUpload(
        file,
        projectId,
        versionTag || 'HEAD',
      );

      return {
        success: true,
        result,
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get document tree/navigation
   * GET /api/docs/tree/:projectId
   */
  @Get('tree/:projectId')
  async getDocumentTree(@Param('projectId') projectId: string) {
    try {
      const tree = await this.docsService.getDocumentTree(projectId);
      return {
        success: true,
        data: tree,
      };
    } catch (error) {
      this.logger.error(`Failed to get document tree: ${error.message}`);
      throw new HttpException(
        `Failed to get document tree: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get document by ID
   * GET /api/docs/:documentId
   */
  @Get(':documentId')
  async getDocument(@Param('documentId') documentId: string) {
    try {
      const document = await this.docsService.getDocumentById(documentId);

      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: document,
      };
    } catch (error) {
      this.logger.error(`Failed to get document: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to get document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search documents
   * GET /api/docs/search?projectId=xxx&q=query
   */
  @Get('search')
  async searchDocuments(
    @Query('projectId') projectId: string,
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    if (!projectId || !query) {
      throw new HttpException(
        'Project ID and query are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const results = await this.docsService.searchDocuments(
        projectId,
        query,
        limit ? parseInt(limit.toString()) : 10,
      );

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw new HttpException(
        `Search failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Export document
   * POST /api/docs/export/:documentId
   */
  @Post('export/:documentId')
  async exportDocument(
    @Param('documentId') documentId: string,
    @Body() options: ExportOptions,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.exportService.exportDocument(documentId, options);

      const mimeTypes = {
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        pdf: 'application/pdf',
        html: 'text/html',
      };

      res.setHeader('Content-Type', mimeTypes[options.format]);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="document.${options.format}"`,
      );
      res.send(buffer);
    } catch (error) {
      this.logger.error(`Export failed: ${error.message}`);
      throw new HttpException(
        `Export failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update document content
   * PUT /api/docs/:documentId
   */
  @Put(':documentId')
  async updateDocument(
    @Param('documentId') documentId: string,
    @Body('content') content: string,
    @Body('frontmatter') frontmatter?: Record<string, any>,
    @Body('versionTag') versionTag?: string,
  ) {
    if (!content) {
      throw new HttpException('Content is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.docsService.updateDocument(
        documentId,
        content,
        frontmatter || {},
        versionTag || 'HEAD',
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Update failed: ${error.message}`);
      throw new HttpException(
        `Update failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete document
   * DELETE /api/docs/:documentId
   */
  @Delete(':documentId')
  async deleteDocument(@Param('documentId') documentId: string) {
    try {
      await this.docsService.deleteDocument(documentId);

      return {
        success: true,
        message: 'Document deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Delete failed: ${error.message}`);
      throw new HttpException(
        `Delete failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check
   * GET /api/docs/health
   */
  @Get('health')
  async healthCheck() {
    const pandocAvailable = await this.exportService.isPandocAvailable();

    return {
      success: true,
      services: {
        api: 'operational',
        pandoc: pandocAvailable ? 'operational' : 'unavailable',
      },
    };
  }
}
