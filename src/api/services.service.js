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

router.post('/', [verifyTokenRole([1,2])], async (req, res) => {
    try {
        const data = req.body;
        const response = await servicesController.add(data);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when service created.'
        });
    }
});

router.delete('/', [verifyTokenRole([1,2])], async (req, res) => {
    const id = req.body.id;

    if(!id) return res.status(401).json({
        success: false,
        message: 'incomplete fields'
    });

    try {
        const response = await servicesController.del(id);

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


//// SERVICES CONTENT
router.get('/content/:id', [verifyTokenRole([1,2])], async (req, res) => {
    const id = req.params.id;

    try {
        const response = await servicesController.getServiceContent(id);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when service content listed.'
        });
    }
});

router.post('/content', [verifyTokenRole([1,2])], async (req, res) => {
    try {
        const data = req.body;
        const response = await servicesController.addServiceContent(data);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when content created.'
        });
    }
});

router.delete('/content', [verifyTokenRole([1,2])], async (req, res) => {
    const id = req.body.id;

    try {
        const response = await servicesController.deleteServiceContent(id);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when service content listed.'
        });
    }
});


//// TAGS
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
