import express from 'express';
import path from 'node:path';

const WebAppRouter = express.Router();

WebAppRouter.get("/", (request, response) => {
  response.sendFile(path.join(path.resolve(), "src/public/index.html"));
});

export default WebAppRouter;
