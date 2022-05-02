import { CommandContext } from "../structures/CommandContext";
import { createEmbed } from "../utils/functions/createEmbed";
import { BaseEvent } from "../structures/BaseEvent";
import { Event } from "../utils/decorators/Event";
import { Interaction } from "discord.js";

@Event("interactionCreate")
export class InteractionCreateEvent extends BaseEvent {
    public execute(interaction: Interaction): void {
        if (!interaction.inGuild()) return;

        const context = new CommandContext(interaction);
        if (interaction.isContextMenu()) {
            const data = interaction.options.getUser("user") ?? interaction.options.getMessage("message");
            const cmd = this.client.commands.find(
                // eslint-disable-next-line @typescript-eslint/no-extra-parens
                x => ((data as { type: string }).type === "MESSAGE"
                    ? x.meta.contextChat === interaction.commandName
                    : x.meta.contextUser === interaction.commandName)
            );
            if (cmd) {
                context.additionalArgs.set("options", data);
                void cmd.execute(context);
            }
        }

        if (interaction.isCommand()) {
            const cmd = this.client.commands.filter(x => x.meta.slash !== undefined)
                .find(x => x.meta.slash!.name === interaction.commandName);
            if (cmd) {
                void cmd.execute(context);
            }
        }

        if (interaction.isSelectMenu()) {
            const val = this.client.utils.atob(interaction.customId);
            const user = val.split("_")[0] ?? "";
            const cmd = val.split("_")[1] ?? "";
            const exec = (val.split("_")[2] ?? "yes") === "yes";

            if (interaction.user.id !== user) {
                void interaction.reply({
                    ephemeral: true,
                    embeds: [createEmbed("error", `Sorry, but that interaction is only for <@${user}>`, true)]
                });
            }
            if (cmd && user === interaction.user.id && exec) {
                const command = this.client.commands.filter(x => x.meta.slash !== undefined)
                    .find(x => x.meta.name === cmd);
                if (command) {
                    context.additionalArgs.set("values", interaction.values);
                    void command.execute(context);
                }
            }
        }
    }
}
