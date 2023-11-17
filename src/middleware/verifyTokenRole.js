const jwt = require('jsonwebtoken');
const configFile = require("../config-apps.json");

module.exports = (roles) => {
    return function (req, res, next) {
        const token = req.body.token || req.headers.token;

        if(token === undefined || token.trim() == "") return res.status(401).json({
            success: false,
            message: 'No token in request.'
        });

        try {
            // check Token
            const decoded = jwt.verify(token, "PUBLIC");

            // check role
            if(roles.includes(decoded.userApp.rol) === false) {
                return res.status(401).json({ 
                    success: false,
                    message: "Not Authorized to access this route"
                });
            }

            //req.body.rol = decoded.userApp.rol;
            req.body.userId = decoded.userApp.id.toString();
            next();

        } catch(err) {
            return res.status(401).json({ 
                success: false,
                message: "error checking token",
                description: `${err.name} - ${err.message}`
            });
        }
    }
};
