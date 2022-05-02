import { CommandContext } from "../../structures/CommandContext";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../functions/createEmbed";
import { Bot } from "../../structures/Bot";
import { ApplicationCommandData, Collection, Guild, Message, Snowflake, TextChannel } from "discord.js";
import { readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export class CommandManager extends Collection<string, BaseCommand> {
    public readonly categories: Collection<string, RahagiaBot.CategoryMeta> = new Collection();
    public readonly aliases: Collection<string, string> = new Collection();
    private readonly cooldowns: Collection<string, Collection<Snowflake, number>> = new Collection();

    public constructor(public readonly client: Bot, private readonly path: string) { super(); }

    public async load(): Promise<void> {
        const categories = await readdir(resolve(this.path));
        this.client.logger.info(`Found ${categories.length} categories, registering...`);

        for (const category of categories) {
            const meta = (await import(
                pathToFileURL(resolve(this.path, category, "category.meta.js")).toString()
            ) as { default: RahagiaBot.CategoryMeta }).default;
            let disabled = 0;

            this.client.logger.info(`Registering category "${meta.name}"...`);
            meta.cmds = new Collection();

            const files = (await readdir(resolve(this.path, category)))
                .filter(file => file !== "category.meta.js");

            for (const file of files) {
                try {
                    const path = resolve(this.path, category, file);
                    const allCmd = await this.client.application!.commands.fetch();
                    const command = await this.client.utils.import<BaseCommand>(path, this.client);
                    if (!command) throw new Error(`File ${file} is not a valid command file.`);

                    command.meta = {
                        ...command.meta,
                        path,
                        category
                    };
                    this.set(command.meta.name, command);
                    meta.cmds.set(command.meta.name, command);

                    if (Number(command.meta.aliases?.length) > 0) {
                        for (const alias of command.meta.aliases ?? []) {
                            this.aliases.set(alias, command.meta.name);
                        }
                    }

                    if (command.meta.contextChat) {
                        await this.registerCmd({
                            name: command.meta.contextChat,
                            type: "MESSAGE"
                        }, {
                            onError: (g, err) => this.client.logger.error(`Unable to register ${command.meta.name} to message context for ${g?.id ?? "???"}, reason: ${err.message}`),
                            onRegistered: g => this.client.logger.info(`Registered ${command.meta.name} to message context for ${g.id}`)
                        });
                        if (!this.client.config.isDev) this.client.logger.info(`Registered ${command.meta.name} to message context for global.`);
                    }
                    if (command.meta.contextUser) {
                        await this.registerCmd({
                            name: command.meta.contextUser,
                            type: "USER"
                        }, {
                            onError: (g, err) => this.client.logger.error(`Unable to register ${command.meta.name} to user context for ${g?.id ?? "???"}, reason: ${err.message}`),
                            onRegistered: g => this.client.logger.info(`Registered ${command.meta.name} to user context for ${g.id}`)
                        });
                        if (!this.client.config.isDev) this.client.logger.info(`Registered ${command.meta.name} to user context for global.`);
                    }
                    if (!allCmd.has(command.meta.name) && command.meta.slash && this.client.config.enableSlashCommand) {
                        if (!command.meta.slash.name) {
                            Object.assign(command.meta.slash, {
                                name: command.meta.name
                            });
                        }
                        if (!command.meta.slash.description) {
                            Object.assign(command.meta.slash, {
                                description: command.meta.description
                            });
                        }

                        await this.registerCmd(command.meta.slash as ApplicationCommandData, {
                            onError: (g, err) => this.client.logger.error(`Unable to register ${command.meta.name} to slash command for ${g?.id ?? "???"}, reason: ${err.message}`),
                            onRegistered: g => this.client.logger.info(`Registered ${command.meta.name} to slash command for ${g.id}`)
                        });
                        if (!this.client.config.isDev) this.client.logger.info(`Registered ${command.meta.name} to slash command for global.`);
                    }
                    this.client.logger.info(`Command ${command.meta.name} from ${category} category is now loaded.`);
                    if (command.meta.disable) disabled++;
                } catch (err) {
                    this.client.logger.error(`Error occured while loading ${file}: ${(err as Error).message}`);
                }
            }

            this.categories.set(category, meta);
            this.client.logger.info(`Done loading ${files.length} commands in ${category} category.`);
            if (disabled) this.client.logger.info(`${disabled} out of ${files.length} commands in ${category} category is disabled.`);
        }
    }

    public handle(message: Message): Promisable<void> {
        const args = message.content.substring(this.client.config.prefix.length).trim().split(/ +/);
        const cmd = args.shift()?.toLowerCase();
        const command = this.get(cmd!) ?? this.get(this.aliases.get(cmd!)!);
        if (!command || command.meta.disable) return undefined;
        if (!this.cooldowns.has(command.meta.name)) this.cooldowns.set(command.meta.name, new Collection());
        const now = Date.now();
        const timestamps = this.cooldowns.get(command.meta.name);
        const cooldownAmount = (command.meta.cooldown ?? 3) * 1000;
        if (timestamps?.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                message.reply({ embeds: [createEmbed("warn", `${message.author.toString()}, please wait **\`${timeLeft.toFixed(1)}\`** of cooldown time.`)] }).then(msg => {
                    setTimeout(() => msg.delete(), 3500);
                }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
                return undefined;
            }

            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        } else {
            timestamps?.set(message.author.id, now);
            if (this.client.config.devs.includes(message.author.id)) timestamps?.delete(message.author.id);
        }
        try {
            if (command.meta.devOnly && !this.client.config.devs.includes(message.author.id)) return undefined;
            return command.execute(new CommandContext(message, args));
        } catch (e) {
            this.client.logger.error("COMMAND_HANDLER_ERR:", e);
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            if (command.meta.devOnly && !this.client.config.devs.includes(message.author.id)) return undefined;
            this.client.logger.info(
                `${message.author.tag} [${message.author.id}] is using ${command.meta.name} command from ${command.meta.category!} category ` +
                `on #${(message.channel as TextChannel).name} [${message.channel.id}] in guild: ${message.guild!.name} [${message.guild!.id}]`
            );
        }
    }

    private async registerCmd(data: ApplicationCommandData, options?: RahagiaBot.RegisterCmdOptions): Promise<void> {
        if (options && this.client.config.isDev) {
            for (const id of this.client.config.devGuild) {
                let guild: Guild | null = null;

                try {
                    guild = await this.client.guilds.fetch(id).catch(() => null);
                    if (!guild) throw new Error("Invalid Guild");

                    await guild.commands.create(data);
                    void options.onRegistered(guild);
                } catch (err) {
                    void options.onError(guild, err as Error);
                }
            }
        } else {
            await this.client.application!.commands.create(data);
        }
    }
}
