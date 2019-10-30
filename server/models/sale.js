/* Require de Mongoose y Unique Validator*/
const mongoose = require('mongoose');
const moment = require('moment-timezone');

let tiposValidos={
    values: ['EFECTIVO','DEBITO','CREDITO','CHEQUE','VALE'],
    message:'{VALUE} no es un tipo de pago válido'  //VALUE toma el valor de lo que envie el usuario
};


let Schema = mongoose.Schema;

let saleSchema = new Schema({
    order:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Order',
    },
    subtotal:{
        type: Number,
        required:true,
    },
    discount_total:{
        type: Number,
        required:true
    },
    sale_total:{
        type: Number,
        required:true
    },
    payment_type:{
        type: String,
        default:'EFECTIVO',
        enum: tiposValidos
    },
    created_at:{
        type: Date
    },
    enabled:{
        type: Boolean,
        default: true
    }
});


saleSchema.pre('save', function (next) { 
    let time=moment.tz('America/Santiago').format("YYYY-MM-DDTHH:MM:ss"); //CORREGIR HORA (ENTREGA 3 HORAS MAS TARDE)
    this.created_at=time;
    next();
});


/* Exportamos el esquema de User */
module.exports = mongoose.model( 'Sale', saleSchema ); //Usuario sera el nombre del modelo que contiene la configuracion de usuarioSchema