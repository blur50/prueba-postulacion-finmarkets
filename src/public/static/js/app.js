class TaskManager {

  constructor() {
    this.httpClient = new HTTPClient();
    this.tasks = [];
    this.ws = null;
  }

  async init() {
    // Inicializar eventos
    this.bindFormEventListener();

    // Recuperar tareas ya creadas y guardar referencia
    this.tasks = await this.retrieveTaskList();

    // Renderizar listado de tareas que se recuperaron de la API
    this.renderTaskList();

    // Iniciar conexión WebSocket con el servidor y bindear evento para procesar mensajes del servidor
    this.startWebSocket();
  }

  // Data functions
  async retrieveTaskList() {
    let tasks = [];

    try {
      tasks = await this.httpClient.getTasks();
      tasks.reverse(); // Mostrar tareas más nuevas primero
    } catch (error) {
      // TODO: Mostrar error al usuario
    }
    return tasks;
  }

  addTaskInList(task) {
    const taskIndex = this.tasks.findIndex((t => t.id === task.id));

    if (taskIndex === -1) this.tasks.unshift(task);
  }

  updateTaskInList(task) {
    const taskIndex = this.tasks.findIndex((t => t.id === task.id));

    if (taskIndex !== -1) this.tasks.splice(taskIndex, 1, task);
  }

  deleteTaskInList(task) {
    const taskIndex = this.tasks.findIndex((t => t.id === task.id));

    if (taskIndex !== -1) this.tasks.splice(taskIndex, 1);
  }

  // Event listeners
  bindFormEventListener() {
    document.getElementById("createTaskForm").addEventListener("submit", this.onCreateTaskFormSubmitted.bind(this));
  }

  bindTaskEventListeners() {
    this.tasks.forEach(({ id }) => {
      document.getElementById(`task-checkbox-${id}`).onclick = this.onTaskStatusChanged.bind(this);
      document.getElementById(`task-delete-${id}`).onclick = this.onTaskDelete.bind(this);
    });
  }

  async onCreateTaskFormSubmitted(e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;

    try {
      const task = await this.httpClient.postTask(titulo, descripcion);

      this.addTaskInList(task);
      this.renderTaskList();

      document.getElementById("titulo").value = "";
      document.getElementById("descripcion").value = "";
    } catch (error) {
      // TODO: Mostrar error al usuario
    }
  }

  async onTaskStatusChanged(e) {
    e.preventDefault();

    const taskId = e.target.id.split("-")[2];
    const status = e.target.checked ? "completada" : "pendiente";

    try {
      const task = await this.httpClient.putTask(taskId, status);

      this.updateTaskInList(task);
      this.renderTaskList();
    } catch (error) {
      // TODO: Mostrar error al usuario
    }
  }

  async onTaskDelete(e) {
    e.preventDefault();

    const taskId = e.target.id.split("-")[2];

    try {
      const task = await this.httpClient.deleteTask(taskId);

      this.deleteTaskInList(task);
      this.renderTaskList();
    } catch (error) {
      // TODO: Mostrar error al usuario
    }
  }

  // WebSocket functions
  startWebSocket() {
    try {
      this.ws = new WebSocket(`ws://${window.location.host}/ws`);
      this.ws.addEventListener("message", this.onWebSocketMessage.bind(this));
    } catch (error) {
      // TODO: Mostrar error al usuario
    }
  }

  onWebSocketMessage({ data }) {
    const { event, payload } = JSON.parse(data);

    switch (event) {
      case "taskCreated":
        this.addTaskInList(payload.task);
        this.renderTaskList();
        break;

      case "taskUpdated":
        this.updateTaskInList(payload.task);
        this.renderTaskList();
        break;

      case "taskDeleted":
        this.deleteTaskInList(payload.task);
        this.renderTaskList();
        break;

      default:
        break;
    }
  }

  // HTML Renderer
  renderTaskList() {
    document.getElementById("tasksContainer").innerHTML = this.tasks.map(
      ({ id, titulo, descripcion, status, fechaCreacion, fechaActualizacion }) => {

        const parsedFechaCreacion = new Date(fechaCreacion);
        const parsedFechaActualizacion = new Date(fechaActualizacion);

        return `<div class="divider"></div>
                <article id="task-${id}" class="task">
                    <h2>
                      <input
                        type="checkbox"
                        id="task-checkbox-${id}"
                        name="task-checkbox-${id}"
                        ${status === 'completada' ? 'checked' : ''}
                      >
                      </input>
                      <img id="task-delete-${id}" class="delete" src="./static/img/delete.png" />
                      ${titulo}
                    </h2>
                    <p>${descripcion}</p>
                    <fieldset role="group">
                      <p>Fecha creación:  <u>${this.formatDate(parsedFechaCreacion)}</u></p>
                      <p>Fecha última actualización:  <u>${this.formatDate(parsedFechaActualizacion)}</u></p>
                    </fieldset>
                </article>`;
      }
    ).join('\n');

    // Bindear eventos para poder editar y eliminar las tareas
    this.bindTaskEventListeners();
  }

  // Helpers
  formatDate(date) {
    return `${("0" + date.getDate()).slice(-2)}/` + // Dia
      `${("0" + date.getMonth()).slice(-2)}/` +  // Mes
      `${date.getFullYear()} ` +  // Año
      `${("0" + date.getHours()).slice(-2)}:` + // Horas
      `${("0" + date.getMinutes()).slice(-2)}:` + // Minutos
      `${("0" + date.getSeconds()).slice(-2)}`; // Segundos
  }
}

(() => {
  new TaskManager().init();
})();
