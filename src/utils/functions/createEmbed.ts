import { embedColor } from "../../config";
import { ColorResolvable, MessageEmbed } from "discord.js";

type hexColorsType = "error" | "info" | "success" | "warn";
const hexColors: Record<hexColorsType, string> = {
    error: "RED",
    info: embedColor as string,
    success: "GREEN",
    warn: "YELLOW"
};

export function createEmbed(type: hexColorsType, message?: string, emoji = false): MessageEmbed {
    const embed = new MessageEmbed()
        .setColor(hexColors[type] as ColorResolvable);

    if (message) embed.setDescription(message);
    if (type === "error" && emoji) embed.setDescription(`<:no1:783266403776069673> **|** ${message!}`);
    if (type === "success" && emoji) embed.setDescription(`<:yes1:783266376752168961> **|** ${message!}`);
    return embed;
}
