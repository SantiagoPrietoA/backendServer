// Requires

var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables

var app = express();


// Conexión a la base de datos

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err

    console.log('base de datos: \x1b[36m%s\x1b[0m', 'online');
});


// Rutas

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: ' petición realizada correctamente'
    })
})


// Escuchar peticiones

app.listen(3000, () => {
    console.log('server express port 3000: \x1b[36m%s\x1b[0m', 'online');
})