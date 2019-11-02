const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const User = require('../models/user');

const { verificaToken, verificaAdmin_Recep_Role } = require('../middlewares/autenticacion');

app.get('/user', function(req, res) {

    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    limite = Number(limite);

    User.find({ enabled: enabled }, 'name surname email role enabled img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            User.countDocuments({ enabled: enabled }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cantidad: conteo
                });
            });
        });
});

app.get('/user/:id', (req, res) => {

    let id = req.params.id;

    User.findById(id)
        .exec((err, userDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!userDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }
            res.json({
                ok: true,
                user: userDB
            });
        });
});

app.post('/user', function(req, res) {

    let body = req.body;

    let user = new User({
        name: body.name,
        surname: body.surname,
        email: body.email,
        img: body.img,
        password: bcrypt.hashSync(body.password, 10), //lo sincronizamos de manera sincrona (sin usar callbacks ni promesas) y el segundo parametro
        role: body.role,
        enabled: body.enabled //corresponde al número de veces que se le hara hash                   
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            user: userDB
        });
    });
});

app.put('/user/:id', function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'surname', 'img', 'role', 'enabled']);

    //runValidators permite que las validaciones del Schema Usuario sean validas
    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            user: userDB
        });
    });
});

app.delete('/user/:id', function(req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        enabled: false
    };

    User.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            user: usuarioBorrado
        });
    });
});

app.get('/user_role', function(req, res) {

    let desde = Number(req.query.desde) || 0;
    let limite = req.query.limite || 5;
    let enabled = req.query.habilitado || true;
    let role = req.query.rol || 'SELLER_ROLE';
    limite = Number(limite);

    User.find({ enabled: enabled, role: role }, 'name surname email role enabled img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            User.countDocuments({ enabled: enabled, role: role }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cantidad: conteo
                });
            });
        });
});

module.exports = app;