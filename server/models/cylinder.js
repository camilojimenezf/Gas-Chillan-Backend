const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let tiposValidos={
    values: ['CATALITICO','NO_CATALITICO','ALUMINIO'],
    message:'{VALUE} no es un tipo válido'  
};

let cylinderSchema = new Schema({
    type:{
        type: String,
        required:true,
        enum: tiposValidos,
    },
    capacity:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        min:0
    },
    price_guarantee:{
        type:Number,
        min:0
    },
    enabled:{
        type: Boolean,
        default: true
    }
});

cylinderSchema.index({capacity: 1, type: 1}, { unique: true }) 
cylinderSchema.plugin( uniqueValidator, {message: '{PATH} debe de ser único'});

module.exports = mongoose.model( 'Cylinder', cylinderSchema ); 