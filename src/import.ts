import fs from 'fs';
import path from 'path';
import { techMap } from './techMap';

const targetFile = process.argv[2];

if (!targetFile) {
  console.error('Please provide a path to a package.json file.');
  console.error('Usage: npm run import -- ../path/to/project/package.json');
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), targetFile);

if (!fs.existsSync(absolutePath)) {
  console.error(`File not found: ${absolutePath}`);
  process.exit(1);
}

try {
  const content = fs.readFileSync(absolutePath, 'utf-8');
  const pkg = JSON.parse(content);
  const projectName = pkg.name || 'unknown-project';

  console.log(`📦 Analyzing stack for: ${projectName}`);

  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

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

  const uniqueTechs = Array.from(new Set(detectedTechs.map(t => t.slug)))
    .map(slug => detectedTechs.find(t => t.slug === slug));

  const outputDir = path.join(process.cwd(), 'stacksync', 'projects', projectName);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'stack.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(uniqueTechs, null, 2));

  console.log(`✅ Stack saved to: ${outputPath}`);
  console.log(`   Found ${uniqueTechs.length} technologies.`);

} catch (error) {
  console.error('Error processing file:', error);
  process.exit(1);
}
