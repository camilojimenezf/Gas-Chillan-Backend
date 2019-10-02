const express = require('express');
const app = express();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// =========================================================================================================== //
// OBTENER TODOS LOS USUARIOS CON PAGINACIÓN //
// =========================================================================================================== //

app.get('/users', function (req, res) {
    res.send('Bienvenido a USUARIOS GAS CHILLAN')
});

// =========================================================================================================== //
// CREAR USUARIO //
// =========================================================================================================== //

app.post('/user', function (req, res) {

    let body = req.body;

    let user = new User({
        name: body.name,
        surname: body.surname,
        email: body.email,
        img: body.img,
        password: body.password, //lo sincronizamos de manera sincrona (sin usar callbacks ni promesas) y el segundo parametro
        role: body.role,
        enabled: body.enabled                           //corresponde al número de veces que se le hara hash                   
    });

    user.save( (err,userDB) => {
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            user: userDB
        })
    });
}); 

module.exports=app;