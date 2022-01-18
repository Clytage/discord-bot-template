import { CommandQueryContext } from "./CommandQueryContext";
import { CommandQuery } from "../typings";
import { Rin } from "./Rin";

export abstract class BaseCommand {
    public constructor(public readonly rin: Rin, public readonly data: CommandQuery) {}

    public abstract execute(context: CommandQueryContext): Promise<void> | void;
}
