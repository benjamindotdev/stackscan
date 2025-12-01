# stacksync

Automatically detect the tech stack of any project and generate a JSON or markdown file — perfect for keeping your portfolio up to date.

## Features

- 🔍 Detect dependencies from package.json
- 🗂 Detect tech from file structure (Next.js, Prisma, Docker, CI)
- 🖼 Includes built-in SVG logos
- 💾 Generate `tech.json`, Markdown, or badges
- 🤖 Optional GitHub Action to auto-update portfolios
- 🔧 Fully configurable via `.stacksync.json`

## Usage

## Development Workflow Summary

### Branch Strategy

1. **Feature Development**: Create feature branch from `main`

   - Branch naming: `fix/descriptive-name` or `feature/descriptive-name`

2. **Standard Merge Flow** ("normal workflow"):

   ```bash
   # Create and work on feature branch
   git checkout -b fix/feature-name

   # Commit and push feature branch
   git add -A
   git commit -m "descriptive commit message"
   git push origin fix/feature-name

   # Merge to dev
   git checkout dev
   git merge fix/feature-name
   git push origin dev

   # Merge to main
   git checkout main
   git merge dev
   git push origin main
   ```

### Version Management

- **Auto-versioning**: GitHub Actions workflow (auto-version.yml) automatically bumps patch version on every push to `main`
- **Workflow behavior**:
  - Triggers on push to `main`
  - Skips if package.json or package-lock.json changed (prevents loops)
  - Runs `npm version patch` with `[skip ci]` message
  - Creates git tag and pushes

### Testing

- All tests must pass before merging
- Tests run automatically during git operations
- Use Jest test suite

### Key Practices

1. Always run tests before merging
2. Use descriptive commit messages
3. Keep feature branches focused and small
4. Merge feature → dev → main in sequence
5. Let auto-versioning handle version bumps (don't manually edit version)
6. If merge conflicts with auto-version, pull main, resolve, and push
