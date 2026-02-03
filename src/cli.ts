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
    .command("scan", { isDefault: true })
    .description("Scan stacks from multiple projects in public/stackscan/")
    .option("--color <mode>", "Color mode (brand, white, black, or hex)", "brand")
    .option("--no-readme", "Do not update the root README.md")
    .action(async (options) => {
        await scan(options);
    });

program
    .command("add <path>")
    .description("Add a project (folder or package.json) to the public/stackscan workspace")
    .action(async (path) => {
        await add(path);
    });

program.parse();
