const fs = require("fs");
const simpleIcons = require("simple-icons");

// Load tech.json
const techJson = JSON.parse(fs.readFileSync("tech.json", "utf8"));
const techNames = techJson.tech.map((t) => t.name.trim());

// Get all simple-icons titles and slugs (case-insensitive)
const iconTitles = new Set(
  Object.values(simpleIcons).map((icon) => icon.title.toLowerCase())
);
const iconSlugs = new Set(
  Object.values(simpleIcons).map((icon) => icon.slug.toLowerCase())
);

// Find missing techs by both title and slug
const missing = techNames.filter((name) => {
  const lower = name.toLowerCase();
  return (
    !iconTitles.has(lower) && !iconSlugs.has(lower.replace(/\s|\.|-/g, ""))
  );
});

fs.writeFileSync("missing-icons-checked.txt", missing.join("\n"));
console.log(`Missing after slug/title check: ${missing.length}`);
