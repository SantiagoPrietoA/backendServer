// Requires

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')


// Inicializar variables

var app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// Importar rutas 

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imgRoutes = require('./routes/imagenes');




// Conexión a la base de datos

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err

    console.log('base de datos: \x1b[36m%s\x1b[0m', 'online');
});


// Rutas

app.use('/usuarios', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imgRoutes);
app.use('/', appRoutes);




// Escuchar peticiones

app.listen(3000, () => {
    console.log('server express port 3000: \x1b[36m%s\x1b[0m', 'online');
})