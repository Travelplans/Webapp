/**
 * Script to check for old duplicate files that can be removed
 * Run: node scripts/checkOldFiles.js
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const oldFiles = [
  'App.tsx',
  'index.tsx',
  'firebaseConfig.ts',
  'types.ts',
];

const oldDirs = [
  'components',
  'pages',
  'context',
  'hooks',
  'services',
];

console.log('🔍 Checking for old duplicate files...\n');

let foundOldFiles = [];
let foundOldDirs = [];

// Check old files
oldFiles.forEach(file => {
  const path = join(rootDir, file);
  if (existsSync(path)) {
    foundOldFiles.push(file);
    console.log(`⚠️  Found old file: ${file}`);
  }
});

// Check old directories
oldDirs.forEach(dir => {
  const path = join(rootDir, dir);
  if (existsSync(path)) {
    foundOldDirs.push(dir);
    console.log(`⚠️  Found old directory: ${dir}/`);
  }
});

if (foundOldFiles.length === 0 && foundOldDirs.length === 0) {
  console.log('✅ No old duplicate files found!');
  process.exit(0);
}

console.log('\n📋 Summary:');
console.log(`   Old files: ${foundOldFiles.length}`);
console.log(`   Old directories: ${foundOldDirs.length}`);

console.log('\n⚠️  Before removing, verify:');
console.log('   1. All imports use src/ structure');
console.log('   2. Application runs correctly');
console.log('   3. No broken imports');

console.log('\n🗑️  To remove (after verification):');
if (foundOldFiles.length > 0) {
  console.log(`   rm ${foundOldFiles.join(' ')}`);
}
if (foundOldDirs.length > 0) {
  console.log(`   rm -rf ${foundOldDirs.join(' ')}`);
}

process.exit(1);





