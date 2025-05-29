# Tasks List App
Este proyecto es una aplicación que permite registrar, listar, editar y eliminar tareas de un listado de tareas. Además, tiene la funcionalidad de poder actualizar en tiempo real el estado de tareas creadas, editadas o eliminas a través de conexiones Websocket.

# Prerequisitos
Para poder instalar y ejecutar el proyecto, es necesario tener un ambiente que tenga instalado Node y npm. Node se puede instalar siguiendo la documentación del siguiente [link](https://nodejs.org/en/download)

# Instalación y configuración
Primero que nada, se deben instalar las dependencias del proyecto y para eso se debe ejecutar el siguiente comando:
```sh
npm install
```

Segundo, es necesario crear un archivo `.env` en la ruta base del proyecto con las variables de ambiente `PORT` y `SQLITE_DB_NAME`. Se puede usar como referencia el archivo `.env.example` que fue incluido en el proyecto.

*El proyecto no permitirá ser ejecutado si es que no existe el archivo `.env` o no incluye valores válidos para las variables de ambiente y mostrará errores con información al respecto*.

Por último, se debe ejecutar el script de npm que nos permite inicializar la base de datos con el siguiente comando:
```sh
npm run initDB
```
Al hacer esto, se creara una archivo con extensión `.db` en la ruta base del proyecto

Con estos pasos completados, podemos pasar a la ejecución del proyecto.

# Ejecución del proyecto
El proyecto se puede ejecutar utilizando el archivo de punto de entrada del servicio y para esto se han facilitado 2 scripts de npm que son los siguientes:

```sh
# Utiliza este comando si necesitas ejecutar el proyecto en un ambiente de desarrollo
npm run dev 

# Utiliza este comando si necesitas ejecutar el proyecto en el ambiente de producción
npm run start
```

# Como probar la aplicación
Una vez que la aplicación se esta ejecutando, se puede ingresar a través de un navegador web a la URL local del servicio, que por defecto debería ser [http://localhost:8888](http://localhost:8888), pero puede variar si es que se decidió utilizar otro número de puerto en las variables de ambiente. Aquí se encontrará una interfaz web que permite ver, crear, editar y eliminar tareas del servicio

Para crear una tarea, se puede ingresar el título y descripción en el formulario de la cabecera y luego se debe presionar el botón `Guardar`

Para editar (marcar como pendiente o completada) una tarea, se debe hacer click al `checkbox` que aparece a la izquierda del título de una tarea. El `checkbox` debería aparecer como activo y la fecha de actualización debería cambiar a la fecha y hora actual

Para eliminar una tarea, se debe hacer click al ícono rojo con la cruz blanca que se encuentra a la izquierda del título de la tarea

Para poder probar la funcionalidad de WebSockets de la aplicación, se pueden abrir una o más pestañas de la aplicación y se puede probar crear, editando o eliminando una de las tareas del listado. Los cambios hechos se deberían ver reflejados en todas las otras pestañas donde no se hizo la modificación


# Decisiones de diseño
## Base de datos
Ya que SQLite respeta el largo máximo de un campo de texto por defecto como lo hacen otro motores de bases de datos, por ejemplo `VARCHAR(100)`,
implementé la restricción del largo de 'titulo' y 'descripción' a través de 'CONSTRAINTS' con la función 'check'.

Para las fechas de creación y actualización de una tarea, definí los valores por defecto como la fecha actual a través de la constante 'current_timestamp' que provee SQLite con zona horaria UTC,
pero utilizando el formato de fecha aceptado por el ISO 8601, para facilitar el procesamiento de estas fechas por consumidores de la API Rest. Este formato también esta considerado
cuando se actualiza la fecha de actualización de una tarea.

Decidí agregar un campo de 'deleted' a la tabla de "task" para marcar una tarea como 'eliminada', ya que me parece una mejor práctica marcar estos registros como eliminados a eliminarlos
completamente de la base de datos, ya que siempre hay una posibilidad de que se necesiten recuperar en caso de que haya ocurrido un error o alguna situación parecida.

## Capa de modelo
Para la capa de modelo, decídi crear una clase de modelo base, que me permitiera hacer 2 cosas, abstraer el uso de métodos para ejecutar sentencias SQL en la base de datos y para
poder manejar los resultados de estas consultas a través de Promises y así facilitar la legibilidad del código (evitar el callback hell).

## API Rest
Todos los endpoints de la API responde con una estructura JSON estándar que puede tener 2 variantes:

La primera es la respuesta exitosa, que lleva la llave `status` con el valor `success` y lleva una llave que representa la entidad o entidades con las que se interactuaron a través de la API como `task` ó `tasks`. Si se deben retornar datos de más de una entidad, se hará a través de una lista:
```json
{
    "status": "success",
    "task": {
        "id": 1,
        ...
    }
}
---
{
    "status": "success",
    "tasks": [
        {
            "id": 1,
            ...
        },
        {
            "id": 2,
            ...
        },
        ...
    ]
}
```

El segunda es la respuesta errónea, que lleva la llave `status` con el valor `error` y una llave `message` con el mensaje del error que sucedió en la aplicación, de forma de que quien este consumiendo esta API, pueda tener información de la causa del error:
```json
{
    "status": "error",
    "message": "An error ocurred on the database"
}
---
// Respuesta al hacer un PUT Request a /tasks/:taskId con un valor inválido para
// la llave 'status' del body
{
    "status": "error",
    "message": "'status' must be one of [pendiente, completada]"
}

```
Implemente la validación de los campos del body en los endpoints de POST y PUT a través de la librería `joi`.

Todas las respuestas de la API se acompañan con su código HTTP correspondiente, `200` para las respuestas exitosas, `400` para las respuestas a requests mal formados y `500` para respuestas con errores causados en la API.

## Websockets
Para facilitar la implementación de un servidor de WebSockets, utilicé la librería `websocket-express`.

Para poder hacer el envío de eventos a todos los clientes conectados por WebSockets cuando se crea, actualiza o elimina una tarea, utilicé una instancia Singleton
que se llama WssBroadCaster, que tiene una función llamada `broadcastEvent` que itera por todas las conexiones de WebSockets y envia un mensaje con la siguiente estructura:
```json
{
    "event": "[tipo de evento]",
    "payload": {
        ...
    }
}
```

## Web App
Utilicé una librería CSS llamada 'Pico CSS' que tiene reglas minimalistas, para poder hacer más fácil la implementación del estilo en la parte del front


Debido a la falta de tiempo, no pude implementar el manejo de errores ni la implementación de notificaciones para el usuario cuando se crea, edita o elimina una tarea


## Testing
Lamentablemente, no le pude dedicar todo el tiempo que quería a este proyecto para poder incluir tests, pero si hubiese tenido el tiempo, hubiese creado tests de integración para la base de datos y el model, tests unitarios con mocks de la capa de modelo para la API Rest y tests de simulación de acciones de usuario para el front, utilizando el framework de testing Jest.
