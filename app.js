const inicioDebug = require('debug')('app:inicio'); // Importar el paquete debug
                                    // El parámetro indica el archivo y el entorno de depuración
const dbDebug = require('debug')('app:db');
const usuarios = require('./routes/usuarios');
const express = require('express'); // Importa el paquete express
const config = require('config'); // Importa el paquete config
const { exist } = require('joi');
const morgan = require('morgan');
const joi = require('joi');
const app = express(); // Crea una instancia de express
const logger = require('./logger');

// Cuáles son los métodos a implementar
// con su ruta
// app.get() // Consulta
// app.post(); // Envío de datos al servidor (insertar datos en la base)
// app.put(); // Actualización
// app.delete(); // Eliminación

app.use(express.json()); // Le decimos a express que use éste 
                         // middleware.

app.use(express.urlencoded({extended: true})); // Nuevo Middleware
                                      // Define el uso de la libreria qs para
                                      // separar la información codificada en 
                                      // el url

app.use(express.static('public')); // Nombre de la carpeta que tendrá los archivos
                                   // (Recursos estáticos)

app.use('/api/usuarios', usuarios); // Middleware que importamos
// El primer parámetro es la ruta raíz asociada
// con las peticiones a los datos de usuarios
// La ruta raíz definida 


console.log(`Aplicación: ${config.get('nombre')}`);
console.log(`DB Server: ${config.get('configDB.host')}`);

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('Morgan habilitado...');
    // Muestra el mensaje de depuración
    inicioDebug('Morgan está habilitado..');
}


dbDebug('Conectando con la base de datos...');
// app.use(logger); // Logger ya hace referencia a la función log de logger.js
//                  // debido al exports

// app.use(function(req, res, next){
//     console.log('Autenticando...');
//     next();
// })


// Consulta en la ruta raíz del sitio
// Toda petición siempre va a recibir dos parámetros (objetos)
// req: la información que recibe el servidor del cliente
// res: la información que el servidor va a responder al cliente
// Vamos a utilizar el método send del objeto res
app.get('/', (req, res) => {
    res.send('Hola mundo desde Express!!');
});

// Recibiendo varios parámetros
// Se pasan dos parámetros, year y month
// Query string
// localhost:5000/api/usuarios/1990/2/?nombre=xxxx&single=y
// app.get('/api/usuarios/:year/:month', (req, res) => {
//     // En el cuerpo de req está la propiedad
//     // query, que guarda los parámetros Query String.
//     res.send(req.query);
// });

app.get('/api/productos', (req, res) => {
    res.send(['mouse', 'teclado', 'bocinas']);
});

// El módulo process contiene información del sistema.
// EL objeto env contiene información de las variables de entorno.
// Si la variable PORT no existe, que tome un valor fijo definido por nosotros (3000)
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});


// _--------------- Funciones middleware
// El middleware es un bloque de código que se ejecuta
// entre las peticiones del usuario (request) y la petición
// que llega al servidor. Es un enlace entre la petición
// del usuario y el servidor, antes de que este pueda
// dar una respuesta

// Las funciones del middleware son funciones que tienen acceso
// al objeto de solicitud (req), al objeto de respuesta (res)
// y a la siguiente función de middleware en el ciclo de solicitud/respuesta
// de la aplicación. La siguiente función de middlewarese denota
// normalmente con una variable denominada next.

// Las funciones de middleware pueden realizar las siguientes tarea:

// - Ejecutar cualquier código.
// - Realizar cambios en la solicitud y los objetos de respuesta
// - Finalizar el ciclo de solicitud/respuesta
// - Invoca la siguiente función de middleware en la pila

// Express es un framework de direccionamiento y uso de middleware
// que permite que la aplicación tenga funcionalidad mínima propia.

// Ya hemos utilizado algunos middleware, como son express.json()
// que transforma el body del req a formato JSON

//             ---------------------------------
// request --|--> json() --> route() --|--> response
//             ---------------------------------

// route() --> funciones GET, POST, PUT, DELETE

// Una aplicación express puede utilizar los siguientes tipos
// de middleware
//  - Middleware de nivel de aplicación
//  - Middleware de nivel de direccionador
//  - Middleware de manejo de errores
//  - Middleware incorporado
//  - Middleware de terceros


// ----------------- Recursos Estáticos --------------
// Los recursos estáticos hacen referencia a archivos
// imágenes, documentos que se ubican en el servidor.
// Vamos a usar un middleware para poder acceder a estos
// recursos.
