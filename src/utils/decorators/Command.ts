import { BaseCommand, ExtendedCommandConstructor } from "../../structures/BaseCommand";
import { ClassDecorator } from "../../typings";

export function Command<T extends NonAbstractConstructor<BaseCommand> = ExtendedCommandConstructor>(
    meta: BaseCommand["meta"]
): ClassDecorator<T, T> {
    return target => new Proxy(target, {
        construct: (
            trgt,
            args: [BaseCommand["client"]]
        ) => new trgt(...args, meta)
    });
}
