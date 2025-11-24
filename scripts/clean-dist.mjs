#!/usr/bin/env node
/**
 * Lightweight cross-platform directory remover.
 * Usage: node clean-dist.mjs <path>
 */
import { rm } from 'fs/promises';
import path from 'path';

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node clean-dist.mjs <path>');
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), target);

  try {
    await rm(resolved, { recursive: true, force: true });
  } catch (error) {
    console.error(`[clean-dist] Failed to remove ${resolved}`, error);
    process.exitCode = 1;
  }
}

main();
