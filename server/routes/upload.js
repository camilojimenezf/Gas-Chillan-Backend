const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const User = require('../models/user');

const fs = require('fs');
const path = require('path');

app.use(fileUpload({useTempFiles:true}));

app.get('/imagen/user/:img', (req, res)=>{

    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/users/${img}`);
    let noImagePath= path.resolve(__dirname,'../assets/no-image.jpg');

    if( fs.existsSync(pathImagen)){
        res.sendFile(pathImagen);
    }else{
        res.sendFile(noImagePath);
    }

});

app.put('/upload/user/:id', function(req, res) {

    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok:false,
            err:{
                message:'No se ha seleccionado ningún archivo'
            }
        });
    }


    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones permitidas
    let extensionesValidas=['png','jpg','gif','jpeg'];

    if( extensionesValidas.indexOf( extension ) < 0 ){
        return res.status(400).json({
            ok:false,
            err:{
                message:'Las extensiones permitidas son: '+ extensionesValidas.join(', '),
                ext: extension
            }
        })
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extension}`;

    archivo.mv(`uploads/users/${nombreArchivo}`, (err)=> {
        if (err){
          return res.status(500).json({
              ok:false,
              err
          });
        }
        //Aqui la imagen ya esta cargada 
        imagenUsuario(id,res, nombreArchivo);
    });
});

function imagenUsuario(id, res, nombreArchivo){

    User.findById(id, (err, userDB)=>{
        if(err){

            borrarArchivo(nombreArchivo,'usuarios');

            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!userDB){

            borrarArchivo(nombreArchivo);

            return res.status(400).json({
                ok:false,
                err:{
                    message: 'Usuario no existe'
                }
            });
        }

        //Eliminamos una imagen anterior asociada al usuario (si es que existe)
        borrarArchivo(userDB.img);

        userDB.img=nombreArchivo;

        userDB.save( (err,usuarioGuardado)=>{

            res.json({
                ok:true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })

        });

    })

}


function borrarArchivo(nombreImagen){
    let pathImagen = path.resolve(__dirname, `../../uploads/users/${nombreImagen}`);
    if( fs.existsSync(pathImagen) ){
        fs.unlinkSync(pathImagen);
    }
}

module.exports=app;