var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Medicos = require('../models/medico');

// ============================================================== 
//  Retornar medicos
// ============================================================== 

app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;

    desde = Number(desde);

    Medicos.find({})
        .limit(5)
        .skip(desde)
        .populate('usuario', 'name email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar los medicos',
                        errors: err
                    });
                }

                Medicos.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medico: medicos,
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
//  obtener unico medico
// ============================================================== 

app.get('/:id', (req, res) => {
    var id = req.params.id;

    Medicos.findById(id)
        .populate('usuario')
        .populate('hospital')
        .exec((err, medico) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar el medico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'medico no encontrado',
                    errors: { message: 'el medico con el id: ' + id + ' no existe' }
                });
            }
            return res.status(200).json({
                ok: true,
                medico: medico
            });

        });


})

// ============================================================== 
//  Actualizar medico
// ============================================================== 

app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medicos.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar el medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'medico no encontrado',
                errors: { message: 'el medico con el id: ' + id + ' no existe' }
            });
        }

        medico.name = body.name;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actializar el medico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

// ============================================================== 
//  Crear medicos
// ============================================================== 

app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;

    var medico = new Medicos({
        name: body.name,
        usuario: req.usuario._id,
        hospital: body.hospital
    })

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        })

    })

})

// ============================================================== 
//  Borrar medico
// ============================================================== 

app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    Medicos.findByIdAndDelete(id, (err, medicoBorrado) => {

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'medico no encontrado',
                errors: { message: 'el medico con el id: ' + id + ' no existe' }
            });
        }

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }


        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        })



    });

});


module.exports = app;