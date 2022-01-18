import { CommandQueryContext } from "../structures/CommandQueryContext";
import { CategoryData } from "../typings";
import { BaseCommand } from "../structures/BaseCommand";
import { Rin } from "../structures/Rin";
import { Collection, Message } from "discord.js";
import { resolve } from "path";
import { glob } from "glob";

// eslint-disable-next-line prefer-named-capture-group
const categoryPathRegex = /(\/)?.*?\/\[category\](.js|.ts)/;

export class CommandManager {
    private readonly categories: Collection<string, CategoryData> = new Collection();
    private readonly commands: Collection<string, BaseCommand> = new Collection();
    private get pattern(): string {
        return resolve(this.basePath, "**", "*.{js,ts}");
    }

    public constructor(private readonly basePath: string, public readonly rin: Rin) {}

    public load(): void {
        this.categories.clear();
        this.commands.clear();

        glob(this.pattern, async (err, files) => {
            if (err) {
                throw err;
            }

            for (const path of files.sort((a, b) => a.length - b.length)) {
                const sliced = path.slice(this.basePath.length);
                const paths = sliced.replace(/\\|\//g, "/").split("/");

                if (categoryPathRegex.test(sliced)) {
                    try {
                        const data = await import(path) as { category?: CategoryData };
                        if (data.category) {
                            data.category.path = sliced;
                            this.categories.set(data.category.key, data.category);

                            console.log(`Loaded category '${data.category.name}'`);
                        } else {
                            throw Error("Category data is not defined");
                        }
                    } catch (e) {
                        console.error(`Failed to load category at '${path}'. Reason: ${(e as Error).message}'`);
                    }

                    continue;
                }

                try {
                    const cmdConstructor = await import(path).then(m => (m as { default: (new (rin: BaseCommand["rin"]) => BaseCommand) | undefined }).default);
                    if (!cmdConstructor) {
                        throw Error("Command data is not defined");
                    }

                    const cmd = new cmdConstructor(this.rin);
                    const slicedPaths = paths.slice(2, paths.length);
                    cmd.data.regex = `${slicedPaths.join(" ")
                        .trim()
                        .replace(/\.ts|\.js/, "")}(.*)`;
                    cmd.data.path = path;

                    this.commands.set(cmd.data.path, cmd);
                    console.info(`Loaded command '${cmd.data.query}'`);
                } catch (erro) {
                    console.error(`Failed to load command at '${path}'. Reason: ${(erro as Error).message}'`);
                }
            }
        });
    }

    public handle(message: Message): void {
        const query = message.content.substring(this.rin.config.prefix!.length).trim();
        const command = this.commands
            .sort((a, b) => (b.data.regex ?? "").length - (a.data.regex ?? "").length)
            .find(cmd => cmd.data.regex ? new RegExp(cmd.data.regex, "i").test(query) : false);

        if (!command) return;

        try {
            const context = new CommandQueryContext(message, (new RegExp(command.data.regex!).exec(query)![1] as string | undefined)?.trim().split(" ") ?? []);
            void command.execute(context);
        } finally {
            console.log(`${message.author.tag} used command ${command.data.query} (${command.data.path ?? "?"})`);
        }
    }
}
