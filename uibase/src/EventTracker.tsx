import {IEventHandler} from "./MainContext";
import {eventType} from "./utils/consts";

interface IEvent {
    type: eventType,
    itemName: string
}

export default class EventTracker {
    private handlers: IEventHandler[] = [];

    private addEventHandler(eventHandler: IEventHandler){
        this.handlers.push(eventHandler)
    }

    private removeEventHandler(name: string) {
        this.handlers = this.handlers.filter(el => el.name !== name);
    }

    private notifyAll(event: IEvent) {
        this.handlers.forEach(el => {
            if (el.name === event.itemName && el.eventType === event.type)
                el.callback()
        })
    }
}