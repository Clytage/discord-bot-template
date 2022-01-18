import { InteractionCheckerManager } from "../utils/InteractionCheckerManager";
import { MessageCheckerManager } from "../utils/MessageCheckerManager";
import { CommandManager } from "../utils/CommandManager";
import { EventManager } from "../utils/EventManager";
import { ClientUtils } from "../utils/ClientUtils";
import * as config from "../config";
import { Client } from "discord.js";
import { resolve } from "path";

export class Rin extends Client {
    public readonly commands = new CommandManager(resolve(__dirname, "../commands"), this);
    public readonly events = new EventManager(this, resolve(__dirname, "../events"));
    public readonly checkers = {
        message: new MessageCheckerManager(this, resolve(__dirname, "../checkers", "message")),
        interaction: new InteractionCheckerManager(this, resolve(__dirname, "../checkers", "interaction"))
    };

    public readonly utils = new ClientUtils();
    public readonly config = config;

    public async build(): Promise<Rin> {
        await this.events.load();
        await this.login();
        return this;
    }
}
