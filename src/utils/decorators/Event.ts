import { BaseEvent, ExtendedEventConstructor } from "../../structures/BaseEvent";
import { ClassDecorator } from "../../typings";

export function Event<T extends NonAbstractConstructor<BaseEvent> = ExtendedEventConstructor>(
    event: BaseEvent["name"]
): ClassDecorator<T, T> {
    return target => new Proxy(target, {
        construct: (
            trgt,
            args: [BaseEvent["client"]]
        ) => new trgt(...args, event)
    });
}
