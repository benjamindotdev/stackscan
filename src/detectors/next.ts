import fs from "fs-extra";
import path from "path";

export async function detectNext(repoPath: string) {
    const pages = path.join(repoPath, "pages");
    const app = path.join(repoPath, "app");

    if (await fs.pathExists(pages) || await fs.pathExists(app)) {
        return { name: "Next.js App", logo: "next.svg", type: "frontend" };
    }

    return null;
}
