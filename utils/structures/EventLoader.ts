import { readdirSync } from "https://deno.land/std/node/fs.ts";
import { resolve } from "https://deno.land/std/path/mod.ts";
import { BaseEvent } from "../../structures/BaseEvent.ts";
import { Bot } from "../../structures/Bot.ts";

export class EventLoader {
    public constructor(public readonly client: Bot) {}

    public async load() {
        const eventFiles = readdirSync(resolve(Deno.cwd(), "events"));

        for (const eventFile of eventFiles) {
            const event = await this.import(resolve(Deno.cwd(), "events", eventFile));

            if (event) {
                this.client.on(event.eventName, event.execute.bind(event));
            }
        }
    }

    private async import(path: string): Promise<BaseEvent|undefined> {
        const url = new URL(`file://${path}`);
        const event = (await import(url.toString())).default as (new (client: Bot) => BaseEvent)|undefined;

        return event ? new event(this.client) : undefined;
    }
}
