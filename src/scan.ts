import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { techMap } from './techMap';
import simpleIconsHex from './simple-icons-hex.json';
import { generateMarkdown, copyAssets } from './output';

const BASE_DIR = path.join(process.cwd(), 'public', 'stackscan');

const SKIPPED_TECHS = [
  'react-dom',
];

// Helper to look for package.json or _package.json
function getPackageJson(projectPath: string) {
    const pkgPath = path.join(projectPath, 'package.json');
    const pkgPathUnderscore = path.join(projectPath, '_package.json');
    
    // Check if we are inside public/stackscan
    // We only want to rename inside public/stackscan to avoid messing up root or other locations
    // We check if the projectPath contains 'public/stackscan' or 'public\\stackscan'
    const isInsideStackScanDir = projectPath.includes(path.join('public', 'stackscan'));

    // Priority 1: Check for active package.json and rename it to avoid dependabot
    // BUT ONLY if we are in the designated directory
    if (fs.existsSync(pkgPath) && isInsideStackScanDir) {
        try {
            console.log(`Renaming ${pkgPath} to ${pkgPathUnderscore}`);
            fs.renameSync(pkgPath, pkgPathUnderscore);
        } catch (e: any) {
            console.warn(`Failed to rename package.json to _package.json: ${e.message}`);
        }
    }
    
    // Priority 2: Read _package.json
    if (fs.existsSync(pkgPathUnderscore)) {
        try {
            const content = fs.readFileSync(pkgPathUnderscore, 'utf-8');
            return JSON.parse(content);
        } catch (e: any) {
             console.warn(`Failed to read _package.json: ${e.message}`);
        }
    }
    
    // Priority 3: Read package.json (fallback if not renamed)
    if (fs.existsSync(pkgPath)) {
        try {
            const content = fs.readFileSync(pkgPath, 'utf-8');
            return JSON.parse(content);
        } catch (e: any) {
             console.warn(`Failed to read package.json: ${e.message}`);
        }
    }
    
    return null;
}

// Helper to look for pom.xml or _pom.xml
function getPomXml(projectPath: string) {
    const pomPath = path.join(projectPath, 'pom.xml');
    const pomPathUnderscore = path.join(projectPath, '_pom.xml');
    
    // Check if we are inside public/stackscan
    const isInsideStackScanDir = projectPath.includes(path.join('public', 'stackscan'));

    // Priority 1: Check for active pom.xml and rename it
    if (fs.existsSync(pomPath) && isInsideStackScanDir) {
        try {
            console.log(`Renaming ${pomPath} to ${pomPathUnderscore}`);
            fs.renameSync(pomPath, pomPathUnderscore);
        } catch (e: any) {
            console.warn(`Failed to rename pom.xml to _pom.xml: ${e.message}`);
        }
    }
    
    // Read _pom.xml or pom.xml
    let xmlContent: string | null = null;
    if (fs.existsSync(pomPathUnderscore)) {
        try {
            xmlContent = fs.readFileSync(pomPathUnderscore, 'utf-8');
        } catch (e: any) {
            console.warn(`Failed to read _pom.xml: ${e.message}`);
        }
    } else if (fs.existsSync(pomPath)) {
        try {
            xmlContent = fs.readFileSync(pomPath, 'utf-8');
        } catch (e: any) {
            console.warn(`Failed to read pom.xml: ${e.message}`);
        }
    }
    
    if (xmlContent) {
        try {
            const parser = new XMLParser();
            return parser.parse(xmlContent);
        } catch (e: any) {
            console.warn(`Failed to parse XML: ${e.message}`);
        }
    }
    
    return null;
}


const CATEGORY_PRIORITY = [
  "language",
  "framework", 
  "mobile",
  "frontend",
  "backend",
  "runtime",
  "database",
  "orm",
  "auth",
  "api",
  "state",
  "css",
  "cloud",
  "hosting",
  "devops",
  "container",
  "ci",
  "testing",
  "build",
  "lint",
  "format",
  "automation",
  "package",
  "ai",
  "network",
  "utility",
  "cms",
  "ssg",
  "payment"
];

const getCategoryPriority = (cat: string) => {
    const idx = CATEGORY_PRIORITY.indexOf(cat ? cat.toLowerCase() : "");
    return idx === -1 ? 999 : idx;
};

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

interface SyncOptions {
  color?: string;
  copyAssets?: boolean;
  readme?: boolean; // commander uses --no-readme to set readme to false
  out?: string;
}

