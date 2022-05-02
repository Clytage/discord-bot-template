import { createEmbed } from "../utils/functions/createEmbed";
import { BaseEvent } from "../structures/BaseEvent";
import { Event } from "../utils/decorators/Event";
import { Message, User } from "discord.js";

@Event<typeof MessageCreateEvent>("messageCreate")
export class MessageCreateEvent extends BaseEvent {
    public execute(message: Message): void {
        if (message.author.bot || message.channel.type === "DM") return;
        if (message.content.startsWith(this.client.config.prefix)) {
            void this.client.commands.handle(message);
            return;
        }

        if (this.getUserFromMention(message.content)?.id === this.client.user?.id) {
            message.reply({
                embeds: [createEmbed("info", `:wave: **|** Hi ${message.author.toString()}, my prefix is **\`${this.client.config.prefix}\`**`)]
            }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        }
    }

    private getUserFromMention(mention: string): User | undefined {
        // eslint-disable-next-line prefer-named-capture-group
        const matches = (/^<@!?(\d+)>$/).exec(mention);
        if (!matches) return undefined;

        const id = matches[1];
        return this.client.users.cache.get(id);
    }
}
