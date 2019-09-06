var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Hospitales = require('../models/hospital');

// ============================================================== 
//  Retornar hospitales
// ============================================================== 

app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;

    desde = Number(desde);

    Hospitales.find({})
        .limit(5)
        .skip(desde)
        .populate('usuario', 'name email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar los hospitales',
                        errors: err
                    });
                }

                Hospitales.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
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
//  Actualizar hospitales
// ============================================================== 

app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospitales.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar el hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'hospital no encontrado',
                errors: { message: 'el hospital con el id: ' + id + ' no existe' }
            });
        }

        hospital.name = body.name;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actializar el hospital',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});

// ============================================================== 
//  Crear hospitales
// ============================================================== 

app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospitales({
        name: body.name,
        usuario: req.usuario._id
    })

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        })

    })

})

// ============================================================== 
//  Borrar hospital
// ============================================================== 

app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    Hospitales.findByIdAndDelete(id, (err, hospitalBorrado) => {

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'hospital no encontrado',
                errors: { message: 'el hospital con el id: ' + id + ' no existe' }
            });
        }

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }


        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })



    });

});

// ========================================== 
//  Obtener Hospital por ID 
// ========================================== 

app.get('/:id', (req, res) => {

    var id = req.params.id;

    Hospitales.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }

            res.status(200).json({ ok: true, hospital: hospital });

        })

})


module.exports = app;