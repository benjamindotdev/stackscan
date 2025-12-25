import fs from "fs-extra";
import path from "path";
import { DetectorResult } from "../types";

export async function detectCI(repoPath: string): Promise<DetectorResult | null> {
    // GitHub Actions
    if (await fs.pathExists(path.join(repoPath, ".github/workflows"))) {
        return { name: "GitHub Actions", logo: "ci/githubactions.svg", type: "ci" };
    }

    // GitLab CI
    if (await fs.pathExists(path.join(repoPath, ".gitlab-ci.yml"))) {
        return { name: "GitLab CI", logo: "ci/gitlab.svg", type: "ci" };
    }

    // CircleCI
    if (await fs.pathExists(path.join(repoPath, ".circleci"))) {
        return { name: "CircleCI", logo: "ci/circleci.svg", type: "ci" };
    }

    // Travis CI
    if (await fs.pathExists(path.join(repoPath, ".travis.yml"))) {
        return { name: "Travis CI", logo: "ci/travisci.svg", type: "ci" };
    }

    // Azure Pipelines
    if (await fs.pathExists(path.join(repoPath, "azure-pipelines.yml"))) {
        return { name: "Azure Pipelines", logo: "ci/azurepipelines.svg", type: "ci" };
    }

    return null;
}
