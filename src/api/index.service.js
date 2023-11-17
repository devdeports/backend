const { Router } = require("express");
const router = Router();

const generalController = require("../controllers/general.controller");

router.get('/', async (req, res) => {
    res.status(200).json({
        success: true,
        message: `bitacora `
    });
});

router.get('/db', async (req, res) => {
    const data = await generalController.getData();
    res.status(200).json({
        success: true,
        data
    });
});


router.get('/dbc', async (req, res) => {
    const data = await generalController.getDosdata();
    res.status(200).json({
        success: true,
        data
    });
});


module.exports = router;
