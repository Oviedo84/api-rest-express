const inicioDebug = require('debug')('app:inicio'); // Importar el paquete debug
                                    // El parámetro indica el archivo y el entorno de depuración
const dbDebug = require('debug')('app:db');
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

// Los tres app.use() son middleware y se llaman antes de las funciones
// de ruta GET, POST, PUT, DELETE para que éstas puedan trabajar

const usuarios = [
    {id:1, nombre: 'Juan'},
    {id:2, nombre: 'Karen'},
    {id:3, nombre: 'Diego'},
    {id:4, nombre: 'Luis'}
];

function existeUsuario(id){
    return(usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom){
    const schema = joi.object({
        nombre: joi.string().min(3).required()
    });
    return(schema.validate({nombre: nom}));
}

// Consulta en la ruta raíz del sitio
// Toda petición siempre va a recibir dos parámetros (objetos)
// req: la información que recibe el servidor del cliente
// res: la información que el servidor va a responder al cliente
// Vamos a utilizar el método send del objeto res
app.get('/', (req, res) => {
    res.send('Hola mundo desde Express!!');
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});

// Con los dos puntos delente del id
// Express sabe que es un parámetro a recibir en la ruta
app.get('/api/usuarios/:id', (req, res) => {
    // En el cuerpo del objeto req está la propiedad 
    // params, que guarda los parámetros enviados
    // res.send(req.params.id);
    // Los parámetros en req.params se reciben como strings
    // parseInt, hace el casteo a valores enteros directamente
    const id = req.params.id;
    const usuario = existeUsuario(id);
    if(!usuario){
        res.status(404).send(`El usuarios ${id} no se encuentra!`);
        return;
        // Devuelve el estado HTTP 404
    }
    res.send(usuario);
});


// Recibiendo varios parámetros
// Se pasan dos parámetros, year y month
// Query string
// localhost:5000/api/usuarios/1990/2/?nombre=xxxx&single=y
app.get('/api/usuarios/:year/:month', (req, res) => {
    // En el cuerpo de req está la propiedad
    // query, que guarda los parámetros Query String.
    res.send(req.query);
});

// La ruta tiene el mismo nombre que la petición GET
// Express hace la diferencia dependiendo del tipo 
// de petición.
// La petición POST se utilizará para insertar
// un nuevo usario en nuestro arreglo.
app.post('/api/usuarios', (req, res) => {
    // El objeto request tiene la propiedad body
    // que va a venir en formato JSON
    // Creación del schema con Joi
    const {error, value} = validarUsuario(req.body.nombre);
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: req.body.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);    
    }
    else{
        res.status(400).send(error.details[0].message);
    }
    return;
    // if(!req.body.nombre || req.body.nombre.length <= 2){
    //     // Código 400: Bad Request
    //     res.status(400).send('Debe ingresar un nombre que tenga al menos tres letras.');
    //     return; // Es necesario para que no continúe con el método
    // }
    // const usuario = {
    //     id: usuarios.length + 1,
    //     nombre: req.body.nombre
    // };
    // usuarios.push(usuario);
    // res.send(usuario);
});

// Petición para modificar datos existentes
// este método debe recibir un parámetro
// id para saber qué usuario modificar
app.put('/api/usuarios/:id', (req, res) => {
    // Encontrar si existe el usuario a modificar
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no se encuentra'); // Devuelve el estado HTTP
        return;
    }
    // validar si el dato recibido es correcto
    const {error, value} = validarUsuario(req.body.nombre);
    if(!error){
        // Actualiza el nombre
        usuario.nombre = value.nombre;
        res.send(usuario);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    return;
});

// Recibe como parámetro el id del usuario se va a eliminar
app.delete('/api/usuarios/:id', (req, res) => {
    const usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no se encuentra'); // Devuelve el estado HTTP
        return;
    }
    // Encontrar el índice del usuario dentro del arreglo
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1); // Elimina el elemento en el índice
    res.send(usuario); // Se responde con el usuario eliminado
});

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
