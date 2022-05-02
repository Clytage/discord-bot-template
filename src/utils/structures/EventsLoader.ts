import { BaseEvent } from "../../structures/BaseEvent";
import { Bot } from "../../structures/Bot";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

export class EventsLoader {
    public constructor(public readonly client: Bot, private readonly path: string) {}

    public async load(): Promise<void> {
        const events = await readdir(resolve(this.path));
        this.client.logger.info(`Loading ${events.length} events...`);

        for (const file of events) {
            const event = await this.client.utils.import<BaseEvent>(resolve(this.path, file), this.client);
            if (!event) {
                this.client.logger.error(`File ${file} is not a valid event file.`);
                continue;
            }

            this.client.logger.info(`Listener for event ${event.name} has been added`);
            this.client.on(event.name, (...args) => event.execute(...args));
        }

        this.client.logger.info("Done loading events.");
    }
}
