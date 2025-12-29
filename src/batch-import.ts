import fs from 'fs';
import path from 'path';
import { techMap } from './techMap';

const INPUT_DIR = path.join(process.cwd(), 'stacksync', 'input');
const OUTPUT_DIR = path.join(process.cwd(), 'stacksync', 'output');

// Helper to convert "example project" -> "exampleProject"
function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, "") // Remove special chars
    .split(' ')
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

async function batchImport() {
  console.log('🚀 Starting Batch Import...');

  if (!fs.existsSync(INPUT_DIR)) {
    console.log(`Creating input directory at: ${INPUT_DIR}`);
    fs.mkdirSync(INPUT_DIR, { recursive: true });
    console.log('Please place your project folders inside "stacksync/input" and run this command again.');
    process.exit(0);
  }

  const entries = fs.readdirSync(INPUT_DIR, { withFileTypes: true });
  const projectDirs = entries.filter(dirent => dirent.isDirectory());

  if (projectDirs.length === 0) {
    console.log('⚠️  No project directories found in "stacksync/input".');
    return;
  }

  console.log(`Found ${projectDirs.length} projects to process.\n`);

  for (const dir of projectDirs) {
    const projectPath = path.join(INPUT_DIR, dir.name);
    const packageJsonPath = path.join(projectPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      try {
        const content = fs.readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(content);
        
        // 1. Detect Tech
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        const detectedTechs: any[] = [];

        Object.keys(allDeps).forEach(dep => {
          if (techMap[dep]) {
            const tech = techMap[dep];
            detectedTechs.push({
              name: tech.name,
              slug: dep,
              logo: `https://raw.githubusercontent.com/benjamindotdev/stacksync/main/assets/logos/${tech.logo}`
            });
          }
        });

        // 2. Deduplicate
        const uniqueTechs = Array.from(new Set(detectedTechs.map(t => t.slug)))
          .map(slug => detectedTechs.find(t => t.slug === slug));

        // 3. Prepare Output
        const outputFolderName = toCamelCase(dir.name);
        const projectOutputDir = path.join(OUTPUT_DIR, outputFolderName);

        if (!fs.existsSync(projectOutputDir)) {
          fs.mkdirSync(projectOutputDir, { recursive: true });
        }

        // 4. Write File
        fs.writeFileSync(
          path.join(projectOutputDir, 'stack.json'), 
          JSON.stringify(uniqueTechs, null, 2)
        );

        console.log(`✅ ${dir.name.padEnd(20)} -> ${outputFolderName}/stack.json (${uniqueTechs.length} techs)`);

      } catch (err: any) {
        console.error(`❌ Error processing ${dir.name}:`, err.message);
      }
    } else {
      console.warn(`⚠️  Skipping "${dir.name}": No package.json found.`);
    }
  }
  console.log('\n✨ Batch import complete.');
}

export { batchImport };
