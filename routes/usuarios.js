const express = require('express');
const joi = require('joi');
const ruta = express.Router();

// Los tres app.use() son middleware y se llaman antes de las funciones
// de ruta GET, POST, PUT, DELETE para que éstas puedan trabajar

const usuarios = [
    {id:1, nombre: 'Juan'},
    {id:2, nombre: 'Karen'},
    {id:3, nombre: 'Diego'},
    {id:4, nombre: 'Luis'}
];

ruta.get('/', (req, res) => {
    res.send(usuarios);
});

// Con los dos puntos delente del id
// Express sabe que es un parámetro a recibir en la ruta
ruta.get('/:id', (req, res) => {
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

// La ruta tiene el mismo nombre que la petición GET
// Express hace la diferencia dependiendo del tipo 
// de petición.
// La petición POST se utilizará para insertar
// un nuevo usario en nuestro arreglo.
ruta.post('/', (req, res) => {
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
ruta.put('/:id', (req, res) => {
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
ruta.delete('/:id', (req, res) => {
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

function existeUsuario(id){
    return(usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom){
    const schema = joi.object({
        nombre: joi.string().min(3).required()
    });
    return(schema.validate({nombre: nom}));
}

module.exports = ruta; // Se exporta el obejeto ruta