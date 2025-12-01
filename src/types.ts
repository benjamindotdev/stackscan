export interface DetectorResult {
    name: string;
    logo: string;
    type: string;
}

export interface StackSyncConfig {
    ignore?: string[];
    aliases?: Record<string, string>;
    logosPath?: string;
}
