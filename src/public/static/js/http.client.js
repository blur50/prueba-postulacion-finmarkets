class HTTPClient {

  constructor() {
    this.apiURL = window.location.origin;
  }

  async getTasks() {
    try {
      const response = await fetch(
        `${this.apiURL}/tasks`,
        {
          method: 'GET'
        }
      );
      const json = await response.json();

      if (json.status === "error") throw new Error(json.message);

      return json.tasks;

    } catch (error) {
      console.error(`Error on HTTPClient.getTasks, error: '${error}'`);

      throw error; // Escalar error a la siguiente capa
    }
  }

  async putTask(taskId, status) {
    try {
      const response = await fetch(
        `${this.apiURL}/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            {
              status
            }
          )
        },
      );
      const json = await response.json();

      if (json.status === "error") throw new Error(json.message);

      return json.task;

    } catch (error) {
      console.error(
        `Error on HTTPClient.putTask, taskId: '${taskId}', status: '${status}', error: '${error}'`
      );

      throw error; // Escalar error a la siguiente capa
    }
  }

  async postTask(titulo, descripcion) {
    try {
      const response = await fetch(
        `${this.apiURL}/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            {
              titulo,
              descripcion
            }
          )
        },
      );
      const json = await response.json();

      if (json.status === "error") throw new Error(json.message);

      return json.task;

    } catch (error) {
      console.error(
        `Error on HTTPClient.postTask, taskId: '${taskId}', `
          `titulo: '${titulo}', descripcion: '${descripcion}', error: '${error}'`
      );

      throw error; // Escalar error a la siguiente capa
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await fetch(
        `${this.apiURL}/tasks/${taskId}`,
        {
          method: 'DELETE'
        },
      );
      const json = await response.json();

      if (json.status === "error") throw new Error(json.message);

      return json.task;

    } catch (error) {
      console.error(`Error on HTTPClient.deleteTask, error: ${taskId}`);

      throw error;
    }
  }
}
