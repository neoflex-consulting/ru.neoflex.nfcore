import {IEvent, IEventHandler} from "./MainContext";

export default class EventTracker {
    private handlers: IEventHandler[] = [];

    addEventHandler(eventHandler: IEventHandler){
        this.handlers.push(eventHandler)
    }

    removeEventHandler(itemId: string) {
        this.handlers = this.handlers.filter(el => el.itemId !== itemId);

    }

    notifyAllEventHandlers(event: IEvent) {
        this.handlers.forEach(el => {
            if (el.itemId === event.itemId && el.eventType === event.type && event.type) {
                el.callback(event.value)
            }
        })
    }
}