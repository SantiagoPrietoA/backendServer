var express = require('express');
const bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


var app = express();

var Usuarios = require('../models/usuario');

// google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ============================================================== 
//  login google
// ============================================================== 

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

// app.post('/google', (req, res, next) => {
//     var token = req.body.token;
//     const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);
//     const tiket = oAuth2Client.verifyIdToken({
//         idToken: token,
//         audience: GOOGLE_CLIENT_ID
//     });
//     tiket.then(data => { res.status(200).json({ ok: true, tiket: data.payload }) });
// });


app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                message: 'token no válido',
            })
        });

    Usuarios.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar el usuario',
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'debe usuar autenticación normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                usuarioDB.password = "";

                res.status(200).json({
                    ok: true,
                    message: 'peticion de login correcta',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // el usuario no existe, hay que crearlo

            var usuario = new Usuarios();

            usuario.name = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true,
                usuario.password = ':)'

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                usuarioDB.password = "";

                res.status(200).json({
                    ok: true,
                    message: 'peticion de login correcta',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            })
        }
    })


});

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