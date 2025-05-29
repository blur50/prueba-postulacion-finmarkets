export default class BaseModel {

  constructor(databaseInstance) {
    this.db = databaseInstance;
  }

  insert(sql, params) {
    const this_ = this; // Se debe guardar la referencia de 'this' para ser usada en la función de callback que esta más abajo
    const connection = this.db.openConnection();

    return new Promise((resolve, reject) => {
      connection.run(sql, params, function (err) {
        this_.db.closeConnection(connection);

        if (err) reject(err);

        // El valor 'this' apunta a la instancia de Statement que acaba de ejecutar SQLite
        // SQLite permite recuperar el ID de la última fila que modificó, de esa forma podemos recuperar el ID de la tarea recién creada
        resolve(this.lastID);
      });
    });
  }

  selectAll(sql) {
    const connection = this.db.openConnection();

    return new Promise((resolve, reject) => {
      connection.all(sql, (err, rows) => {
        this.db.closeConnection(connection);

        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  selectFirst(sql, params) {
    const connection = this.db.openConnection();

    return new Promise((resolve, reject) => {
      connection.get(sql, params, (err, row) => {
        this.db.closeConnection(connection);

        if (err) reject(err);
        resolve(row);
      });
    });
  }

  update(sql, params) {
    const connection = this.db.openConnection();

    return new Promise((resolve, reject) => {
      connection.run(sql, params, (err) => {
        this.db.closeConnection(connection);

        if (err) reject(err);
        resolve(true);
      });
    });
  }
}
