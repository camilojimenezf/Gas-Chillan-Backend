/* Require de Mongoose y Unique Validator*/
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');

let Schema = mongoose.Schema;

let rolesValidos={
    values: ['ADMIN_ROLE','RECEPCIONIST_ROLE','SELLER_ROLE'],
    message:'{VALUE} no es un rol válido'  //VALUE toma el valor de lo que envie el usuario
};

let userSchema = new Schema({
    name:{
        type: String,
        required: [true,'El nombre es necesario']
    },
    surname:{
        type: String,
        required: [true,'El apellido es necesario']
    },
    email:{
        type: String,
        unique: true,
        required: [true,'El correo es necesario']
    },
    password:{
        type:String,
        required: [true,'La contraseña es obligatoria'],
    },
    img:{
        type: String,
        required: false, //si no especifico es false por defecto
    },
    role:{
        type: String,
        required: true,
        enum: rolesValidos
    },
    enabled:{
        type: Boolean,
        default: true
    }
});

userSchema.methods.toJSON = function(){
    //modificamos la respuesta en formato json del schema de usuario, eliminando el envio de la contraseña 
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

userSchema.plugin( uniqueValidator, {message: '{PATH} debe de ser único'}); //PATH hace referencia al campo que no cumple la validación

/**
 * Hacemos hashing a la password antes de guardar el nuevo usuario
 */
// userSchema.pre('save', function (next) { 
//     bcrypt.hash(this.password,10, (err,res)=>{
//         console.log(res);
//         this.password=res;
//         if(err){
//             next(err);
//         }else{
//             next();
//         }
//     });
// });

/* Exportamos el esquema de User */
module.exports = mongoose.model( 'User', userSchema ); //Usuario sera el nombre del modelo que contiene la configuracion de usuarioSchema