import Database from '../db/db.js';
import { default as TM } from './task.js';

const TaskModel = new TM(new Database());

export { TaskModel };
