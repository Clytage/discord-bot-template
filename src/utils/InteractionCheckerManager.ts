import { Rin } from "../structures/Rin";
import { Interaction } from "discord.js";
import { readdirSync } from "fs";
import { resolve } from "path";

export type InteractionChecker = (interaction: Interaction) => void;

export class InteractionCheckerManager {
    public readonly checkers: InteractionChecker[] = [];

    public constructor(public readonly rin: Rin, private readonly basePath: string) {}

    public async load(): Promise<void> {
        const files = readdirSync(this.basePath);

        for (const file of files) {
            const fileData = await import(resolve(this.basePath, file)) as { default: InteractionChecker | undefined };
            if (!fileData.default) continue;

            this.checkers.push(fileData.default);
        }
    }
}
