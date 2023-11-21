const { Router } = require("express");
const router = Router();
const configFile = require("../config-apps.json");

// middleware
const verifyTokenRole = require("../middleware/verifyTokenRole");
const usersController = require("../controllers/users.controller");

//// USERS
// new user
router.post('/', [verifyTokenRole([1,2])], async (req, res) => {
    try {
        const data = req.body;
        const response = await usersController.addUser(data);

        if(response.success == true){
            await usersController.addRol(data.idUser, configFile.default.rol);
            await usersController.addPassword(data.idUser, data.idUser);
        }

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when user created.'
        });
    }
});

// edit user
router.put('/', [verifyTokenRole([1,2])], async (req, res) => {
    try {
        const data = req.body;
        const response = await usersController.editUser(data);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when user edited.'
        });
    }
});

// list all users
router.get('/', [verifyTokenRole([1,2])], async (req, res) => {
    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    let filters = {};

    if(getFilters["id"] != undefined && getFilters["id"] > 0){
        filters = {...filters, ...{"U.id": getFilters["id"]} };
    }

    if(getFilters["idUser"] != undefined && getFilters["idUser"] > 0){
        filters = {...filters, ...{"U.idUser": getFilters["idUser"]} };
    }

    if(getFilters["userType"] != undefined && getFilters["userType"] > 0){
        filters = {...filters, ...{"U.userType": getFilters["userType"]} };
    }

    if(getFilters["idRegion"] != undefined && getFilters["idRegion"] > 0){
        filters = {...filters, ...{"U.idRegion": getFilters["idRegion"]} };
    }

    if(getFilters["isActive"] != undefined){
        filters = {...filters, ...{"U.isActive": getFilters["isActive"]} };
    }

    try {
        const response = await usersController.getUsers(filters);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when user listed.'
        });
    }
});


//// ROLS
// list all rols
router.get('/rols', [verifyTokenRole([1,2])], async (req, res) => {
    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    let filters = (getFilters["id"] != undefined && getFilters["id"] > 0)
                ? {"idRole": getFilters["id"]}
                : {};

    try {
        const response = await usersController.getRols(filters);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when rols listed.'
        });
    }
});

// add role
router.post('/rols', [verifyTokenRole([1,2])], async (req, res) => {
    try {
        const { role } = req.body;
        
        if(!role) return res.status(401).json({
            success: false,
            message: `incomplete fields`
        });

        const response = await usersController.addRols(role);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when user created.'
        });
    }
});

// list all rols
router.get('/rolItem', [verifyTokenRole([1,2])], async (req, res) => {
    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    const { id } = getFilters;

    if(!id) return res.status(401).json({
        success: false,
        message: 'incomplete fields'
    });

    try {
        const response = await usersController.getRolItems(id);
        const menus = await usersController.getMenus();

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data,
            menus: menus.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when rols listed.'
        });
    }
});

router.post('/rolItem', [verifyTokenRole([1,2])], async (req, res) => {
    try {
        const response = await usersController.addRolItems(req.body);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when rols add.'
        });
    }
});

router.delete('/rolItem', [verifyTokenRole([1,2])], async (req, res) => {
    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    const { id } = getFilters;

    if(!id) return res.status(401).json({
        success: false,
        message: 'incomplete fields'
    });

    try {
        const response = await usersController.delRolItems(id);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when rols add.'
        });
    }
});

module.exports = router;
