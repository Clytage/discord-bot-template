import { ClientOptions, Intents, Options, ShardingManagerMode, Sweepers } from "discord.js";

export const clientOptions: ClientOptions = {
    allowedMentions: {
        parse: ["users"],
        repliedUser: true
    },
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ],
    makeCache: Options.cacheWithLimits({
        MessageManager: {
            maxSize: Infinity,
            sweepInterval: 300,
            sweepFilter: Sweepers.filterByLifetime({
                lifetime: 10800
            })
        },
        ThreadManager: {
            maxSize: Infinity,
            sweepInterval: 300,
            sweepFilter: Sweepers.filterByLifetime({
                lifetime: 10800,
                getComparisonTimestamp: e => e.archiveTimestamp!,
                excludeFromSweep: e => !e.archived
            })
        }
    }),
    retryLimit: 3
};

export const presenceData: RahagiaBot.PresenceData = {
    activities: [
        { name: "Hello world!", type: "PLAYING" }
    ],
    status: ["online"],
    interval: 60000
};
export const shardsCount: number | "auto" = "auto";
export const shardingMode: ShardingManagerMode = "worker";
export const embedColor = "3CAAFF";
export * from "./env";
