const express = require('express');
const app = express();

const Order = require('../models/order');

app.get('/order', function(req, res) {

    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    limite = Number(limite);

    Order.find({ enabled: enabled })
        .skip(desde)
        .limit(limite)
        .populate({ path: 'address', populate: { path: 'sector village street', select: 'name' } })
        .populate('recepcionist', 'name surname')
        .populate('seller', 'name surname')
        .populate('client', 'name surname phone email client_type')
        .populate('orderDetail')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Order.countDocuments({ enabled: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    orders,
                    cantidad: conteo
                });
            })
        });
});

app.get('/order/:id', (req, res) => {

    let id = req.params.id;

    Order.findById(id)
        .populate({ path: 'address', populate: { path: 'sector village street', select: 'name' } })
        .populate('recepcionist', 'name surname')
        .populate('seller', 'name surname')
        .populate('client', 'name surname phone email client_type')
        .populate('orderDetail')
        .exec((err, orderDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!orderDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }
            res.json({
                ok: true,
                order: orderDB
            });
        });
});

app.post('/order', function(req, res) {

    let body = req.body;

    let order = new Order({
        recepcionist: body.recepcionist,
        seller: body.seller,
        client: body.client,
        address: body.address,
        priority: body.priority,
        order_status: body.order_status,
        enabled: body.enabled
    });

    order.save((err, orderDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            order: orderDB
        })
    });
});


app.put('/order/:id', function(req, res) {

    let id = req.params.id;
    let body = req.body;

    Order.findByIdAndUpdate(id, body, { new: true }, (err, orderUpdated) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!orderUpdated) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Order no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            order: orderUpdated
        });
    });
});

app.delete('/order/:id', function(req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };

    Order.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, orderDeleted) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!orderDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Order no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            order: orderDeleted
        });
    });
});

// =========================================================================================================== //
// SERVICIOS ESPECIALES //
// =========================================================================================================== //



module.exports = app;