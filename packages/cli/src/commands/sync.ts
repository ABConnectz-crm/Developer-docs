import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import archiver from 'archiver';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import * as matter from 'gray-matter';
import { CLIConfig } from '@docs/shared';

interface SyncOptions {
  directory: string;
  version: string;
}

export async function syncCommand(options: SyncOptions) {
  console.log(chalk.blue('📚 Syncing documentation to server\n'));

  // Load configuration
  const configPath = path.join(process.cwd(), 'docs.config.json');
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('❌ Configuration file not found. Run "docs-cli init" first.'));
    process.exit(1);
  }

  const config: CLIConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Resolve content directory
  const contentDir = path.resolve(process.cwd(), config.contentDirectory || options.directory);

  if (!fs.existsSync(contentDir)) {
    console.log(chalk.red(`❌ Content directory not found: ${contentDir}`));
    process.exit(1);
  }

  // Validate markdown files
  const spinner = ora('Validating markdown files...').start();

  try {
    const files = await glob('**/*.md', { cwd: contentDir });

    if (files.length === 0) {
      spinner.fail('No markdown files found');
      console.log(chalk.yellow(`⚠️  No .md files found in ${contentDir}`));
      process.exit(1);
    }

    const errors: string[] = [];

    for (const file of files) {
      const filePath = path.join(contentDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      try {
        const parsed = matter(content);

        if (!parsed.data.title && !parsed.data.order) {
          // Warn but don't fail
          console.log(chalk.yellow(`⚠️  ${file}: Missing frontmatter (title, order)`));
        }
      } catch (error: any) {
        errors.push(`${file}: Invalid frontmatter - ${error.message}`);
      }
    }

    if (errors.length > 0) {
      spinner.fail('Validation failed');
      errors.forEach((err) => console.log(chalk.red(`  ❌ ${err}`)));
      process.exit(1);
    }

    spinner.succeed(`Validated ${files.length} files`);
  } catch (error: any) {
    spinner.fail('Validation failed');
    console.log(chalk.red(`❌ ${error.message}`));
    process.exit(1);
  }

  // Create ZIP archive
  spinner.start('Creating archive...');

  const zipPath = path.join(process.cwd(), '.docs-sync.zip');

  try {
    await createZip(contentDir, zipPath);
    spinner.succeed('Archive created');
  } catch (error: any) {
    spinner.fail('Failed to create archive');
    console.log(chalk.red(`❌ ${error.message}`));
    process.exit(1);
  }

  // Upload to server
  spinner.start('Uploading to server...');

  try {
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(zipPath)], { type: 'application/zip' });

    formData.append('file', fileBlob, 'docs.zip');
    formData.append('projectId', config.projectId);
    formData.append('versionTag', options.version);

    const response = await axios.post(`${config.apiEndpoint}/docs/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    spinner.succeed('Upload complete');

    const result = response.data.result;
    console.log(chalk.green('\n✅ Synchronization successful!\n'));
    console.log(chalk.white(`  Created: ${result.created}`));
    console.log(chalk.white(`  Updated: ${result.updated}`));
    console.log(chalk.white(`  Deleted: ${result.deleted}`));

    if (result.errors && result.errors.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Errors: ${result.errors.length}`));
      result.errors.forEach((err: any) => {
        console.log(chalk.red(`  ❌ ${err.file}: ${err.error}`));
      });
    }

    // Clean up
    fs.unlinkSync(zipPath);
  } catch (error: any) {
    spinner.fail('Upload failed');
    console.log(chalk.red(`❌ ${error.response?.data?.message || error.message}`));

    // Clean up
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    process.exit(1);
  }
}

function createZip(sourceDir: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
