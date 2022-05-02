import { Bot } from "./Bot";
import { ClientEvents } from "discord.js";

export abstract class BaseEvent {
    public constructor(public readonly client: Bot, public readonly name: keyof ClientEvents) {}

    public abstract execute(...args: unknown[]): Promisable<any>;
}

export type ExtendedEventConstructor = new (...args: ConstructorParameters<typeof BaseEvent>) => BaseEvent;
