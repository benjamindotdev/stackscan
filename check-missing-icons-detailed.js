const fs = require("fs");
const simpleIcons = require("simple-icons");

// Load tech.json
const techJson = JSON.parse(fs.readFileSync("tech.json", "utf8"));
const techNames = techJson.tech.map((t) => t.name.trim());

// Get all simple-icons titles and slugs (case-insensitive)
const iconTitles = Object.values(simpleIcons).map((icon) =>
  icon.title.toLowerCase()
);
const iconSlugs = Object.values(simpleIcons).map((icon) =>
  icon.slug.toLowerCase()
);

function normalize(name) {
  return name.toLowerCase().replace(/\s|\.|-/g, "");
}

const results = techNames.map((name) => {
  const lower = name.toLowerCase();
  const norm = normalize(name);
  let found = false;
  let matchType = "";
  let matchValue = "";

  if (iconTitles.includes(lower)) {
    found = true;
    matchType = "title";
    matchValue = lower;
  } else if (iconSlugs.includes(norm)) {
    found = true;
    matchType = "slug";
    matchValue = norm;
  } else {
    // Try partial matches
    const partialTitle = iconTitles.find(
      (t) => t.includes(lower) || lower.includes(t)
    );
    const partialSlug = iconSlugs.find(
      (s) => s.includes(norm) || norm.includes(s)
    );
    if (partialTitle) {
      found = true;
      matchType = "partial-title";
      matchValue = partialTitle;
    } else if (partialSlug) {
      found = true;
      matchType = "partial-slug";
      matchValue = partialSlug;
    }
  }

  return {
    name,
    found,
    matchType,
    matchValue,
  };
});

const missing = results.filter((r) => !r.found).map((r) => r.name);
const maybeNaming = results
  .filter((r) => r.matchType.startsWith("partial"))
  .map((r) => r.name + " (maybe: " + r.matchValue + ")");

fs.writeFileSync("missing-icons-detailed.txt", missing.join("\n"));
fs.writeFileSync("maybe-naming-icons.txt", maybeNaming.join("\n"));
console.log(
  `Definitely missing: ${missing.length}, Possible naming issues: ${maybeNaming.length}`
);
