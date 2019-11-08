const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let addressSchema = new Schema({
    village: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Village'
    },
    sector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sector'
    },
    street: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Street'
    },
    number: {
        type: Number,
        required: true
    },
    departament: {
        type: Number,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    enabled: {
        type: Boolean,
        default: true
    }
});

addressSchema.index({ village: 1, sector: 1, street: 1, number: 1, departament: 1 }, { unique: true }); //combinacion de estos atributos no se puede repetir, no debemos duplicar una misma direccion en la bdd

addressSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Address', addressSchema);