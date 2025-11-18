#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { syncCommand } from './commands/sync';
import chalk from 'chalk';

const program = new Command();

program
  .name('docs-cli')
  .description('CLI tool for Enterprise Documentation System')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize documentation configuration')
  .action(initCommand);

program
  .command('sync')
  .description('Sync documentation to the server')
  .option('-d, --directory <path>', 'Documentation directory', './docs')
  .option('-v, --version <tag>', 'Version tag', 'HEAD')
  .action(syncCommand);

program.parse();
