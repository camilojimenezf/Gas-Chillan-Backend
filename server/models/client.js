const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let tipoClientes = {
    values: ['COMERCIAL', 'NORMAL'],
    message: '{VALUE} no es un tipo de cliente válido'
}

let clientSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    surname: {
        type: String,
        required: [true, 'El apellido es necesario']
    },
    rut: {
        type: String,
        required: false,
        unique: false
    },
    phone: {
        type: String,
        required: [true, 'El N° de teléfono es obligatorio'],
        minlength: 8
    },
    email: {
        type: String,
        unique: true
    },
    client_type: {
        type: String,
        required: [true, 'El tipo de clientes es obligatorio'],
        enum: tipoClientes
    },
    address: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],
    enabled: {
        type: Boolean,
        default: true
    }


});

clientSchema.pre(['save', 'findByIdAndUpdate'], function(next, value) {

    // Si el rut a guardar no viene, o viene vacio, continua
    if (this.rut === undefined || this.rut === '') {

        return next();

    }

    // Se verifica que el rut no este ya guardado
    mongoose.models['Client'].findOne({ rut: this.rut }, (err, clientByRut) => {

        if (err) {

            return next(err)

        }

        // Si no lo encuentra, se puede registrar por lo tanto, continua
        if (!clientByRut) {

            next();

        }

        // Si lo encuentra lanza error
        let error = {
            message: 'El rut ya existe',
            clientByRut
        }

        return next(error);

    });

});

clientSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });
module.exports = mongoose.model('Client', clientSchema);