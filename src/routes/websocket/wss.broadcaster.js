import { WebSocket } from 'ws';
import { WebSocketServerNoSetup } from "../../utils/index.js";


export default class WssBroadCaster {

  wss = null;

  setup(wsServer) {
    this.wss = wsServer;
  }

  async broadcastEvent(event, payload) {
    if (!this.wss) throw new WebSocketServerNoSetup("The websocket server is not set up correctly. Aborting broadcast...");

    this.wss.clients.forEach((client) => {
      // Enviar evento a clientes conectados
      if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify({ event, payload }));
    });
  }
}
