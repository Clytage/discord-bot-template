import { BaseEvent } from "../structures/BaseEvent";

export class ReadyEvent extends BaseEvent {
    public constructor(rin: BaseEvent["rin"]) {
        super(rin, "ready");
    }

    public run(): void {
        console.log(`Logged in as ${this.rin.user!.tag}`);
        void this.rin.checkers.message.load();
        void this.rin.checkers.interaction.load();
        this.rin.commands.load();
    }
}
