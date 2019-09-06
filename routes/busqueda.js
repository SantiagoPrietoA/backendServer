var express = require('express');


var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ============================================================== 
//  Busqueda especifica
// ============================================================== 

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regexp = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'usuario':
            buscarUsuarios(regexp)
                .then(usuarios => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios
                    });
                });
            break;

        case 'medico':
            buscarMedicos(regexp)
                .then(medicos => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos
                    });
                });
            break;

        case 'hospital':
            buscarHospitales(regexp)
                .then(hospitales => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales
                    });
                });
            break;

        default:
            return res.status(400).json({
                ok: false,
                message: 'los tipos de busqueda son : usuario, medico, hospital',
                errors: { message: 'tipo de tabla no valida' }
            });
    }
});

// ============================================================== 
//  Busqueda general
// ============================================================== 

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    var regexp = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(regexp), buscarMedicos(regexp), buscarUsuarios(regexp)])
        .then(respuesta => {
            res.status(200).json({
                ok: true,
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuarios: respuesta[2]
            });

        })


})

function buscarHospitales(regexp) {

    return new Promise((resolve, reject) => {
        Hospital.find({ name: regexp })
            .populate('usuario', 'name email img')
            .exec((err, hospitales) => {
                if (err) {
                    reject('error al cargar los hospitales', err)
                } else {
                    resolve(hospitales);
                }
            })
    });

}


function buscarMedicos(regexp) {

    return new Promise((resolve, reject) => {
        Medico.find({ name: regexp })
            .populate('usuario', 'name email img')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('error al cargar los medicos', err)
                } else {
                    resolve(medicos);
                }
            })
    });

}


function buscarUsuarios(regexp) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'name email role img')
            .or([{ 'name': regexp }, { 'email': regexp }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('error al cargar los usuario', err)
                } else {
                    resolve(usuarios);
                }
            })
    });

}
module.exports = app;