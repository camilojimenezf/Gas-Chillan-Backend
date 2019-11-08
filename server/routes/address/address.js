const express = require('express');
const app = express();
const _ = require('underscore');

const Address = require('../../models/address');

app.get('/address', function(req, res) {

    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    limite = Number(limite);

    let habilitado = req.query.enabled || true;

    Address.find({ enabled: habilitado })
        .skip(desde)
        .limit(limite)
        .populate('sector', 'name')
        .populate('village', 'name')
        .populate('street', 'name')
        .exec((err, addresses) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Address.countDocuments({ enabled: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    addresses,
                    cantidad: conteo
                });
            })
        });
});

app.get('/address/:id', (req, res) => {

    let id = req.params.id;

    Address.findById(id)
        .populate('sector', 'name')
        .populate('village', 'name')
        .populate('street', 'name')
        .exec((err, addressDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!addressDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }
            res.json({
                ok: true,
                address: addressDB
            });
        });
});

app.post('/address', function(req, res) {

    let body = req.body;
    let address = new Address({
        number: body.number,
        sector: body.sector,
        village: body.village,
        street: body.street,
        departament: body.departament,
        description: body.description,
        enabled: body.enabled
    });
    address.save((err, addressDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            address: addressDB
        })
    });
});

app.put('/address/:id', function(req, res) {

    let id = req.params.id;
    let body = req.body;

    Address.findByIdAndUpdate(id, body, { new: true }, (err, addressUpdated) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!addressUpdated) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Direccion no encontrada'
                }
            });
        }
        res.json({
            ok: true,
            address: addressUpdated
        });
    });
});

app.delete('/address/:id', function(req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };
    Address.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, addressDeleted) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!addressDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Direccion no encontrada'
                }
            });
        }
        res.json({
            ok: true,
            address: addressDeleted
        });
    });
});



module.exports = app;