async function analyzeProject(projectPath: string, options: SyncOptions): Promise<any[]> {
    const pkg = getPackageJson(projectPath);
    const pom = getPomXml(projectPath);

    if (!pkg && !pom) {
        throw new Error(`No package.json or pom.xml found at ${projectPath}`);
    }

    // 1. Detect Tech
    const allDeps: Record<string, any> = {};

    // Process package.json
    if (pkg) {
        Object.assign(allDeps, pkg.dependencies, pkg.devDependencies);
    }

    // Process pom.xml
    if (pom && pom.project && pom.project.dependencies && pom.project.dependencies.dependency) {
        let deps = pom.project.dependencies.dependency;
        if (!Array.isArray(deps)) {
            deps = [deps];
        }
        
        deps.forEach((d: any) => {
             // Map groupId:artifactId and just artifactId
             if (d.artifactId) allDeps[d.artifactId] = "latest";
             if (d.groupId && d.artifactId) allDeps[`${d.groupId}:${d.artifactId}`] = "latest";
        });
    }

    const detectedTechs: any[] = [];

    Object.keys(allDeps).forEach(dep => {
      if (SKIPPED_TECHS.includes(dep)) return;

      if (techMap[dep]) {
        const tech = techMap[dep];
        
        // Determine Color
        let color = null;
        if (options.color === 'white') color = '#FFFFFF';
        else if (options.color === 'black') color = '#000000';
        else if (options.color && options.color.startsWith('#')) color = options.color;
        else {
           // Default to brand color
           const depSlug = dep.toLowerCase();
           const nameSlug = tech.name.toLowerCase();
           const nameSlugNoSpaces = tech.name.toLowerCase().replace(/\s+/g, '');
           
           const hex = (simpleIconsHex as any)[depSlug] || 
                       (simpleIconsHex as any)[nameSlug] || 
                       (simpleIconsHex as any)[nameSlugNoSpaces];
                       
           if (hex) color = `#${hex}`;
        }

        detectedTechs.push({
          name: tech.name,
          slug: dep,
          logo: tech.logo,
          type: tech.type,
          color: color
        });
      }
    });

    // 2. Deduplicate by slug
    // Ensure we keep the object found
    const uniqueSlugs = Array.from(new Set(detectedTechs.map(t => t.slug)));
    let uniqueTechs = uniqueSlugs.map(slug => detectedTechs.find(t => t.slug === slug)!);

    // 3. Deduplicate by logo
    const seenLogos = new Set<string>();
    uniqueTechs = uniqueTechs.filter(t => {
        if (seenLogos.has(t.logo)) {
            return false;
        }
        seenLogos.add(t.logo);
        return true;
    });

    // 4. Sort by Category Priority
    uniqueTechs.sort((a, b) => {
        const pA = getCategoryPriority(a.type);
        const pB = getCategoryPriority(b.type);
        if (pA !== pB) return pA - pB;
        return a.name.localeCompare(b.name);
    });
    
    // Resolve Assets (Copy & Fallback)
    const assetsDir = path.join(process.cwd(), 'public', 'assets', 'logos');
    if (options.copyAssets !== false) {
         await copyAssets(uniqueTechs, assetsDir, { colorMode: options.color as any });
    }

    // Create URL-based version for Output
    return uniqueTechs.map(t => ({
        ...t,
        logo: `https://raw.githubusercontent.com/benjamindotdev/stackscan/main/public/assets/logos/${t.logo}`,
        relativePath: `./public/assets/logos/${t.logo}`
    }));
}

