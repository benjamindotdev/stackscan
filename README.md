# <img src="public/stackscan.svg#gh-light-mode-only" alt="StackScan" width="30" /> <img src="public/stackscan-white.svg#gh-dark-mode-only" alt="StackScan" width="30" /> StackScan

![License](https://img.shields.io/badge/license-MIT-blue.svg)

Automatically detect the tech stack of any project and generate structured output (JSON, Markdown, or badges).  
Designed for portfolios, READMEs, dashboards, and CI automation.

**StackScan** scans a repository (dependencies + file structure), normalizes detected technologies into categories, and maps them to logos with sensible fallbacks.

---

## Features

- 🔍 Detect dependencies from `package.json`
- 🖼 Built-in SVG logos with graceful fallbacks
- 💾 Generate JSON, Markdown, and asset files
- 🎨 Support for Brand, White, Black, or Custom color modes
- 🤖 Automates Portfolio / Monorepo README updates

---

## Install

### One-off (recommended)
```bash
npx stackscan@latest
````

### Global

```bash
npm install -g stackscan
stackscan
```

---

## Usage

1.  **Prepare Input**: 
    *   Place a folder for each desired project inside `public/stackscan/`.
    *   Each folder should contain a `package.json` file.
2.  **Run Scan**:

```bash
npx stackscan scan
```

### Add Command

You can also add a project from anywhere on your disk using the CLI. You can point to a `package.json` file OR a project directory:

```bash
# Point to a file
npx stackscan add ./path/to/package.json

# Point to a folder (automatically finds package.json)
npx stackscan add ../my-project
```

This will copy the `package.json` into a new folder inside `public/stackscan/` (e.g., `public/stackscan/my-project/`), handling name collisions automatically.

This will:
*   Scan all projects in `public/stackscan/`.
*   Generate `stack.json` and `stack.md` inside each project folder.
*   Copy logo assets to `public/assets/logos/`.
*   Update your root `README.md` with a "My Projects" section.

### Options

```bash
# Use white logos
npx stackscan scan --color white

# Use black logos
npx stackscan scan --color black

# Use brand colors (default)
npx stackscan scan --color brand
```

---

## Output

For each project in `public/stackscan/`, a `stack.json` is generated in the same folder.

Example `stack.json`:

```json
[
  {
    "name": "TypeScript",
    "slug": "typescript",
    "logo": "https://raw.githubusercontent.com/benjamindotdev/stackscan/main/public/assets/logos/language/typescript.svg",
    "relativePath": "public/assets/logos/language/typescript.svg",
    "color": "#3178C6"
  },
  {
    "name": "Next.js",
    "slug": "next",
    "logo": "https://raw.githubusercontent.com/benjamindotdev/stackscan/main/public/assets/logos/frameworks/nextjs.svg",
    "relativePath": "public/assets/logos/frameworks/nextjs.svg",
    "color": "#000000"
  }
]
```

Anything without a known logo still renders cleanly using category defaults (e.g. a lock icon for auth).

---


## Logo resolution

StackScan resolves logos in the following order:

1. Built-in curated registry
2. Known aliases (e.g. `next-auth` → **Auth.js**)
3. External icon registries (when available)
4. Category fallback icon (e.g. auth → lock)

This guarantees usable output even when a logo is missing.

---

## GitHub Actions (optional)

Use StackScan in CI to keep stack metadata up to date:

```yaml
name: stackscan
on:
  push:
    branches: [ main ]

jobs:
  stackscan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx stackscan scan
```

---

## What StackScan does *not* do

* ❌ It does not execute or analyze runtime code
* ❌ It does not attempt to infer architectural quality
* ❌ It does not require network access to be useful

This keeps it fast, safe, and CI-friendly.

---

## Contributing

Contributions are welcome — especially:

* new detection rules
* logo mappings and aliases
* edge cases (monorepos, uncommon stacks)

See `CONTRIBUTING.md` for development workflow and guidelines.

---

## Credits

Special thanks to these amazing icon libraries that make StackScan possible:

*   **[Simple Icons](https://simpleicons.org/)** – The primary source for brand logos and hex colors.
*   **[Lucide](https://lucide.dev/)** – Provides the beautiful category fallback icons.

---

## License

MIT