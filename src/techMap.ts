import { DetectorResult } from "./types";
import { techDefinitions } from "./techDefinitions";

export const techMap: Record<string, DetectorResult> = {};

for (const def of techDefinitions) {
    for (const alias of def.aliases) {
        techMap[alias] = {
            name: def.name,
            logo: def.logo,
            type: def.category
        };
    }
}