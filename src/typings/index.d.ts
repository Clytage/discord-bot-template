import { ActivityOptions, ApplicationCommandOptionData, ApplicationCommandType, ClientPresenceStatus, Collection, Guild } from "discord.js";
import { BaseCommand } from "../structures/BaseCommand";

export interface SlashOption {
    options?: ApplicationCommandOptionData[];
    type?: ApplicationCommandType;
    defaultPermission?: boolean;
    description?: string;
    name?: string;
}

export type ClassDecorator<Target extends Constructor, Result = unknown> = (target: Target) => Result;

declare global {
    type Promisable<A> = A | Promise<A>;

    type Constructor<Result = unknown> =
    | NonAbstractConstructor<Result>
    | (abstract new (...args: any[]) => Result);
    type NonAbstractConstructor<Result = unknown> = new (...args: any[]) => Result;

    namespace RahagiaBot {
        interface CommandMeta {
            readonly category?: string;
            readonly path?: string;
            contextChat?: string;
            contextUser?: string;
            description?: string;
            slash?: SlashOption;
            aliases?: string[];
            cooldown?: number;
            disable?: boolean;
            devOnly?: boolean;
            usage?: string;
            name: string;
        }

        interface CategoryMeta {
            cmds: Collection<string, BaseCommand>;
            hide: boolean;
            name: string;
        }

        interface RegisterCmdOptions {
            onRegistered: (guild: Guild) => Promisable<any>;
            onError: (guild: Guild | null, error: Error) => Promisable<any>;
        }

        interface PresenceData {
            activities: ActivityOptions[];
            status: ClientPresenceStatus[];
            interval: number;
        }
    }
}
