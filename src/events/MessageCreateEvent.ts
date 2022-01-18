import { BaseEvent } from "../structures/BaseEvent";
import { Message } from "discord.js";

export class MessageCreateEvent extends BaseEvent {
    public constructor(rin: BaseEvent["rin"]) {
        super(rin, "messageCreate");
    }

    public run(message: Message): void {
        if (message.content.startsWith(this.rin.config.prefix!)) {
            this.rin.commands.handle(message);
        }
    }
}
