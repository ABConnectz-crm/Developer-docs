import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Document } from './document.entity';

@Entity('content_versions')
export class ContentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne(() => Document, (document) => document.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Column({ type: 'varchar', length: 100, default: 'HEAD' })
  versionTag: string;

  @Column({ type: 'text' })
  contentMd: string;

  @Column({ type: 'jsonb', default: {} })
  frontmatter: Record<string, any>;

  @Column({ type: 'varchar', length: 64 })
  contentHash: string;

  // Full-text search vector
  @Index('content_search_idx')
  @Column({ type: 'tsvector', select: false, nullable: true })
  searchVector: string;

  @CreateDateColumn()
  createdAt: Date;
}
