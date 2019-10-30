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
        unique: true
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
    address:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Address'
    }],
    enabled: {
        type: Boolean,
        default: true
    }


});

clientSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });
module.exports = mongoose.model('Client', clientSchema);