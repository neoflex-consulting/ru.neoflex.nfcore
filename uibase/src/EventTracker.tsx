import {IEventHandler} from "./MainContext";
import {IEvent} from "./MainContext";

export default class EventTracker {
    private handlers: IEventHandler[] = [];

    addEventHandler(eventHandler: IEventHandler){
        this.handlers.push(eventHandler)
    }

    removeEventHandler(name: string) {
        this.handlers = this.handlers.filter(el => el.name !== name);

    }

    notifyAllEventHandlers(event: IEvent) {
        this.handlers.forEach(el => {
            if (el.name === event.itemName && el.eventType === event.type)
                el.callback(event.value)
        })
    }
}