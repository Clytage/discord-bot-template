import { ColorResolvable, MessageEmbed } from "discord.js";
import { URL } from "url";
import got from "got";

type embedColorType = "danger" | "info" | "success" | "warning";
const embedColors: Record<embedColorType, string> = {
    info: "3CAAFF",
    success: "GREEN",
    warning: "YELLOW",
    danger: "RED"
};

function createEmbed(type: embedColorType, message?: string): MessageEmbed {
    const embed = new MessageEmbed()
        .setColor(embedColors[type] as ColorResolvable);

    if (message) embed.setDescription(message);
    return embed;
}

function isUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

export class ClientUtils {
    public readonly createEmbed = createEmbed;
    public readonly isUrl = isUrl;
    public readonly REST = got;
    public static readonly createEmbed = createEmbed;
    public static readonly isUrl = isUrl;
    public static readonly REST = got;
}
