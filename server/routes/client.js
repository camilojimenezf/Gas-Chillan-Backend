/*=================================================================================================================================*/
// Requires
/*=================================================================================================================================*/
const express = require('express');
const app = express();
const { verificaToken, verificaAdmin_Recep_Role } = require('../middlewares/autenticacion');


const Client = require('../models/client');

/*=================================================================================================================================*/
// Obtener todos los clientes
/*=================================================================================================================================*/
app.get('/clients', [verificaToken, verificaAdmin_Recep_Role], (req, res) => {

    //Si viene este parametro opcional, buscara los clientes borrados (deshabilitados)
    let habilitado = req.query.enabled || true;

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;

    Client.find({ enabled: habilitado }, 'name surname phone rut email enabled client_type')
        .skip(desde)
        .limit(limite)
        .exec((err, clients) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Client.countDocuments({ enabled: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    clients,
                    cantidad: conteo
                });
            });
        });

});

/*=================================================================================================================================*/
// Obtener cliente por su id
/*=================================================================================================================================*/

app.get('/client/:id', [verificaToken, verificaAdmin_Recep_Role], (req, res) => {

    let id = req.params.id;

    Client.findById(id, (err, clientDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!clientDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            client: clientDB
        });



    });

});

/*=================================================================================================================================*/
// Actualizar cliente por su id
/*=================================================================================================================================*/
app.put('/client/:id', [verificaToken, verificaAdmin_Recep_Role], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    if (Object.keys(body).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha enviado ningún dato'
            }
        });
    }

    Client.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, clientDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            client: clientDB
        });

    });

});


/*=================================================================================================================================*/
// Crear un cliente
/*=================================================================================================================================*/
app.post('/client', [verificaToken, verificaAdmin_Recep_Role], (req, res) => {

    let body = req.body;

    let client = new Client({
        name: body.name,
        surname: body.surname,
        rut: body.rut,
        phone: body.phone,
        email: body.email,
        client_type: body.client_type
    });

    client.save((err, clientDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            client: clientDB
        });

    });
});

/*=================================================================================================================================*/
// Borrar cliente por su id
/*=================================================================================================================================*/
app.delete('/client/:id', [verificaToken, verificaAdmin_Recep_Role], (req, res) => {

    let id = req.params.id;

    let cambiaEstado = {
        enabled: false
    }

    Client.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, clientDeleted) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!clientDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Cliente no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            client: clientDeleted
        });

    });


});


module.exports = app;