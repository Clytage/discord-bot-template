import "dotenv/config";
import { ShardingManager } from "discord.js";
import { resolve } from "path";
import { start } from "repl";

const shardManager = new ShardingManager(resolve(__dirname, "bot.js"), {
    token: process.env.DISCORD_TOKEN,
    mode: "process",
    totalShards: "auto"
});

const repl = start({
    prompt: "> "
});

repl.context.shardManager = shardManager;

void shardManager.on("shardCreate", shard => {
    console.info(`[ShardManager] Shard #${shard.id} Spawned.`);
}).spawn();


