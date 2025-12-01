import { cosmiconfig } from "cosmiconfig";

export async function loadConfig() {
    const explorer = cosmiconfig("stacksync");

    const result = await explorer.search();

    return result?.config || {
        ignore: [],
        aliases: {},
        logosPath: "/public/tech/",
    };
}
