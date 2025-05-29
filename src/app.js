import path from 'node:path';
import express from 'express';
import { WebSocketExpress } from 'websocket-express';

import { envs } from './config/index.js';
import { APIRouter, WebsockerRouter, WebAppRouter } from './routes/index.js';
import { WssBroadCaster } from './routes/websocket/index.js';

// Inicializar app de Express
const app = new WebSocketExpress();

// Registrar routers
app.useHTTP("/tasks", APIRouter);
app.useHTTP("/", WebAppRouter);
app.use("/ws", WebsockerRouter);

// Configurar ruta de archivos estáticos
app.use("/static", express.static(path.join(path.resolve(), "src/public/static")));

// Registrar instancia de servidor de Websockets para mandar mensajes en "broadcast"
WssBroadCaster.setup(app.wsServer);

// Iniciar recepción de requests del servicio
app.listen(envs.PORT, () => {
  console.log(`Server running on http://localhost:${envs.PORT}...`);
});
