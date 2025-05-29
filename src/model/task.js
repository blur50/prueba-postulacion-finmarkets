import BaseModel from './base.js';
import { TASK_STATUS, MaxValueExceededError } from '../utils/index.js';


export default class TaskModel extends BaseModel {

  async Create(titulo, descripcion = null) {
    let createdTaskId = null;

    // Agrego la validación de estos campos acá para ahorrarme una conexión a la base de datos
    if (titulo.length > 100) {
      throw MaxValueExceededError("Parameter 'titulo' cannot be longer than 100 characters.");
    }

    if (descripcion && descripcion.length > 500) {
      throw MaxValueExceededError("Parameter 'descripcion' cannot be longer than 100 characters.");
    }

    try {
      createdTaskId = await this.insert(
        `INSERT INTO task (titulo, descripcion, status) VALUES(?, ?, ?);`,
        [titulo, descripcion || '', TASK_STATUS.PENDIENTE]
      );
    } catch (error) {
      console.error(`Error when trying to create task: ${error}`);
    }

    return createdTaskId;
  }

  async List() {
    let tasks = null;

    try {
      // Se valida que solo se lean registros que no hayan sido marcados como 'eliminados'
      tasks = await this.selectAll(
        "SELECT * FROM task WHERE deleted = 'f';"
      );
    } catch (error) {
      console.error(`Error when trying to read task list: ${error}`);
    }

    return tasks;
  }

  async Read(taskId, deleted = false) {
    let task = null;

    try {
      // Se valida que solo se lea un registro que no esta marcado como 'eliminado'
      const result = await this.selectFirst(
        "SELECT * FROM task WHERE id = ? AND deleted = ?;",
        [taskId, deleted ? 't' : 'f']
      );

      // Validar si es que no se encuentra la tarea en la base de datos
      task = result || {};

    } catch (error) {
      console.error(`Error when trying to read task of id ${taskId}: ${error}`);
    }

    return task;
  }

  async Update(taskId, status) {
    let success = false;

    try {
      success = await this.update(
        `UPDATE task SET status = ?, fechaActualizacion = (strftime('%FT%TZ', current_timestamp)) WHERE id = ?;`,
        [status, taskId]
      );

    } catch (error) {
      console.error(`Error when trying to update task of id '${taskId}': ${error}`);
    }

    return success;
  }

  // Este método "borra" la tarea marcandola como eliminada en la base de datos
  async Delete(taskId) {
    let success = null;

    try {
      success = await this.update(
        `UPDATE task SET deleted = 't' WHERE id = ? AND deleted = 'f';`,
        [taskId]
      );

    } catch (error) {
      console.error(`Error when trying to delete task of id '${taskId}': ${error}`);
      success = false;
    }

    return success;
  }
}
