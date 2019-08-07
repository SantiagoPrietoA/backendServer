var express = require('express');
const bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


var app = express();

var Usuarios = require('../models/usuario');


// ============================================================== 
//  Retornar usuarios
// ============================================================== 

app.post('/', (req, res) => {

    var body = req.body;

    Usuarios.findOne({ email: body.email }, (err, usuarioDB) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar el usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'datos incorectos -email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'datos incorrectos - password',
                errors: err
            });
        }

        // crear token!!!

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
        usuarioDB.password = "";

        res.status(200).json({
            ok: true,
            message: 'peticion de login correcta',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });


});

module.exports = app;