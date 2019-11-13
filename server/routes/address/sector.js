const express = require('express');
const app = express();

const Sector = require('../../models/sector');
const Order = require('../../models/order');

app.get('/sector', function(req, res) {

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 1000;

    let habilitado = req.query.enabled || true;

    Sector.find({ enabled: habilitado }, 'name')
        .skip(desde)
        .limit(limite)
        .exec((err, sectors) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Sector.countDocuments({ enabled: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    sectors,
                    cantidad: conteo
                });
            })
        });
});

app.get('/sector/:id', (req, res) => {

    let id = req.params.id;

    Sector.findById(id)
        .exec((err, sectorDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!sectorDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }
            res.json({
                ok: true,
                sector: sectorDB
            });
        });
});

app.post('/sector', function(req, res) {

    let body = req.body;

    let sector = new Sector({
        name: body.name,
        enabled: body.enabled
    });

    let regex = new RegExp(body.name, 'i');

    //Verifica que el sector no este registrado
    Sector.findOne({ name: regex }, (err, sectorFound) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si lo encuentra es porque ya está registrado un sector con ese nombre
        if (sectorFound) {
            res.status(400).json({
                ok: false,
                found: true,
                sectorFound,
                err: {
                    message: 'El sector ya se encuentra registrado'
                }
            })
        } else {

            sector.save((err, sectorDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                res.status(201).json({
                    ok: true,
                    sector: sectorDB
                })
            });

        }


    });

});


app.put('/sector/:id', function(req, res) {

    let id = req.params.id;
    let body = req.body;

    Sector.findByIdAndUpdate(id, body, { new: true }, (err, sectorUpdate) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!sectorUpdate) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            sector: sectorUpdate
        });

    });

});

app.delete('/sector/:id', function(req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };

    Sector.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, sectorDeleted) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!sectorDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Sector no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            sector: sectorDeleted
        });
    });
});

// =========================================================================================================== //
// Obtener todos los pedidos de un sector //
// =========================================================================================================== //
app.get('/sector-order/:id_sector', (req,res)=>{

    let id_sector = req.params.id_sector;
    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    limite=Number(limite);

    let start = req.query.start || new Date('2000-01-01').toISOString();
    let end = req.query.end || new Date().toISOString();

    Order.find({enabled: enabled, created_at: { '$gte': start, '$lte': end }})
    .skip(desde)   
    .limit(limite)
    .populate({path:'address',match:{sector:id_sector}})
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
        //de momento se filtra de esta manera ya que solo esta cargando las direcciones que coinciden con el sector
        //las direcciones que no coinciden tendran el campo null
        orders = orders.filter(o => o.address != null);
        res.json({
            ok:true,
            orders,
            cantidad: orders.length
        });
        
    });
})

module.exports = app;