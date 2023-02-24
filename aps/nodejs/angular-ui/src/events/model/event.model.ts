export class EventModel {
    name: string;

    payload: unknown;

    constructor(name: string, payload: unknown = null) {
        this.name = name;
        this.payload = payload;
    }
}
