import { CommandContext } from "./CommandContext";
import { Bot } from "./Bot";

export abstract class BaseCommand {
    public constructor(public readonly client: Bot, public meta: RahagiaBot.CommandMeta) {}

    public abstract execute(ctx: CommandContext): Promisable<any>;
}

export type ExtendedCommandConstructor = new (...args: ConstructorParameters<typeof BaseCommand>) => BaseCommand;
