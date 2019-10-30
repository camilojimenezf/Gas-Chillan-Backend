/* Require de Mongoose y Unique Validator*/
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let prioridadValida={
    values: ['ALTA','NORMAL'],
    message:'{VALUE} no es una prioridad válida'  //VALUE toma el valor de lo que envie el usuario
};

let estadosValidos={
    values: ['SIN ASIGNAR','ASIGNADO','EN CAMINO','CONFIRMADO','CANCELADO'],
    message:'{VALUE} no es un estado válido'  //VALUE toma el valor de lo que envie el usuario
};

let Schema = mongoose.Schema;

let orderSchema = new Schema({
    recepcionist:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Client',
        require:true
    },
    priority:{
        type: String,
        default:'NORMAL',
        enum: prioridadValida
    },
    order_status:{
        type: String,
        default:'SIN ASIGNAR',
        enum: estadosValidos
    },
    enabled:{
        type: Boolean,
        default: true
    }
},
{
    timestamps:true
});



/* Exportamos el esquema de User */
module.exports = mongoose.model( 'Order', orderSchema ); //Usuario sera el nombre del modelo que contiene la configuracion de usuarioSchema