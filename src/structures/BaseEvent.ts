import { Rin } from "./Rin";
import { ClientEvents } from "discord.js";

export abstract class BaseEvent<EventName extends keyof ClientEvents = keyof ClientEvents> {
    public constructor(public readonly rin: Rin, public readonly name: EventName) {}

    public abstract run(...args: ClientEvents[EventName]): Promise<void> | void;
}
