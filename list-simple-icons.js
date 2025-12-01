const simpleIcons = require("simple-icons");
const fs = require("fs");

const iconNames = Object.values(simpleIcons).map((icon) => icon.title);
fs.writeFileSync("simple-icons-list.txt", iconNames.join("\n"));
console.log(`Exported ${iconNames.length} icon names to simple-icons-list.txt`);
