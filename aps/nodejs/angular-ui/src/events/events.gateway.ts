import {
  // MessageBody,
  // SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  // WsResponse,
} from '@nestjs/websockets';
// import { from, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import { Server } from 'ws';
import { EventModel } from './model/event.model';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // @SubscribeMessage('events')
  // findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
  //   return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  // }
  //
  // @SubscribeMessage('identity')
  // async identity(@MessageBody() data: number): Promise<number> {
  //   return data;
  // }

  dispatchEvent(event: EventModel): void {
    // warning: they can be more than one
    // if(this.webSocket) {
    //   this.webSocket.send(JSON.stringify({ event: event.name, payload: event.payload }));
    // }

    this.server.clients.forEach(function each(client) {
      // if (client.readyState === WebSocket.OPEN) {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ event: event.name, payload: event.payload }));
      }
    });
  }
}
