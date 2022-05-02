/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/functions/createEmbed";
import { BaseCommand } from "../../structures/BaseCommand";
import { Command } from "../../utils/decorators/Command";
import { Message, MessageActionRow, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";

@Command<typeof HelpCommand>({
    aliases: ["h", "command", "commands", "cmd", "cmds"],
    description: "Shows the command list or information for a specific command",
    name: "help",
    slash: {
        options: [
            {
                type: "STRING",
                name: "command",
                description: "Command name to view a specific information about the command"
            }
        ]
    },
    usage: "{prefix}help [command]"
})
export class HelpCommand extends BaseCommand {
    private readonly listEmbed = createEmbed("info")
        .setAuthor({
            name: `${this.client.user!.username} - Command List`,
            iconURL: this.client.user?.displayAvatarURL()
        })
        .setFooter({
            text: `${this.client.config.prefix}help <command> to get more information on a specific command`,
            iconURL: "https://raw.githubusercontent.com/Cyteliz/rawon/main/.github/images/info.png"
        });

    private readonly infoEmbed = createEmbed("info")
        .setThumbnail("https://raw.githubusercontent.com/Cyteliz/rawon/main/.github/images/question_mark.png");

    public async execute(ctx: CommandContext): Promise<Message | undefined> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        this.infoEmbed.fields = [];
        const val = ctx.args[0] ??
            ctx.options?.getString("command") ??
                (
                    ctx.additionalArgs.get("values")
                        ? (ctx.additionalArgs.get("values") as string[])[0]
                        : null
                );
        const command = this.client.commands.get(val) ??
            this.client.commands.get(this.client.commands.aliases.get(val)!);
        if (!val) {
            const embed = this.listEmbed
                .setThumbnail(ctx.guild!.iconURL({ dynamic: true, format: "png", size: 2048 })!);

            this.listEmbed.fields = [];
            for (const category of this.client.commands.categories.values()) {
                const isDev = this.client.config.devs.includes(ctx.author.id);
                const cmds = category.cmds
                    // eslint-disable-next-line @typescript-eslint/no-extra-parens
                    .filter(c => (isDev ? true : !c.meta.devOnly))
                    .map(c => `\`${c.meta.name}\``);
                if (cmds.length === 0) continue;
                if (category.hide && !isDev) continue;
                embed.addField(`**${category.name}**`, cmds.join(", "));
            }

            ctx.send({ embeds: [embed] }, "editReply")
                .catch(e => this.client.logger.error("PROMISE_ERR:", e));
            return;
        }
        if (!command) {
            const matching = this.generateSelectMenu(val, ctx.author.id);
            if (!matching.length) {
                return ctx.send({
                    embeds: [createEmbed("error", "Couldn't find any matching command name", true)]
                }, "editReply");
            }

            return ctx.send({
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setMinValues(1)
                                .setMaxValues(1)
                                .setCustomId(
                                    Buffer.from(`${ctx.author.id}_${this.meta.name}`)
                                        .toString("base64")
                                )
                                .addOptions(matching)
                                .setPlaceholder("Please select the command")
                        )
                ],
                embeds: [createEmbed("error", "Couldn't find matching command name. Did you mean this?", true)]
            }, "editReply");
        }
        // Disable selection menu
        if (ctx.isSelectMenu()) {
            const channel = ctx.channel;
            const msg = await channel!.messages.fetch((ctx.context as SelectMenuInteraction).message.id)
                .catch(() => undefined);
            if (msg !== undefined) {
                const selection = msg.components[0].components.find(x => x.type === "SELECT_MENU");
                selection!.setDisabled(true);
                await msg.edit({ components: [new MessageActionRow().addComponents(selection!)] });
            }
        }
        // Return information embed
        return ctx.send({
            embeds: [this.infoEmbed
                .setAuthor({
                    name: `${this.client.user!.username} - Information about ${command.meta.name} command`,
                    iconURL: this.client.user?.displayAvatarURL()
                })
                .addField(
                    "Name",
                    `**\`${command.meta.name}\`**`,
                    false
                )
                .addField(
                    "Description",
                    `${command.meta.description!}`,
                    true
                )
                .addField(
                    "Aliases",
                    command.meta.aliases?.length
                        ? command.meta.aliases.map(c => `**\`${c}\`**`).join(", ")
                        : "None."
                    , false
                )
                .addField(
                    "Usage",
                    `**\`${command.meta.usage!.replace(/{prefix}/g, this.client.config.prefix)}\`**`,
                    true
                )
                .setFooter({
                    text: `<> = required | [] = optional ${command.meta.devOnly ? "(developer-only command)" : ""}`,
                    iconURL: "https://raw.githubusercontent.com/Cyteliz/rawon/.github/images/info.png"
                })]
        }, "editReply");
    }

    private generateSelectMenu(cmd: string, author: string): MessageSelectOptionData[] {
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        const matching = [...this.client.commands.values()].filter(x => {
            const isDev = this.client.config.devs.includes(author);
            if (isDev) return x.meta.name.includes(cmd);
            return x.meta.name.includes(cmd) && !x.meta.devOnly;
        }).slice(0, 10).map((x, i) => (
            {
                label: x.meta.name,
                emoji: emojis[i],
                description: x.meta.description!.length > 47 ? `${x.meta.description!.slice(0, 47)}...` : x.meta.description!,
                value: x.meta.name
            }
        ));
        return matching;
    }
}
