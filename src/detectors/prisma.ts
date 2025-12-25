import fs from "fs-extra";
import path from "path";

export async function detectPrisma(repoPath: string) {
    const schema = path.join(repoPath, "prisma/schema.prisma");

    if (await fs.pathExists(schema)) {
        return { name: "Prisma ORM", logo: "orm/prisma.svg", type: "database" };
    }

    return null;
}
