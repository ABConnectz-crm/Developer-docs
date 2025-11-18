import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DocsController } from './controllers/docs.controller';
import { DocsIngestionService } from './services/docs-ingestion.service';
import { ExportService } from './services/export.service';
import { Project, Document, ContentVersion } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'enterprise_docs',
      entities: [Project, Document, ContentVersion],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Project, Document, ContentVersion]),
  ],
  controllers: [DocsController],
  providers: [DocsIngestionService, ExportService],
})
export class AppModule {}
