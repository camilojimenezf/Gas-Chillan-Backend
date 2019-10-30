/* Require de Mongoose y Unique Validator*/
const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let orderDetailSchema = new Schema({
    cylinder: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cylinder',
    },
    total_quantity: {
        type: Number,
        required: true
    },
    guarantee_quantity: {
        type: Number,
        default: 0
    },
    benefit_quantity: {
        type: Number,
        default: 0
    },
    type_discount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discount',
    },
    total_discount: {
        type: Number,
        default: null
    },
    price: {
        type: Number,
        required: true
    }
});



/* Exportamos el esquema de User */
module.exports = mongoose.model('OrderDetail', orderDetailSchema); //Usuario sera el nombre del modelo que contiene la configuracion de usuarioSchema