import { parseEnvMultipleValue } from "../utils/functions/parseEnvMultipleValue";

export const isDev = process.env.NODE_ENV === "development";
export const prefix = isDev ? "d!" : process.env.PREFIX!;
export const enableSlashCommand = process.env.ENABLE_SLASH_COMMAND !== "no";
export const devGuild = parseEnvMultipleValue(process.env.DEV_GUILD ?? "");
export const devs = parseEnvMultipleValue(process.env.DEVS ?? "");
