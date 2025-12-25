import fs from "fs-extra";
import path from "path";
import { DetectorResult } from "../types";

export async function detectDocker(repoPath: string): Promise<DetectorResult | null> {
    const dockerfile = path.join(repoPath, "Dockerfile");
    const compose = path.join(repoPath, "docker-compose.yml");
    const composeYaml = path.join(repoPath, "compose.yaml");

    if (
        (await fs.pathExists(dockerfile)) ||
        (await fs.pathExists(compose)) ||
        (await fs.pathExists(composeYaml))
    ) {
        return { name: "Docker", logo: "container/docker.svg", type: "infrastructure" };
    }

    return null;
}
