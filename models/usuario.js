var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}


var usuarioSchema = new Schema({

        name: { type: String, required: [true, 'El nombre es requerido'] },
        email: { type: String, unique: true, required: [true, 'El correo es requerido'] },
        password: { type: String, required: [true, 'La contraseñaes requerida'] },
        img: { type: String, required: false },
        role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
        google: { type: Boolean, default: false }

    }, { versionKey: false } // desactiva la creacion automatica de __v en la base de datos
);

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model("Usuario", usuarioSchema);