#!/usr/bin / env node
import { Command } from "commander";
import { loadConfig } from "./config";
import { scanRepo } from "./scanner";
import { writeOutput } from "./output";
import chalk from "chalk";

const program = new Command();

program
    .name("stacksync")
    .description("Auto-detect tech stacks and generate tech.json or markdown.")
    .version("0.1.0");

program
    .command("scan")
    .option("--repo <path>", "Path to repo", ".")
    .option("--out <path>", "Output file path", "./tech.json")
    .option("--format <format>", "Output format (json, markdown)", "json")
    .option("--assets <path>", "Path to copy logo assets to")
    .action(async (options) => {
        const config = await loadConfig();
        const result = await scanRepo(options.repo, config);

        await writeOutput(
            options.out, 
            result, 
            config, 
            options.format as "json" | "markdown",
            options.assets
        );

        console.log(chalk.green("✔ Tech stack generated successfully!"));
    });

program.parse();
