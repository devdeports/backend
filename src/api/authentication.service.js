const { Router } = require("express");
const router = Router();

// middleware
const verifyTokenRole = require("../middleware/verifyTokenRole");
// controller
const authController = require("../controllers/auth.controller");

// validate access to route
router.post('/testerRoles', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "pasa"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when obtaining the data.',
            error: error
        });
    }
});


// endpoint auth user - authenticate
router.post('/signin', async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        const data = { username, password };
        const response = await authController.getToken(data);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            token: response.token
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when obtaining the data.',
            error: error
        });
    }
});


// verificar token
router.post('/checkToken', async (req, res) => {
    const token = req.body.token || req.headers.token;

    // token does not exist
    if(token === undefined || token.trim() == "") return res.status(401).json({
        success: false,
        message: 'No token in request.'
    });

    try {
        const data = await authController.checkToken(token);
        res.status(data.status).json({ 
            success: data.success,
            message: data.message,
            token: data.token
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'token error.',
            error
        });
    }
});


module.exports = router;
