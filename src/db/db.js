import sqlite3 from 'sqlite3';

import { envs } from '../config/index.js';
import { TASK_STATUS } from '../utils/index.js';


export default class Database {
  openConnection() {
    return new sqlite3.Database(`${envs.SQLITE_DB_NAME}.db`, (err) => {
      if (err) {
        console.error(`Error when trying to connect to database: ${err}`);
      } else {
        // console.debug('Database connection opened!');
      }
    });
  }

  closeConnection(connection) {
    connection.close((err) => {
      if (err) {
        console.error(`Error when trying to close connection: ${err}`);
      }
      // console.debug('Database connection closed!');
    });
  }

  static loadSchema() {
    const db = new Database();
    const connection = db.openConnection();

    connection.run(
      `CREATE TABLE IF NOT EXISTS task (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL check(length(titulo) <= 100),
        descripcion TEXT check(length(descripcion) <= 500) DEFAULT '',
        status TEXT check(status = "${TASK_STATUS.PENDIENTE}" or status = "${TASK_STATUS.COMPLETADA}") DEFAULT '${TASK_STATUS.PENDIENTE}',
        fechaCreacion TEXT DEFAULT (strftime('%FT%TZ', current_timestamp)),
        fechaActualizacion TEXT DEFAULT (strftime('%FT%TZ', current_timestamp)),
        deleted TEXT DEFAULT 'f'
      )`,
      (err) => {
        if (err) {
          console.error(`Error when trying to create table "task": ${err}`);
        } else {
          console.log('Succesfully initialized database!');
        }
      }
    );

    db.closeConnection(connection);
  }
}
