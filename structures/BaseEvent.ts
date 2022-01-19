import { ClientEvents } from "../deps/harmony.ts";
import { Bot } from "./Bot.ts";

export abstract class BaseEvent {
    public constructor(public readonly client: Bot, public readonly eventName: keyof ClientEvents) {}

    public abstract execute(...args: unknown[]): void|Promise<void>;
}
