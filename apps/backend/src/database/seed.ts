import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'enterprise_docs',
  synchronize: false,
  logging: true,
});

const demoDocuments = [
  {
    path: 'getting_started',
    slug: 'getting-started',
    title: 'Getting Started',
    order: 1,
    content: `# Getting Started

Welcome to the Enterprise Documentation System!

This guide will help you get up and running quickly.

## Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Docker (optional)

## Quick Start

\`\`\`bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start services
docker-compose up -d
\`\`\`

## Next Steps

- [Installation Guide](installation)
- [Configuration](configuration)
- [CLI Usage](cli-usage)`,
    frontmatter: { title: 'Getting Started', order: 1, status: 'published' },
  },
  {
    path: 'installation',
    slug: 'installation',
    title: 'Installation',
    order: 2,
    content: `# Installation Guide

## Docker Installation

The easiest way to get started is with Docker:

\`\`\`bash
docker-compose up -d
\`\`\`

This will start:
- PostgreSQL database
- NestJS backend API
- Next.js frontend

## Manual Installation

If you prefer to run services manually:

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Setup Database

\`\`\`bash
createdb enterprise_docs
psql enterprise_docs < apps/backend/src/database/migrations/001-init.sql
\`\`\`

### 3. Configure Environment

Create \`.env\` files:

\`\`\`env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=enterprise_docs
DB_USER=postgres
DB_PASSWORD=your_password
\`\`\`

### 4. Start Services

\`\`\`bash
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
\`\`\``,
    frontmatter: { title: 'Installation', order: 2, status: 'published' },
  },
  {
    path: 'api',
    slug: 'api',
    title: 'API Documentation',
    order: 3,
    content: `# API Documentation

The backend API provides RESTful endpoints for managing documentation.

## Base URL

\`\`\`
http://localhost:4000/api
\`\`\`

## Authentication

API requests require an API key in the Authorization header:

\`\`\`http
Authorization: Bearer your-api-key
\`\`\`

## Endpoints Overview

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /docs/upload | Upload documentation ZIP |
| GET | /docs/:id | Get document by ID |
| PUT | /docs/:id | Update document |
| DELETE | /docs/:id | Delete document |
| GET | /docs/tree/:projectId | Get navigation tree |
| GET | /docs/search | Search documents |

## Examples

### Get Document

\`\`\`bash
curl -X GET http://localhost:4000/api/docs/{documentId}
\`\`\`

### Search Documents

\`\`\`bash
curl -X GET "http://localhost:4000/api/docs/search?projectId=default&q=installation"
\`\`\`

### Update Document

\`\`\`bash
curl -X PUT http://localhost:4000/api/docs/{documentId} \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "# Updated Content",
    "frontmatter": {"title": "New Title"}
  }'
\`\`\``,
    frontmatter: { title: 'API Documentation', order: 3, status: 'published' },
  },
  {
    path: 'api.endpoints',
    slug: 'endpoints',
    title: 'API Endpoints',
    order: 1,
    content: `# API Endpoints Reference

## Document Management

### Upload Documents

\`\`\`http
POST /api/docs/upload
Content-Type: multipart/form-data

file: <zip-file>
projectId: <project-id>
versionTag: HEAD
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "result": {
    "created": 5,
    "updated": 2,
    "deleted": 1,
    "errors": []
  }
}
\`\`\`

### Get Document

\`\`\`http
GET /api/docs/:documentId
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Getting Started",
    "content": "# Getting Started...",
    "frontmatter": {}
  }
}
\`\`\`

### Update Document

\`\`\`http
PUT /api/docs/:documentId
Content-Type: application/json

{
  "content": "# Updated content",
  "frontmatter": {"title": "New Title"},
  "versionTag": "HEAD"
}
\`\`\`

### Delete Document

\`\`\`http
DELETE /api/docs/:documentId
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Document deleted successfully"
}
\`\`\``,
    frontmatter: { title: 'API Endpoints', order: 1, status: 'published' },
  },
  {
    path: 'cli',
    slug: 'cli',
    title: 'CLI Tool',
    order: 4,
    content: `# CLI Tool

The \`docs-cli\` tool allows you to sync documentation from your local filesystem to the server.

## Installation

\`\`\`bash
npm install -g @docs/cli
\`\`\`

## Commands

### Initialize

Setup a new documentation project:

\`\`\`bash
docs-cli init
\`\`\`

This will prompt you for:
- API endpoint URL
- Project ID
- API key
- Content directory

### Sync

Upload your documentation to the server:

\`\`\`bash
docs-cli sync
\`\`\`

Options:
- \`-d, --directory <path>\` - Documentation directory (default: ./docs)
- \`-v, --version <tag>\` - Version tag (default: HEAD)

## Workflow

1. Write documentation in Markdown
2. Add frontmatter to each file:

\`\`\`markdown
---
title: My Document
order: 1
---

# My Document

Content here...
\`\`\`

3. Run \`docs-cli sync\` to upload
4. View your documentation at the web interface`,
    frontmatter: { title: 'CLI Tool', order: 4, status: 'published' },
  },
  {
    path: 'architecture',
    slug: 'architecture',
    title: 'Architecture',
    order: 5,
    content: `# System Architecture

## Overview

The system uses a modern, scalable architecture:

\`\`\`mermaid
graph TB
    A[CLI Tool] -->|Upload ZIP| B[NestJS Backend]
    B -->|Store| C[PostgreSQL]
    C -->|ltree queries| B
    B -->|API| D[Next.js Frontend]
    D -->|Server-Side Render| E[Browser]
\`\`\`

## Components

### Frontend (Next.js 14)
- **App Router**: File-based routing
- **RSC**: Server-side rendering
- **MDX**: Rich markdown support
- **Tailwind CSS**: Styling

### Backend (NestJS)
- **TypeORM**: Database ORM
- **Multer**: File upload handling
- **Pandoc**: Document conversion
- **JWT**: Authentication

### Database (PostgreSQL)
- **ltree**: Hierarchical data
- **tsvector**: Full-text search
- **JSONB**: Flexible metadata

## Data Flow

1. **Write**: Developer writes markdown locally
2. **Sync**: CLI uploads to backend
3. **Process**: Backend parses and stores
4. **Query**: Frontend fetches via API
5. **Render**: Server renders MDX
6. **Display**: User sees formatted docs

## Security

- API key authentication
- HTTPS encryption
- SQL injection prevention
- XSS protection`,
    frontmatter: { title: 'Architecture', order: 5, status: 'published' },
  },
];

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database\n');

    // Generate API key
    const apiKey = uuidv4();
    const apiKeyHash = await bcrypt.hash(apiKey, 10);

    // Create default project
    const result = await AppDataSource.query(
      `INSERT INTO projects (name, slug, repository_url, api_key_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET api_key_hash = $4
       RETURNING id`,
      ['Default Project', 'default', 'https://github.com/your-org/docs', apiKeyHash]
    );

    const projectId = result[0].id;
    console.log('✅ Created default project\n');

    // Insert demo documents
    let docsCreated = 0;
    for (const doc of demoDocuments) {
      // Create document
      const docResult = await AppDataSource.query(
        `INSERT INTO documents (project_id, path, slug, title, order_index)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [projectId, doc.path, doc.slug, doc.title, doc.order]
      );

      if (docResult.length > 0) {
        const documentId = docResult[0].id;

        // Calculate content hash
        const contentHash = crypto
          .createHash('sha256')
          .update(doc.content)
          .digest('hex');

        // Create content version
        await AppDataSource.query(
          `INSERT INTO content_versions (document_id, version_tag, content_md, frontmatter, content_hash)
           VALUES ($1, $2, $3, $4, $5)`,
          [documentId, 'HEAD', doc.content, JSON.stringify(doc.frontmatter), contentHash]
        );

        docsCreated++;
        console.log(`  ✅ Created: ${doc.title}`);
      }
    }

    console.log(`\n✅ Created ${docsCreated} demo documents\n`);
    console.log('📋 Project Details:');
    console.log(`  Project ID: ${projectId}`);
    console.log(`  Project Slug: default`);
    console.log(`  API Key: ${apiKey}`);
    console.log('\n⚠️  Save this API key! It will not be shown again.');
    console.log('\n🚀 Use this API key in your CLI configuration:');
    console.log(`  docs-cli init`);
    console.log(`  API Key: ${apiKey}`);
    console.log('\n📚 View demo documentation at: http://localhost:3000/docs');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
