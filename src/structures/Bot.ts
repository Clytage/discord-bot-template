import { CommandManager } from "../utils/structures/CommandManager";
import { EventsLoader } from "../utils/structures/EventsLoader";
import { createLogger } from "../utils/functions/createLogger";
import { ClientUtils } from "../utils/structures/ClientUtils";
import * as config from "../config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "discord.js";
import got from "got";

const path = dirname(fileURLToPath(import.meta.url));
export class Bot extends Client {
    public readonly config = config;
    public readonly utils = new ClientUtils(this);
    public readonly commands = new CommandManager(this, resolve(path, "..", "commands"));
    public readonly events = new EventsLoader(this, resolve(path, "..", "events"));
    public readonly request = got;
    public readonly logger = createLogger({
        name: "RahagiaBot",
        type: "shard",
        shardId: this.shard?.ids[0] ?? 0,
        dev: this.config.isDev
    });

    public async build(token?: string): Promise<this> {
        const start = Date.now();
        await this.events.load();
        this.on("ready", () => {
            void this.commands.load();
            this.logger.info(`Ready in ${Date.now() - start}ms`);
        });
        await this.login(token);
        return this;
    }
}
