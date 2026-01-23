# Contributing to StackScan

Thanks for your interest in contributing to **StackScan**!  
Contributions of all kinds are welcome — bug fixes, new detection rules, logo mappings, and documentation improvements.

This project aims to stay **simple, deterministic, and automation-friendly**, so small, focused changes are preferred.

---

## Ways to contribute

You can help by:
- Adding or improving tech detection rules
- Adding new logo mappings or aliases
- Fixing bugs or edge cases
- Improving documentation or examples

If you’re unsure whether something belongs, open an issue first.

---

## Adding a new logo or tech definition

### 1. Check existing definitions

Before adding anything new, check:

src/techDefinitions.ts

yaml
Copy code

Look for:
- existing entries
- aliases that may already cover the package/tool
- category consistency

---

### 2. Add a tech definition

If the tech is missing, add an entry in `src/techDefinitions.ts`:

```ts
{
  id: "new-tech",
  name: "New Tech",
  aliases: ["new-tech", "new-tech-package"],
  category: "framework",
  logo: "framework/new-tech.svg"
}
Guidelines:

id should be lowercase and URL-safe

aliases should include common package names

category must match an existing category

Prefer stable, canonical names over abbreviations

3. Add the SVG logo (if applicable)
Place the SVG in:

php-template
Copy code
assets/logos/<category>/<filename>.svg
Logo guidelines:

Use an official logo when available

SVGs must be clean and optimized

Avoid embedded styles or unnecessary metadata

Monochrome or neutral variants are preferred when possible

If no suitable logo exists, do not force one — StackScan will fall back to a category icon.

Development setup
1. Clone the repository
bash
Copy code
git clone https://github.com/benjamindotdev/stackscan.git
cd stackscan
2. Install dependencies
bash
Copy code
npm install
3. Run the playground
bash
Copy code
npm run playground
The playground lets you:

test detection logic

verify logo rendering

inspect generated output

Pull request guidelines
Keep PRs small and focused

Use clear, descriptive titles

Ensure the build passes:

bash
Copy code
npm run build
If adding detection logic, include an example repo or fixture

Avoid unrelated refactors

All PRs should target the default branch unless otherwise noted.

Code style & philosophy
Prefer explicit logic over clever heuristics

Avoid network dependencies where possible

Output must remain deterministic

Backwards compatibility matters

If a change may affect output shape or CI usage, call it out clearly in the PR.

Questions & discussion
If you’re unsure about:

category placement

logo inclusion

detection heuristics

Open an issue — discussion is encouraged.

Thank you for helping improve StackScan 🚀