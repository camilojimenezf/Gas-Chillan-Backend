const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let discountSchema = new Schema({

    type: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    enabled: {
        type: Boolean,
        default: true
    }

});

discountSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });
module.exports = mongoose.model('Discount', discountSchema);