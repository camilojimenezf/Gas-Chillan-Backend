const express = require('express');
const app = express();

const Sector = require('../../models/sector');

app.get('/sector', function (req, res) {
    
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 1000;
    limite=Number(limite);
    
    Sector.find({enabled: true}, 'name')
            .skip(desde)   
            .limit(limite)  
            .exec( (err, sectors) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                Sector.countDocuments({enabled: true}, (err,conteo)=>{
                    res.json({
                        ok:true,
                        sectors,
                        cantidad: conteo
                    });
                })
            });
});

app.get('/sector/:id', (req,res)=>{

    let id=req.params.id;

    Sector.findById(id)
        .exec((err, sectorDB)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            if(!sectorDB){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'ID no existe'
                    }
                });
            }
            res.json({
                ok:true,
                sector: sectorDB
            });
        });
});

app.post('/sector', function (req, res) {

    let body = req.body;

    let sector = new Sector({
        name: body.name,
        enabled: body.enabled               
    });

    sector.save( (err,sectorDB) => {
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            sector: sectorDB
        })
    });
}); 


app.put('/sector/:id', function(req, res){

    let id= req.params.id;
    let body= req.body;

    Sector.findById(id, (err, sectorDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!sectorDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'El ID no existe'
                }
            });
        }
        sectorDB.name= body.name;
        sectorDB.save( (err, sectorUpdate)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            res.json({
                ok:true,
                sector: sectorUpdate
            })
        });
    });
});

app.delete('/sector/:id', function (req, res){
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };

    Sector.findByIdAndUpdate(id, cambiaEstado ,{new:true} ,(err, sectorDeleted)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if( !sectorDeleted ){
            return res.status(400).json({
                ok:false,
                err:{   
                    message:'Sector no encontrado'
                }
            });
        }
        res.json({
            ok:true,
            sector: sectorDeleted
        });
    });
});

module.exports=app;