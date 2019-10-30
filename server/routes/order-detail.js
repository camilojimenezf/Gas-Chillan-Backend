const express = require('express');
const app = express();

const OrderDetail = require('../models/order-detail');
const Order = require('../models/order');

app.get('/order-detail', function (req, res) {
    
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    limite=Number(limite);

    OrderDetail.find({enabled: enabled})
            .skip(desde)   
            .limit(limite)
            .populate('cylinder', 'type capacity price price_guarantee')
            .exec( (err, orders_detail) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                OrderDetail.countDocuments({enabled: true}, (err,conteo)=>{
                    res.json({
                        ok:true,
                        orders_detail,
                        cantidad: conteo
                    });
                })
            });
});

app.get('/order-detail/:id', (req,res)=>{

    let id=req.params.id;

    OrderDetail.findById(id)
        .populate('cylinder', 'type capacity price price_guarantee')
        .exec((err,orderDetailDB)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            if(!orderDetailDB){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'ID no existe'
                    }
                });
            }
            res.json({
                ok:true,
                orderDetail: orderDetailDB
            });
        });
});

app.post('/order-detail/:id', function (req, res) {

    let body = req.body;
    //id corresponde al id de la orden a la que se debe vincular el detalle
    let id = req.params.id;

    let orderDetail = new OrderDetail({
        cylinder: body.cylinder,
        total_quantity: body.total_quantity,
        guarantee_quantity: body.guarantee_quantity,
        benefit_quantity: body.benefit_quantity,
        discount: body.discount,
        price: body.price           
    });
    orderDetail.save( (err,orderDetailDB) => {
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        //Se debe vincular el detalle a la orden
        return vincularDetalleOrden(orderDetailDB, id , res);

    });
}); 

app.put('/order-detail/:id', function(req, res){

    let id= req.params.id;
    let body= req.body;
    OrderDetail.findByIdAndUpdate(id, body,{new:true} ,(err, orderDetailUpdated)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !orderDetailUpdated ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Order Detail no encontrado'
                }
            });
        }
        res.json({
            ok:true,
            orderDetail: orderDetailUpdated
        });
    });
});

app.delete('/order-detail/:id', function (req, res){
    let id = req.params.id;
 
    OrderDetail.findByIdAndRemove(id ,(err, orderDetailDeleted)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !orderDetailDeleted ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Order Detail no encontrado'
                }
            });
        }
        res.json({
            ok:true,
            orderDetail: orderDetailDeleted
        });
    });
});

// =========================================================================================================== //
// Esta funcion vincula un detalle a la orden, en caso de error elimina el detalle y retorna un mensaje del error  //
// =========================================================================================================== //
function vincularDetalleOrden(detalle , id, res){
    Order.findById(id, (err, orderDB)=>{
        if(err){
            OrderDetail.findByIdAndRemove(detalle._id);
            return res.status(500).json({
                ok:false,
                err,
                message:'El Detalle no se pudo vincular a la Orden'
            });
        }
        if(!orderDB){
            OrderDetail.findByIdAndRemove(detalle._id);
            return res.status(400).json({
                ok:false,
                err:{
                    message:'El Detalle no se pudo vincular a la Orden'
                }
            });
        }
        orderDB.orderDetail.push(detalle._id);
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
                orderDetail:detalle
            });
        });
    });
}

module.exports=app;
