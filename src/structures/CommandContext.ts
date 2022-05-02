import { ButtonInteraction, Collection, CommandInteraction, Guild, Interaction, InteractionReplyOptions, Message, MessageOptions, MessagePayload, SelectMenuInteraction, TextBasedChannel, User } from "discord.js";

export class CommandContext {
    public additionalArgs: Collection<string, any> = new Collection();

    public constructor(public readonly context: Interaction | Message, public args: string[] = []) {}

    public get author(): User {
        return this.isInteraction() ? this.context.user : (this.context as Message).author;
    }

    public get deferred(): boolean {
        return this.isCommand() && this.context.deferred;
    }

    public get channel(): TextBasedChannel | null {
        return this.context.channel;
    }

    public get guild(): Guild | null {
        return this.context.guild;
    }

    public get options(): CommandInteraction["options"] | null {
        return this.isCommand() ? this.context.options : null;
    }

    public async deferReply(): Promise<void> {
        return this.isInteraction() ? (this.context as CommandInteraction).deferReply() : undefined;
    }

    public async reply(options: Parameters<this["send"]>[0], autoedit?: boolean): Promise<Message> {
        if (this.isCommand() && (this.context.replied || this.context.deferred) && !autoedit) {
            throw new Error("Interaction is already replied.");
        }

        const reply = await this.send(
            options,
            this.isCommand() && (this.context.replied || this.context.deferred) ? "editReply" : "reply"
        ).catch((e: Error) => e);
        if (reply instanceof Error) throw new Error(`Unable to reply context, because: ${reply.message}`);

        return reply;
    }

    public async send(options: InteractionReplyOptions
    | MessageOptions
    | MessagePayload
    | string, type: "editReply" | "followUp" | "reply"): Promise<Message> {
        if (this.isInteraction()) {
            (options as InteractionReplyOptions).fetchReply = true;
            const msg = await (this.context as CommandInteraction)[type](options as InteractionReplyOptions | MessagePayload | string) as Message;
            const channel = this.context.channel;
            const res = await channel!.messages.fetch(msg.id).catch(() => null);
            return res ?? msg;
        }
        if ((options as InteractionReplyOptions).ephemeral) {
            throw new Error("Cannot send ephemeral message in a non-interaction context.");
        }
        return this.context.channel!.send(options as MessageOptions | MessagePayload | string);
    }

    public isInteraction(): this is InteractionCommandContext {
        return this.context instanceof Interaction;
    }

    public isCommand(): this is CommandInteractionCommandContext {
        return this.context instanceof CommandInteraction;
    }

    public isButton(): this is ButtonInteractionCommandContext {
        return this.context instanceof ButtonInteraction;
    }

    public isSelectMenu(): this is SelectMenuInteractionCommandContext {
        return this.context instanceof SelectMenuInteraction;
    }
}

type InteractionCommandContext = CommandContext & { context: Interaction };
type CommandInteractionCommandContext = CommandContext & { context: CommandInteraction; options: CommandInteraction["options"] };
type ButtonInteractionCommandContext = CommandContext & { context: ButtonInteraction; options: null };
type SelectMenuInteractionCommandContext = CommandContext & { context: SelectMenuInteraction; options: null };
