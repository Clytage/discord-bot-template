import { requestPermission } from "./utils/functions/requestPermission.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { CommandClientOptions } from "./deps/harmony.ts";

await requestPermission(["env", "read"]);
config({
    allowEmptyValues: false,
    export: true
});

export const options: CommandClientOptions = {
    allowBots: false,
    allowDMs: false,
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"],
    mentionPrefix: true,
    prefix: Deno.env.get("PREFIX") || "!",
    token: Deno.env.get("TOKEN") || ""
};
