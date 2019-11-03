/*=================================================================================================================================*/
// Require
/*=================================================================================================================================*/
const jwt = require('jsonwebtoken');

/*=================================================================================================================================*/
// Middleware para Verificar Token
/*=================================================================================================================================*/
let verificaToken = (req, res, next) => {

    let token = req.get('token'); //para extraer el token de los headers

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }


        // agrega la propiedad usuario a la petición
        req.user = decoded.user;

        next();

    });

};

/*=================================================================================================================================*/
// Middleware para Verificar Rol de ADMINISTRADOR
/*=================================================================================================================================*/
verificaAdmin_Role = (req, res, next) => {

    let user = req.user;

    if (user.role !== 'ADMIN_ROLE') {

        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no tiene los permisos necesarios'
            }
        });
    }

    next();

};


/*=================================================================================================================================*/
// Middleware para Verificar Rol de ADMINISTRADOR Y CHOFER
/*=================================================================================================================================*/
verificaAdmin_Seller_Role = (req, res, next) => {

    let user = req.user;

    if (user.role !== 'ADMIN_ROLE' || user.role !== 'SELLER_ROLE') {

        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no tiene los permisos'
            }
        });
    }

    next();

};

/*=================================================================================================================================*/
// Middleware para Verificar Roles de ADMINISTRADOR y RECEPCIONISTA
/*=================================================================================================================================*/
verificaAdmin_Recep_Role = (req, res, next) => {

    let user = req.user;

    if (user.role !== 'ADMIN_ROLE' && user.role !== 'RECEPCIONIST_ROLE') {

        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no tiene los permisos'
            }
        });
    };

    next();

};

/*=================================================================================================================================*/
// Exportación de middlewares
/*=================================================================================================================================*/

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaAdmin_Recep_Role,
    verificaAdmin_Seller_Role
}