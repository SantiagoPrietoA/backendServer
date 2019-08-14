var express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');


var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


var app = express();

app.use(fileUpload());




app.put('/:tipo/:id', (req, res, next) => {


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'debe seleccionar una imagen',
            errors: { message: 'imagen no seleccionada' },

        });
    }

    // obtener extencion del archivo
    var imagen = req.files.img;
    var nombre = imagen.name.split('.');
    var extencion = nombre[nombre.length - 1];

    // extenciones validad

    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];


    if (extencionesValidas.indexOf(extencion) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'las extenciones validas son: ' + extencionesValidas.join(', '),
            errors: { message: 'extencion no valida' },

        });
    }

    //  reasignar nombre al archivo

    var tipo = req.params.tipo;
    var id = req.params.id;

    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extencion }`;

    // extenciones validas

    var tiposValidos = ['usuarios', 'hospitales', 'medicos']

    // mover archivo

    var path = `./upload/${ tipo }/${ nombreArchivo }`;

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'los tipos validas son: ' + tiposValidos.join(', '),
            errors: { message: 'tipo no valido' },

        });
    }

    imagen.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al mover el archivo',
                err: err,

            });
        }


        subirPorTipo(id, tipo, nombreArchivo, res);


    });



})

function subirPorTipo(id, tipo, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'usuario no encontrado',
                    err: err,

                });
            }

            var imagenVieja = './upload/usuarios/' + usuario.img;


            // si existe una imagen anterior, eliminarla
            if (fs.existsSync(imagenVieja)) {
                fs.unlinkSync(imagenVieja);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al guardar imagen',
                        err: err,
                    });
                }

                usuarioGuardado.password = "";
                res.status(200).json({
                    ok: true,
                    mensaje: 'imagen actualizada',
                    usuario: usuarioGuardado,
                })


            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'medico no encontrado',
                    err: err,

                });
            }

            var imagenVieja = './upload/medicos/' + medico.img;


            // si existe una imagen anterior, eliminarla
            if (fs.existsSync(imagenVieja)) {
                fs.unlinkSync(imagenVieja);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoGuardado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al guardar imagen',
                        err: err,
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'imagen actualizada',
                    medico: medicoGuardado,
                })


            });
        });

    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'hospital no encontrado',
                    err: err,

                });
            }

            var imagenVieja = './upload/hospitales/' + hospital.img;


            // si existe una imagen anterior, eliminarla
            if (fs.existsSync(imagenVieja)) {
                fs.unlinkSync(imagenVieja);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalGuardado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al guardar imagen',
                        err: err,
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'imagen actualizada',
                    hospital: hospitalGuardado,
                })


            });
        });

    }

}

module.exports = app;