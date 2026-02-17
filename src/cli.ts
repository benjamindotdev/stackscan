#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";

import { scan } from "./scan";
import { add } from "./add";

const program = new Command();

program
    .name("stackscan")
    .description("Auto-detect tech stacks and generate tech.json or markdown.")
    .version("0.1.0");

program
    .command("scan [path]", { isDefault: true })
    .description("Scan stacks from multiple projects in public/stackscan/ or a specific project path")
    .option("--color <mode>", "Color mode (brand, white, black, or hex)", "brand")
    .option("--no-readme", "Do not update the root README.md")
    .option("--out <file>", "Output JSON file (only for single project scan)")
    .action(async (path, options) => {
        // If path is a string, it's the path argument.
        // If path is an object, it's the options object (when no path arg provided), 
        // and the second arg is undefined or the command object.
        // Commander passes arguments then options/command.
        
        let targetPath = typeof path === 'string' ? path : undefined;
        let opts = typeof path === 'object' ? path : options;
        
        await scan(targetPath, opts);
    });

program
    .command("add <path>")
    .description("Add a project (folder or package.json) to the public/stackscan workspace")
    .action(async (path) => {
        await add(path);
    });

program.parse();
