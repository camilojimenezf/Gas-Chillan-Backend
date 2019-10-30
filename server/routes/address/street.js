const express = require('express');
const app = express();

const Street = require('../../models/street');


app.get('/street', function (req, res) {
    
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 1000;
    limite=Number(limite);
    
    Street.find({enabled: true}, 'name')
            .skip(desde)   
            .limit(limite)
            .populate('village', 'name')
            .exec( (err, streets) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                Street.countDocuments({enabled: true}, (err,conteo)=>{
                    res.json({
                        ok:true,
                        streets,
                        cantidad: conteo
                    });
                })
            });
});

app.get('/street/:id', (req,res)=>{

    let id=req.params.id;

    Street.findById(id)
        .populate('village', 'name')
        .exec((err,streetDB)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            if(!streetDB){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'ID no existe'
                    }
                });
            }
            res.json({
                ok:true,
                street:streetDB
            });
        });
});

app.post('/street', function (req, res) {

    let body = req.body;

    let street = new Street({
        name: body.name,
        village: body.village,
        enabled: body.enabled               
    });

    street.save( (err,streetDB) => {
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            street: streetDB
        })
    });
}); 


app.put('/street/:id', function(req, res){

    let id= req.params.id;
    let body= req.body;

    Street.findByIdAndUpdate(id, body,{new:true} ,(err, streetUpdated)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !streetUpdated ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Calle no encontrada'
                }
            });
        }
        res.json({
            ok:true,
            street: streetUpdated
        });
    });
});

app.delete('/street/:id', function (req, res){
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };

    Street.findByIdAndUpdate(id, cambiaEstado ,{new:true} ,(err, streetDeleted)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !streetDeleted ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Calle no encontrada'
                }
            });
        }
        res.json({
            ok:true,
            street: streetDeleted
        });
    });
});

// =========================================================================================================== //
// SERVICIOS ESPECIALES //
// =========================================================================================================== //
app.get('/village/:id/streets',function (req, res) {
    let id = req.params.id;
    Street.find({village: id, enabled:true},'name')
            .exec( (err, streets) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                Street.countDocuments({village: id, enabled:true}, (err,conteo)=>{
                    res.json({
                        ok:true,
                        streets,
                        cantidad: conteo
                    });
                })
            });
});

module.exports=app;