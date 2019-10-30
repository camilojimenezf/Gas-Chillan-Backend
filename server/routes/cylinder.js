const express = require('express');
const app = express();

const Cylinder = require('../models/cylinder');

app.get('/cylinder', function (req, res) {
    
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 1000;
    limite=Number(limite);
    
    Cylinder.find({enabled: true})
            .skip(desde)   
            .limit(limite)
            .exec( (err, cylinders) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                Cylinder.countDocuments({enabled: true}, (err,conteo)=>{
                    res.json({
                        ok:true,
                        cylinders,
                        cantidad: conteo
                    });
                })
            });
});

app.get('/cylinder/:id', (req,res)=>{

    let id=req.params.id;

    Cylinder.findById(id)
        .exec((err, cylinderDB)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            if(!cylinderDB){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'ID no existe'
                    }
                });
            }
            res.json({
                ok:true,
                cylinder: cylinderDB
            });
        });
});

app.post('/cylinder', function (req, res) {

    let body = req.body;

    let cylinder = new Cylinder({
        type: body.type,
        capacity: body.capacity,
        price: body.price,
        price_guarantee: body.price_guarantee,
        enabled: body.enabled               
    });

    cylinder.save( (err,cylinderDB) => {
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            cylinder: cylinderDB
        })
    });
}); 

app.put('/cylinder/:id', function(req, res){

    let id= req.params.id;
    let body= req.body;

    Cylinder.findByIdAndUpdate(id, body,{new:true} ,(err, cylinderUpdated)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !cylinderUpdated ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Cilindro no encontrado'
                }
            });
        }
        res.json({
            ok:true,
            cylinder: cylinderUpdated
        });
    });
});

app.delete('/cylinder/:id', function (req, res){
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };

    Cylinder.findByIdAndUpdate(id, cambiaEstado ,{new:true} ,(err, cylinderDeleted)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !cylinderDeleted ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Cilindro no encontrado'
                }
            });
        }
        res.json({
            ok:true,
            cylinder: cylinderDeleted
        });
    });
});

module.exports=app;