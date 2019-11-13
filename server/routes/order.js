const express = require('express');
const app = express();
const _ = require('underscore');
const Order = require('../models/order');

app.get('/order', function(req, res) {

    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    limite=Number(limite);

    let start = req.query.start || new Date('2000-01-01').toISOString();
    let end = req.query.end || new Date().toISOString();

    Order.find({enabled: enabled, created_at: { '$gte': start, '$lte': end }})
            .skip(desde)   
            .limit(limite)
            .populate({path:'address',populate:{path:'sector village street',select:'name'}})
            .populate('recepcionist', 'name surname')
            .populate('seller', 'name surname')
            .populate('client', 'name surname phone email client_type')
            .populate({path:'orderDetail',populate:{ path:'cylinder'}})
            .exec( (err, orders) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                Order.countDocuments({enabled: enabled, created_at: { '$gte': start, '$lte': end }}, (err,conteo)=>{
                    res.json({
                        ok:true,
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
        .populate({path:'orderDetail',populate:{ path:'cylinder'}})
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

    //Verificar si tiene chofer no puede estar sin asignar
    if(order.seller && order.order_status==='SIN_ASIGNAR'){
        order.order_status='ASIGNADO'
    }

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
    let body = _.pick(req.body, ['receipcionist', 'seller', 'client', 'address', 'priority','order_status','enabled']);

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

//Este servicio entrega todos los order relacionados a un user (seller,recepcionist o client), dado el id del user
app.get('/order/:tipo/:id', (req, res)=>{

    let id = req.params.id;
    let tipo = req.params.tipo;
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    limite=Number(limite);

    let start = req.query.start || new Date('2000-01-01').toISOString();
    let end = req.query.end || new Date().toISOString();

    Order.find({enabled: enabled, created_at: { '$gte': start, '$lte': end }})
    .where(tipo).equals(id)
    .skip(desde)   
    .limit(limite)
    .populate({path:'address',populate:{path:'sector village street',select:'name'}})
    .populate('recepcionist', 'name surname')
    .populate('seller', 'name surname')
    .populate('client', 'name surname phone email client_type')
    .populate({path:'orderDetail',populate:{ path:'cylinder'}})
    .exec( (err, orders) =>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        Order.countDocuments({enabled: enabled, created_at: { '$gte': start, '$lte': end }})
        .where(tipo).equals(id)
        .exec( (err,conteo)=>{
            res.json({
                ok:true,
                orders,
                cantidad: conteo
            });
        })
    });
});
//este servicio entrega todas las ordenes con un estado especifico
app.get('/status/order/:status', (req,res)=>{
    let status = req.params.status;
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    limite=Number(limite);

    let start = req.query.start || new Date('2000-01-01').toISOString();
    let end = req.query.end || new Date().toISOString();

    Order.find({enabled: enabled, order_status:status, created_at: { '$gte': start, '$lte': end }})
    .skip(desde)   
    .limit(limite)
    .populate({path:'address',populate:{path:'sector village street',select:'name'}})
    .populate('recepcionist', 'name surname')
    .populate('seller', 'name surname')
    .populate('client', 'name surname phone email client_type')
    .populate({path:'orderDetail',populate:{ path:'cylinder'}})
    .exec( (err, orders) =>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        Order.countDocuments({enabled: enabled, order_status: status,created_at: { '$gte': start, '$lte': end }},(err,conteo)=>{
            res.json({
                ok:true,
                orders,
                cantidad: conteo
            });
        })
    });
});
//este servicio entrega todas las ordenes de un tipo de usuario con un estado especifico
app.get('/status/order/:status/:tipo/:id', (req, res)=>{
    let status = req.params.status;
    let id = req.params.id;
    let tipo = req.params.tipo;
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    limite=Number(limite);

    let start = req.query.start || new Date('2000-01-01').toISOString();
    let end = req.query.end || new Date().toISOString();

    Order.find({enabled: enabled, order_status:status, created_at: { '$gte': start, '$lte': end } })
    .where(tipo).equals(id)
    .skip(desde)   
    .limit(limite)
    .populate({path:'address',populate:{path:'sector village street',select:'name'}})
    .populate('recepcionist', 'name surname')
    .populate('seller', 'name surname')
    .populate('client', 'name surname phone email client_type')
    .populate({path:'orderDetail',populate:{ path:'cylinder'}})
    .exec( (err, orders) =>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        Order.countDocuments({enabled: enabled, order_status:status, created_at: { '$gte': start, '$lte': end } })
        .where(tipo).equals(id)
        .exec( (err,conteo)=>{
            res.json({
                ok:true,
                orders,
                cantidad: conteo
            });
        })
    });
});


module.exports = app;