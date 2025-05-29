import joi from 'joi';
import { TASK_STATUS } from './constants.js';

export const tasksPostBodySchema = joi.object(
  {
    titulo: joi.string().max(100).required(),
    descripcion: joi.string().max(500).allow('')
  }
);

export const tasksPutBodySchema = joi.object(
  {
    status: joi.string().valid(TASK_STATUS.PENDIENTE, TASK_STATUS.COMPLETADA).required()
  }
);
