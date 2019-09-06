var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ============================================================== 
//  verificar token
// ============================================================== 

exports.verificarToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'token invalido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
}

// ============================================================== 
//  verificar Admin
// ============================================================== 

exports.verificarAdmin = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'usuario no administrador' }
        })
    }
}

// ============================================================== 
//  verificar Admin o mismo usuario
// ============================================================== 

exports.verificarAdmin_o_Mismo = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'usuario no administrador ni es el mismo usaurio' }
        })
    }
}