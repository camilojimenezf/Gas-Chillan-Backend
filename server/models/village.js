const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let villageSchema = new Schema({
    name:{
        type: String,
        unique:true,
        required: [true,'El nombre es necesario']
    },
    sector:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Sector'
    }],
    enabled:{
        type: Boolean,
        default: true
    }
});

villageSchema.plugin( uniqueValidator, {message: '{PATH} debe de ser único'});

module.exports = mongoose.model( 'Village', villageSchema ); 