async function scan(targetPath?: string | object, optionsOrUndefined?: SyncOptions) {
  // Handle arguments
  // scan(options) -> targetPath is options, optionsOrUndefined is undefined
  // scan(path, options) -> targetPath is string, optionsOrUndefined is options
  
  let options: SyncOptions = {};
  let pathArg: string | undefined = undefined;

  if (typeof targetPath === 'string') {
      pathArg = targetPath;
      options = optionsOrUndefined || {};
  } else if (typeof targetPath === 'object') {
      options = targetPath as SyncOptions;
  }

  // Default readme to true if undefined
  if (options.readme === undefined) options.readme = true;

  console.log('🚀 Starting Scan...');
  if (options.color) {
    console.log(`🎨 Color mode: ${options.color}`);
  }

  // SINGLE MODE
  if (pathArg) {
      const absPath = path.resolve(pathArg);
      console.log(`Scanning single project at: ${absPath}`);
      
      try {
          const techsWithUrls = await analyzeProject(absPath, options);
          
          if (options.out) {
              const outPath = path.resolve(options.out);
              fs.writeFileSync(outPath, JSON.stringify(techsWithUrls, null, 2));
              console.log(`✅ Generated stack output to: ${options.out}`);
          } else {
             const outPath = path.join(absPath, 'stack.json');
             fs.writeFileSync(outPath, JSON.stringify(techsWithUrls, null, 2));
             console.log(`✅ Generated stack.json at: ${outPath}`);
          }

      } catch (err: any) {
          console.error(`❌ Error scanning project:`, err.message);
          process.exit(1);
      }
      return;
  }

  // DEFAULT WORKSPACE MODE
  if (!fs.existsSync(BASE_DIR)) {
    console.log(`Creating stackscan directory at: ${BASE_DIR}`);
    fs.mkdirSync(BASE_DIR, { recursive: true });
    console.log('Please place your project folders inside "public/stackscan/" and run this command again.');
    process.exit(0);
  }

  const entries = fs.readdirSync(BASE_DIR, { withFileTypes: true });
  const projectDirs = entries.filter(dirent => dirent.isDirectory() && dirent.name !== 'input' && dirent.name !== 'output');

  if (projectDirs.length === 0) {
    console.log('⚠️  No project directories found in "public/stackscan/".');
    return;
  }

  console.log(`Found ${projectDirs.length} projects to process.\n`);

  const allProjects: { name: string; techs: any[] }[] = [];

  for (const dir of projectDirs) {
    const projectPath = path.join(BASE_DIR, dir.name);
    
    // Check for package.json OR pom.xml (or their underscored variants)
    const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json')) || fs.existsSync(path.join(projectPath, '_package.json'));
    const hasPomXml = fs.existsSync(path.join(projectPath, 'pom.xml')) || fs.existsSync(path.join(projectPath, '_pom.xml'));

    if (hasPackageJson || hasPomXml) {
      try {
        const techsWithUrls = await analyzeProject(projectPath, options);
        
        // Write File
        fs.writeFileSync(
          path.join(projectPath, 'stack.json'), 
          JSON.stringify(techsWithUrls, null, 2)
        );

        // Generate Markdown
        const mdContent = generateMarkdown(techsWithUrls);
        fs.writeFileSync(path.join(projectPath, 'stack.md'), mdContent);

        // Store for root README update
        allProjects.push({
            name: dir.name,
            techs: techsWithUrls
        });

        console.log(`✅ ${dir.name.padEnd(20)} -> stack.json (${techsWithUrls.length} techs)`);

      } catch (err: any) {
        console.error(`❌ Error processing ${dir.name}:`, err.message);
      }
    } else {
      console.warn(`⚠️  Skipping "${dir.name}": No package.json or pom.xml found.`);
    }
  }

  // Update Root README if enabled
  if (options.readme && allProjects.length > 0) {
      updateRootReadme(allProjects);
  } else if (!options.readme) {
      console.log('Skipping README update (--no-readme passed).');
  }

  console.log('\n✨ Sync complete.');
}

function updateRootReadme(projects: { name: string; techs: any[] }[]) {
    const readmePath = path.join(process.cwd(), 'README.md');
    if (!fs.existsSync(readmePath)) {
        console.log('⚠️  No root README.md found to update.');
        return;
    }

    let readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const startMarker = '<!-- STACKSCAN_START -->';
    const endMarker = '<!-- STACKSCAN_END -->';

    let newSection = `${startMarker}\n## My Projects\n\n`;
    
    for (const p of projects) {
        newSection += `### ${p.name}\n`;
        newSection += `<p>\n`;
        for (const t of p.techs) {
            const src = t.relativePath || t.logo;
            newSection += `  <img src="${src}" alt="${t.name}" height="25" style="margin-right: 10px;" />\n`;
        }
        newSection += `</p>\n\n`;
    }
    newSection += `${endMarker}`;

    if (readmeContent.includes(startMarker) && readmeContent.includes(endMarker)) {
        const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
        readmeContent = readmeContent.replace(regex, newSection);
        console.log(`📝 Updated root README.md with ${projects.length} projects.`);
    } else {
        readmeContent += `\n\n${newSection}`;
        console.log(`📝 Appended projects to root README.md.`);
    }

    fs.writeFileSync(readmePath, readmeContent);
}


export { scan };
