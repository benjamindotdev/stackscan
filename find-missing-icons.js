const fs = require("fs");
const simpleIcons = require("simple-icons");

// Load tech.json
const techJson = JSON.parse(fs.readFileSync("tech.json", "utf8"));
const techNames = techJson.tech.map((t) => t.name.trim());

// Get all simple-icons titles (case-insensitive)
const iconTitles = new Set(
  Object.values(simpleIcons).map((icon) => icon.title.toLowerCase())
);

// Find missing techs
const missing = techNames.filter((name) => !iconTitles.has(name.toLowerCase()));

fs.writeFileSync("missing-icons.txt", missing.join("\n"));
console.log(`Missing icons: ${missing.length}`);
