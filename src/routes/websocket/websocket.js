import { Router } from 'websocket-express';

const WebsocketRouter = new Router();

WebsocketRouter.ws("/", async (request, response) => {
  const ws = await response.accept();

  ws.send(JSON.stringify({ "event": "connected" }));
});


export default WebsocketRouter;
