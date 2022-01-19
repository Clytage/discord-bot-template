import { BaseEvent } from "../structures/BaseEvent.ts";

export default class ReadyEvent extends BaseEvent {
    public constructor(client: BaseEvent["client"]) {
        super(client, "ready");
    }

    public execute() {
        console.log(`Logged in as ${this.client.user?.tag}!`);
    }
}
