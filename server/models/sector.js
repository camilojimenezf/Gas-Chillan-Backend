const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let sectorSchema = new Schema({
    name:{
        type: String,
        unique:true,
        required: [true,'El nombre es necesario']
    },
    enabled:{
        type: Boolean,
        default: true
    }
});

sectorSchema.plugin( uniqueValidator, {message: '{PATH} debe de ser único'});

module.exports = mongoose.model( 'Sector', sectorSchema ); 