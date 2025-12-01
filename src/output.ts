import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { DetectorResult, StackSyncConfig } from "./types";

export async function writeOutput(
    outPath: string,
    techs: DetectorResult[],
    config: StackSyncConfig
) {
    const outDirectory = path.dirname(outPath);

    await fs.ensureDir(outDirectory);

    await fs.writeJSON(
        outPath,
        {
            generatedAt: new Date().toISOString(),
            tech: techs,
        },
        { spaces: 2 }
    );

    console.log(chalk.blue(`→ Saved ${techs.length} tech entries to ${outPath}`));
}
