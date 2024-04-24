const { Router } = require("express");
const router = Router();

// middleware
const verifyTokenRole = require("../middleware/verifyTokenRole");
const servicesController = require("../controllers/services.controller");


//// SERVICES
// list all srv
router.get('/', [verifyTokenRole([1,2])], async (req, res) => {
    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    let filters = { "IdRegion": [11001] };

    if(getFilters["id"] != undefined && getFilters["id"] > 0){
        filters = {...filters, ...{"IdService": getFilters["id"]} };
    }

    try {
        const response = await servicesController.getServices(filters);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when services listed.'
        });
    }
});

router.get('/details/:id', [verifyTokenRole([1,2])], async (req, res) => {
    const id = req.params.id;

    try {
        const response = await servicesController.getServiceDetail(id);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when services listed.'
        });
    }
});




//// TAGS
// list all tags
router.get('/tag', [verifyTokenRole([1,2])], async (req, res) => {
    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    let filters = {};

    if(getFilters["id"] != undefined && getFilters["id"] > 0){
        filters = {...filters, ...{"idTag": getFilters["id"]} };
    }

    try {
        const response = await servicesController.getTags(filters);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when tag listed.'
        });
    }
});

// add tag
router.post('/tag', [verifyTokenRole([1,2])], async (req, res) => {
    try {
        const data = req.body;
        const response = await servicesController.addTag(data);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when tag created.'
        });
    }
});

// delete tag
router.delete('/tag', [verifyTokenRole([1,2])], async (req, res) => {
    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    const { id } = getFilters;

    if(!id) return res.status(401).json({
        success: false,
        message: 'incomplete fields'
    });

    try {
        const response = await servicesController.delTag(id);

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
