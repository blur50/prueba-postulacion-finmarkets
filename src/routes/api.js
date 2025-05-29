import express from 'express';

import { TaskModel } from '../model/index.js';
import { WssBroadCaster } from './websocket/index.js';
import { MaxValueExceededError, tasksPostBodySchema, tasksPutBodySchema } from '../utils/index.js';

// Crear Router y configurarlo
const APIRouter = express.Router();
APIRouter.use(express.json());

// TODO: Agregar un handler middleware de error de JSON malformado

// GET /tasks
APIRouter.get("/", async (request, response) => {
  try {
    const tasks = await TaskModel.List();
    if (tasks === null) throw new Error();

    response.json(
      {
        status: 'success',
        tasks
      }
    );

  } catch (error) {
    response.status(500).json(
      {
        status: 'error',
        message: 'An error occurred while trying to list tasks'
      }
    );
  }
});

// POST task
APIRouter.post("/", async (request, response) => {
  const { error, value: { titulo, descripcion } } = tasksPostBodySchema.validate(request.body);

  if (error) {
    response.status(400).json(
      {
        status: 'error',
        message: error.details[0].message.replaceAll('"', "'")
      }
    );
    return;
  }

  try {
    const taskId = await TaskModel.Create(titulo, descripcion);
    if (taskId === null) throw new Error();  // Levantar error para responder con JSON de error

    const task = await TaskModel.Read(taskId);
    if (task === null) throw new Error(); // Levantar error para responder con JSON de error

    // Enviar evento 'taskCreated' a clientes conectados por Websocket
    WssBroadCaster.broadcastEvent('taskCreated', { task });

    response.json(
      {
        status: 'success',
        task
      }
    );

  } catch (error) {
    if (error instanceof MaxValueExceededError) {
      response.status(400).json(
        {
          status: 'success',
          message: error.message
        }
      );
    } else {
      response.status(500).json(
        {
          status: 'error',
          message: 'An error occurred while trying to create the task'
        }
      );
    }
  }
});

// PUT task
APIRouter.put("/:taskId", async (request, response) => {
  const { taskId } = request.params;
  const { error, value: { status } } = tasksPutBodySchema.validate(request.body);

  if (error) {
    response.status(400).json(
      {
        status: 'error',
        message: error.details[0].message.replaceAll('"', "'")
      }
    );
    return;
  }

  try {
    const success = await TaskModel.Update(taskId, status);
    if (!success) throw new Error();  // Levantar error para responder con JSON de error

    const task = await TaskModel.Read(taskId);
    if (task === null) throw new Error();  // Levantar error para responder con JSON de error

    // Enviar evento 'taskUpdated' a clientes conectados por Websocket
    WssBroadCaster.broadcastEvent('taskUpdated', { task });

    response.json(
      {
        status: 'success',
        task: task
      }
    );

  } catch (error) {
    response.status(500).json(
      {
        status: 'error',
        message: `An error occurred while trying to update the task '${taskId}'`
      }
    );
  }
});


// DELETE task
APIRouter.delete("/:taskId", async (request, response) => {
  const { taskId } = request.params;

  try {
    const success = await TaskModel.Delete(taskId);
    if (!success) throw new Error(); // Levantar error para responder con JSON de error

    const task = await TaskModel.Read(taskId, true);
    if (task === null) throw new Error(); // Levantar error para responder con JSON de error

    // Enviar evento 'taskDeleted' a clientes conectados por Websocket
    WssBroadCaster.broadcastEvent('taskDeleted', { task });

    response.json(
      {
        status: 'success',
        task: task
      }
    );

  } catch (error) {
    response.status(500).json(
      {
        status: 'error',
        message: `An error occurred while trying to delete the task '${taskId}'`
      }
    );
  }
});

export default APIRouter;
