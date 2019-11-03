const express = require('express');
const app = express();
const moment = require('moment-timezone');

const Sale = require('../models/sale');
const Order = require('../models/order');

app.get('/sale', function (req, res) {
    
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    limite=Number(limite);

    Sale.find({enabled: enabled})
            .skip(desde)   
            .limit(limite)
            .populate({ path: 'order', populate: { path: 'orderDetail'} })
            .populate('seller')
            .exec( (err, sales) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                Sale.countDocuments({enabled: enabled}, (err,conteo)=>{
                    res.json({
                        ok:true,
                        sales,
                        cantidad: conteo
                    });
                })
            });
});

app.get('/sale/:id', (req,res)=>{

    let id=req.params.id;

    Sale.findById(id)
        .populate({ path: 'order', populate: { path: 'orderDetail'} })
        .populate('seller')
        .exec((err,saleDB)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            if(!saleDB){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'ID no existe'
                    }
                });
            }
            res.json({
                ok:true,
                sale: saleDB
            });
        });
});

app.post('/sale/:id_order', function (req, res) {

    let body = req.body;
    let id_order = req.params.id_order;

    let sale = new Sale({
        order: id_order,
        seller: body.seller,
        subtotal: body.subtotal,
        discount_total: body.discount_total,
        sale_total: body.sale_total,
        payment_type: body.payment_type,
        enabled: body.enabled               
    });

    sale.save( (err,saleDB) => {
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        //se creo la venta ahora se debe confirmar el pedido 
        return confirmarPedido(id_order,saleDB,res);
    });
}); 


app.put('/sale/:id', function(req, res){

    let id= req.params.id;
    let body= req.body;

    Sale.findByIdAndUpdate(id, body,{new:true} ,(err, saleUpdated)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !saleUpdated ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Venta no encontrada'
                }
            });
        }
        res.json({
            ok:true,
            sale: saleUpdated
        });
    });
});

app.delete('/sale/:id', function (req, res){
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };

    Sale.findByIdAndUpdate(id, cambiaEstado ,{new:true} ,(err, saleDeleted)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !saleDeleted ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Venta no encontrada'
                }
            });
        }
        res.json({
            ok:true,
            sale: saleDeleted
        });
    });
});

function confirmarPedido(id_order,saleDB,res){
    Order.findById(id_order, (err, orderDB)=>{
        if(err){
            Sale.findByIdAndRemove(saleDB._id);
            return res.status(500).json({
                ok:false,
                err,
                message:'No se pudo confirmar el pedido'
            });
        }
        if(!orderDB){
            Sale.findByIdAndRemove(saleDB._id);
            return res.status(400).json({
                ok:false,
                err:{
                    message:'No se pudo confirmar el pedido'
                }
            });
        }
        orderDB.confirmed_at = moment.tz('America/Santiago').format("YYYY-MM-DDTHH:MM:ss");
        orderDB.save((err, orderUpdated)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            };
            return res.json({
                ok:true,
                order:orderUpdated,
                sale: saleDB
            });
        });
    });
}

module.exports=app;
