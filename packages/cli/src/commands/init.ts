import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import { CLIConfig } from '@docs/shared';

export async function initCommand() {
  console.log(chalk.blue('📚 Initializing Enterprise Documentation System\n'));

  const response = await prompts([
    {
      type: 'text',
      name: 'apiEndpoint',
      message: 'API Endpoint URL:',
      initial: 'http://localhost:4000/api',
    },
    {
      type: 'text',
      name: 'projectId',
      message: 'Project ID:',
      initial: 'default',
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key:',
    },
    {
      type: 'text',
      name: 'contentDirectory',
      message: 'Content directory:',
      initial: './docs',
    },
  ]);

  if (!response.apiKey) {
    console.log(chalk.red('❌ API key is required'));
    process.exit(1);
  }

  const config: CLIConfig = {
    apiEndpoint: response.apiEndpoint,
    projectId: response.projectId,
    apiKey: response.apiKey,
    contentDirectory: response.contentDirectory,
  };

  const configPath = path.join(process.cwd(), 'docs.config.json');

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green(`✅ Configuration saved to ${configPath}`));
    console.log(chalk.yellow('\n⚠️  Add docs.config.json to .gitignore to protect your API key'));

    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignore.includes('docs.config.json')) {
        fs.appendFileSync(gitignorePath, '\ndocs.config.json\n');
        console.log(chalk.green('✅ Added docs.config.json to .gitignore'));
      }
    } else {
      fs.writeFileSync(gitignorePath, 'docs.config.json\n');
      console.log(chalk.green('✅ Created .gitignore with docs.config.json'));
    }

    // Create sample docs directory
    const docsDir = path.join(process.cwd(), response.contentDirectory);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });

      // Create sample file
      const sampleFile = path.join(docsDir, 'getting-started.md');
      const sampleContent = `---
title: Getting Started
order: 1
---

# Getting Started

Welcome to your documentation!

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Add your documentation here in Markdown format.
`;
      fs.writeFileSync(sampleFile, sampleContent);
      console.log(chalk.green(`✅ Created sample documentation in ${docsDir}`));
    }

    console.log(chalk.blue('\n🚀 Ready to sync! Run: docs-cli sync'));
  } catch (error: any) {
    console.log(chalk.red(`❌ Failed to save configuration: ${error.message}`));
    process.exit(1);
  }
}
