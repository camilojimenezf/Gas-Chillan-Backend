/* Require de Mongoose y Unique Validator*/
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const moment = require('moment-timezone');

let prioridadValida={
    values: ['ALTA','NORMAL'],
    message:'{VALUE} no es una prioridad válida'  //VALUE toma el valor de lo que envie el usuario
};

let estadosValidos={
    values: ['SIN_ASIGNAR','ASIGNADO','EN_CAMINO','CONFIRMADO','CANCELADO'],
    message:'{VALUE} no es un estado válido'  //VALUE toma el valor de lo que envie el usuario
};

let Schema = mongoose.Schema;

let orderSchema = new Schema({
    recepcionist:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User',
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        required:false,
        ref:'User',
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Client',
    },
    address:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Address',
    },
    priority:{
        type: String,
        default:'NORMAL',
        enum: prioridadValida
    },
    orderDetail:[{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'OrderDetail',
    }],
    order_status:{
        type: String,
        default:'SIN ASIGNAR',
        enum: estadosValidos
    },
    created_at:{
        type: String
    },
    confirmed_at:{
        type: String
    },
    enabled:{
        type: Boolean,
        default: true
    }
});


orderSchema.pre('save', function (next) {
    
    let time=moment().tz('America/Santiago').format(); 
    this.created_at=time;
    
    next();
});


/* Exportamos el esquema de User */
module.exports = mongoose.model( 'Order', orderSchema ); //Usuario sera el nombre del modelo que contiene la configuracion de usuarioSchema