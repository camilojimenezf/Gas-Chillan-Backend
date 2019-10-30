const express = require('express');
const app = express();

const Village = require('../../models/village');

app.get('/village', function (req, res) {
    
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 1000;
    limite=Number(limite);
    
    Village.find({enabled: true}, 'name')
            .skip(desde)   
            .limit(limite)
            .populate('sector', 'name')
            .exec( (err, villages) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                Village.countDocuments({enabled: true}, (err,conteo)=>{
                    res.json({
                        ok:true,
                        villages,
                        cantidad: conteo
                    });
                })
            });
});

app.get('/village/:id', (req,res)=>{

    let id=req.params.id;

    Village.findById(id)
        .populate('sector', 'name')
        .exec((err, villageDB)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            if(!villageDB){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'ID no existe'
                    }
                });
            }
            res.json({
                ok:true,
                village: villageDB
            });
        });
});

app.post('/village', function (req, res) {

    let body = req.body;

    let village = new Village({
        name: body.name,
        sector: body.sector,
        enabled: body.enabled               
    });

    village.save( (err,villageDB) => {
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            village: villageDB
        })
    });
}); 


app.put('/village/:id', function(req, res){

    let id= req.params.id;
    let body= req.body;

    Village.findById(id, (err, villageDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!villageDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'El ID no existe'
                }
            });
        }
        villageDB.name= body.name;
        if(body.sector){
            villageDB.sector= body.sector;
        }
        villageDB.save( (err, villageUpdate)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            res.json({
                ok:true,
                village: villageUpdate
            })
        });
    });
});

app.delete('/village/:id', function (req, res){
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };

    Village.findByIdAndUpdate(id, cambiaEstado ,{new:true} ,(err, villageDeleted)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !villageDeleted ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Villa no encontrada'
                }
            });
        }
        res.json({
            ok:true,
            village: villageDeleted
        });
    });
});


module.exports=app;