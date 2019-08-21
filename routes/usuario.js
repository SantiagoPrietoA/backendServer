var express = require('express');
const bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');


var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Usuarios = require('../models/usuario');

// ============================================================== 
//  Retornar usuarios
// ============================================================== 

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Usuarios.find({}, "name email img role")
        .limit(5)
        .skip(desde)
        .exec(

            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar los usuarios',
                        errors: err
                    });
                }

                Usuarios.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    })
                });



            });

})

// ============================================================== 
//  verificar token
// ============================================================== 


// app.use('/', (req, res, next) => {

//     var token = req.query.token;

//     jwt.verify(token, SEED, (err, decoded) => {

//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: 'token invalido',
//                 errors: err
//             });
//         }

//         next();
//     });

// });



// ============================================================== 
//  Actualizar usuario
// ============================================================== 

app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuarios.findById(id, 'name email role img')
        .exec((err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar el usuario',
                    errors: err
                });
            }

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no encontrado',
                    errors: { message: 'el usuario con el id: ' + id + ' no existe' }
                });
            }

            usuario.name = body.name;
            usuario.email = body.email;
            usuario.role = body.role;

            usuario.save((err, usuarioGuardado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actializar el usuario',
                        errors: err
                    });
                }

                res.status(201).json({
                    ok: true,
                    usuario: usuarioGuardado
                });

            });

        });

});

// ============================================================== 
//  Crear usuarios
// ============================================================== 

app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuarios({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    })

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }

        usuarioGuardado.password = "";
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        })

    })

})

// ============================================================== 
//  Borrar usuario
// ============================================================== 

app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    Usuarios.findByIdAndDelete(id, (err, usuarioBorrado) => {

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario no encontrado',
                errors: { message: 'el usuario con el id: ' + id + ' no existe' }
            });
        }

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }


        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })



    });

});


module.exports = app;