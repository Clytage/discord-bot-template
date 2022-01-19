import { EventLoader } from "../utils/structures/EventLoader.ts";
import { CommandClient } from "../deps/harmony.ts";
import * as config from "../config.ts";

export class Bot extends CommandClient {
    public readonly eventLoader = new EventLoader(this);
    public readonly config = config;

    public constructor() {
        super(config.options);
    }

    public async start(): Promise<this> {
        this.connect();
        await this.eventLoader.load();
        await this.commands.loader.loadDirectory("commands", { exportName: "command" });

        return this;
    }
}
