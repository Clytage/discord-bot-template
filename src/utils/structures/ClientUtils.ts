/* eslint-disable class-methods-use-this */
import { Bot } from "../../structures/Bot";
import { pathToFileURL } from "node:url";
import { parse } from "node:path";

export class ClientUtils {
    public constructor(public readonly client: Bot) {}

    public atob(str: string): string {
        return Buffer.from(str, "base64").toString("ascii");
    }

    public async getUserCount(): Promise<number> {
        const arr: string[] = [];

        if (this.client.shard) {
            const shards = await this.client.shard.broadcastEval(c => c.users.cache.map(x => x.id));

            arr.push(...shards.flat());
        } else {
            arr.push(...this.client.users.cache.map(x => x.id));
        }

        return arr.filter((x, i) => arr.indexOf(x) === i).length;
    }

    public async getChannelCount(textOnly = false): Promise<number> {
        if (this.client.shard) {
            const shards = await this.client.shard.broadcastEval(
                (c, t) => c.channels.cache
                    .filter(x => (t ? x.isText() : true) && x.type !== "DM")
                    .size,
                { context: textOnly }
            );

            return shards.reduce((p, c) => p + c, 0);
        }

        return this.client.channels.cache
            .filter(x => (textOnly ? x.isText() : true) && x.type !== "DM")
            .size;
    }

    public async getGuildCount(): Promise<number> {
        if (this.client.shard) {
            const shards = await this.client.shard.broadcastEval(c => c.guilds.cache.size);

            return shards.reduce((p, c) => p + c, 0);
        }

        return this.client.guilds.cache.size;
    }

    public async import<T>(path: string, ...args: any[]): Promise<T | undefined> {
        const file = await import(pathToFileURL(path).toString())
            .then(
                m => (m as Record<string, (new (...argument: any[]) => T) | undefined>)[parse(path).name]
            );
        return file ? new file(...(args as unknown[])) : undefined;
    }
}
