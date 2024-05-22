const { Router } = require("express");
const router = Router();

// middleware
const verifyTokenRole = require("../middleware/verifyTokenRole");
const coursesController = require("../controllers/courses.controller");


//// COURSES
// list all crs
router.get('/', [verifyTokenRole([1,2])], async (req, res) => {
    let filters = { "IdRegion": [11001] };

    try {
        const response = await coursesController.getCourses(filters);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when courses listed.'
        });
    }
});

router.get('/details/:id', [verifyTokenRole([1,2])], async (req, res) => {
    const id = req.params.id;

    try {
        const response = await coursesController.getCourseDetail(id);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when courses listed.'
        });
    }
});


module.exports = router;
