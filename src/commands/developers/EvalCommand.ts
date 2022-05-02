import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/functions/createEmbed";
import { BaseCommand } from "../../structures/BaseCommand";
import { Command } from "../../utils/decorators/Command";
import { inspect } from "util";

@Command<typeof EvalCommand>({
    aliases: ["evaluate", "ev", "js-exec"],
    cooldown: 0,
    description: "Evaluate to the bot",
    devOnly: true,
    name: "eval",
    usage: "{prefix}eval <some code>"
})
export class EvalCommand extends BaseCommand {
    public async execute(ctx: CommandContext): Promise<void> {
        const embed = createEmbed("info")
            .addField("Input", `\`\`\`js\n${ctx.args.join(" ")}\`\`\``);

        try {
            const code = ctx.args.join(" ");
            if (!code) {
                await ctx.reply({
                    embeds: [createEmbed("error", "No code was provided.", true)]
                });

                return;
            }

            const isAsync = (/.*\s--async\s*(?:--silent)?$/).test(code);
            const isSilent = (/.*\s--silent\s*(?:--async)?$/).test(code);
            const toExecute = isAsync || isSilent
                ? code.replace(/--(?:async|silent)\s*(?:--(?:silent|async))?$/, "")
                : code;
            const evaled = inspect(
                // eslint-disable-next-line no-eval
                await eval(
                    isAsync
                        ? `(async () => {\n${toExecute}\n})()`
                        : toExecute
                ), { depth: 0 }
            );

            if (isSilent) return;

            const cleaned = this.clean(evaled);
            const output = cleaned.length > 1024
                ? `${await this.hastebin(cleaned)}.js`
                : `\`\`\`js\n${cleaned}\`\`\``;

            embed.addField("Output", output);
            ctx.reply({
                embeds: [embed]
            }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        } catch (e) {
            const cleaned = this.clean(String(e));
            const isTooLong = cleaned.length > 1024;
            const error = isTooLong
                ? `${await this.hastebin(cleaned)}.js`
                : `\`\`\`js\n${cleaned}\`\`\``;

            embed.setColor("RED").addField("Error", error);
            ctx.reply({
                embeds: [embed]
            }).catch(er => this.client.logger.error("PROMISE_ERR:", er));
        }
    }

    // eslint-disable-next-line class-methods-use-this
    private clean(text: string): string {
        return text
            .replace(new RegExp(process.env.DISCORD_TOKEN!, "g"), "[REDACTED]")
            .replace(/`/g, `\`${String.fromCharCode(8203)}`)
            .replace(/@/g, `@${String.fromCharCode(8203)}`);
    }

    private async hastebin(text: string): Promise<string> {
        const result = await this.client.request.post("https://bin.cyteliz.net/documents", {
            body: text
        }).json<{ key: string }>();

        return `https://bin.cyteliz.net/${result.key}`;
    }
}
