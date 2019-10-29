const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let streetSchema = new Schema({
    name:{
        type: String,
        unique:true,
        required: [true,'El nombre es necesario']
    },
    village:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Village'
    }],
    enabled:{
        type: Boolean,
        default: true
    }
});

streetSchema.plugin( uniqueValidator, {message: '{PATH} debe de ser único'});

module.exports = mongoose.model( 'Street', streetSchema ); 