import { Command, CommandContext } from "../deps/harmony.ts";

export const command = class HelpCommand extends Command {
    name = "help";
    aliases = ["h"];

    execute(ctx: CommandContext) {
        ctx.message.reply("Hello!");
    }
}
