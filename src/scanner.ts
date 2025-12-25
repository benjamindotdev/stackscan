import fs from "fs-extra";
import path from "path";
import { techMap } from "./techMap";
import { detectNext } from "./detectors/next";
import { detectPrisma } from "./detectors/prisma";
import { detectCI } from "./detectors/ci";
import { detectDocker } from "./detectors/docker";
import { DetectorResult, StackSyncConfig } from "./types";

export async function scanRepo(
    repoPath: string,
    config: StackSyncConfig
): Promise<DetectorResult[]> {
    const pkgPath = path.join(repoPath, "package.json");

    if (!fs.existsSync(pkgPath)) throw new Error("package.json not found");

    const pkg = await fs.readJSON(pkgPath);
    const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
    };

    const results: DetectorResult[] = [];

    for (const dep of Object.keys(deps)) {
        if (config.ignore?.includes(dep)) continue;

        if (techMap[dep]) {
            results.push(techMap[dep]);
        }
    }

    // File-based detectors
    const detectors = [detectNext, detectPrisma, detectCI, detectDocker];

    for (const detector of detectors) {
        const out = await detector(repoPath);
        if (out) results.push(out);
    }

    return results;
}
