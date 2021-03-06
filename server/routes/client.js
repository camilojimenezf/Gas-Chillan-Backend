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
app.get('/client', (req, res) => {

    //Si viene este parametro opcional, buscara los clientes borrados (deshabilitados)
    let habilitado = req.query.enabled || true;

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;

    Client.find({ enabled: habilitado }, 'name surname phone rut email enabled client_type')
        .skip(desde)
        .limit(limite)
        .populate({ path: 'address', populate: { path: 'sector village street', select: 'name' } })
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

app.get('/client/:id', (req, res) => {

    let id = req.params.id;

    Client.findById(id)
        .populate({ path: 'address', populate: { path: 'sector village street', select: 'name' } })
        .exec((err, clientDB) => {

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
app.put('/client/:id', (req, res) => {

    let id = req.params.id;
    let body = req.body;

    // Si el objeto viene vacio
    if (Object.keys(body).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha enviado ningún dato'
            }
        });
    }

    // Si se quiere actualizar el rut, debemos verificar que el rut no este registrado en la bdd
    if (body.rut !== undefined) {

        Client.findOne({ rut: body.rut }, (err, clientByRut) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Si no lo encuentra, lo guarda
            if (!clientByRut) {

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

            } else { // Si lo encuentra lanza error

                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'El rut ingresado ya existe'
                    }
                });
            }


        });

    } else { // si no viene el rut


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

    }

});


/*=================================================================================================================================*/
// Crear un cliente
/*=================================================================================================================================*/
app.post('/client', (req, res) => {

    let body = req.body;

    let client = new Client({
        name: body.name,
        surname: body.surname,
        rut: body.rut,
        phone: body.phone,
        email: body.email,
        client_type: body.client_type,
        address: body.address
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
app.delete('/client/:id', (req, res) => {

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
// =========================================================================================================== //
// Vincular dirección al cliente //
// =========================================================================================================== //
app.put('/client-address/:id_client', (req,res)=>{

    let id=req.params.id_client;
    let body = req.body;

    let address= body.address;

    Client.findById(id, (err, clientDB)=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if(clientDB.address.includes(address)){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'La direccion ya esta vinculada al cliente'
                }
            });
        }else{
            clientDB.address.push(address);
        }

        clientDB.save((err, clientDB) => {

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

    
});

/*=================================================================================================================================*/
// Buscar Clientes
/*=================================================================================================================================*/

app.get('/client/search/:term', (req, res) => {

    let termino = req.params.term;

    let regex = new RegExp(termino, 'i');

    Client.find({ name: regex })
        .populate('address')
        .exec((err, clients) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                clients
            });

        });

});

app.get('/client/phone/:phone', (req, res) => {

    let termino = req.params.phone;

    let regex = new RegExp(termino, 'i');

    Client.find({ phone: regex })
        .populate('address')
        .exec((err, clients) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                clients
            });

        });

});


module.exports = app;