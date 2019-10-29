/*=================================================================================================================================*/
// Requires
/*=================================================================================================================================*/
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importación de modelo de usuario
const Usuario = require('../models/user');

const app = express();

/*=================================================================================================================================*/
// Ruta para Login personalizado
/*=================================================================================================================================*/
app.post('/login', (req, res) => {

    let body = req.body;

    // Se busca un usuario que tenga el mismo email que el ingresado 
    Usuario.findOne({ email: body.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Las credenciales ingresadas no son válidas'
                }
            });
        }

        //Comparamos las contraseñas
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Las credenciales ingresadas no son válidas'
                }
            });
        }

        //Generamos el token
        let token = jwt.sign({
            user: userDB //payload
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // variables globales definidas en el archivo config


        //Respuesta al cliente
        res.json({
            ok: true,
            user: userDB,
            token
        });

    });

});


module.exports = app;