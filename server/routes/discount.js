/*=================================================================================================================================*/
// Requires
/*=================================================================================================================================*/
const express = require('express');
const app = express();
const { verificaToken, verificaAdmin_Recep_Role } = require('../middlewares/autenticacion');


const Discount = require('../models/discount');

/*=================================================================================================================================*/
// Obtener todos los descuentos
/*=================================================================================================================================*/
app.get('/discounts', (req, res) => {

    //Si viene este parametro opcional, buscara los clientes borrados (deshabilitados)
    let habilitado = req.query.enabled || true;

    Discount.find({ enabled: habilitado })
        .exec((err, discountsDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Discount.countDocuments({ enabled: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    discounts: discountsDB,
                    cantidad: conteo
                });
            });
        });

});

/*=================================================================================================================================*/
// Obtener un descuento por id
/*=================================================================================================================================*/
app.get('/discount/:id', (req, res) => {

    let id = req.params.id;

    Discount.findById(id)
        .exec((err, discountDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!discountDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }
            res.json({
                ok: true,
                discount: discountDB
            });
        });
});


/*=================================================================================================================================*/
// Crear un descuento
/*=================================================================================================================================*/
app.post('/discount', (req, res) => {

    let body = req.body;

    let discount = new Discount({
        type: body.type,
        description: body.description,
    });

    discount.save((err, discountDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            discount: discountDB
        });

    });
});

/*=================================================================================================================================*/
// Actualizar un descuento 
/*=================================================================================================================================*/
app.put('/discount/:id', function(req, res) {

    let id = req.params.id;
    let body = req.body;

    Discount.findByIdAndUpdate(id, body, { new: true }, (err, discountUpdated) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!discountUpdated) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Descuento no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            discount: discountUpdated
        });
    });
});


/*=================================================================================================================================*/
// Borrar un descuento
/*=================================================================================================================================*/
app.delete('/discount/:id', function(req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };

    Discount.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, discountDeleted) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!discountDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Descuento no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            discount: discountDeleted
        });
    });
});



module.exports = app;