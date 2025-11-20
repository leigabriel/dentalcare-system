const controller = require('../controllers/doctor.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    // GET /api/doctors - Get all doctors (public)
    app.get('/api/doctors', controller.getAllDoctors);

    // GET /api/doctors/:id - Get doctor by ID (public)
    app.get('/api/doctors/:id', controller.getDoctorById);

    // POST /api/doctors - Create new doctor (admin only)
    app.post('/api/doctors', [verifyToken, isAdmin], controller.createDoctor);

    // PUT /api/doctors/:id - Update doctor (admin only)
    app.put('/api/doctors/:id', [verifyToken, isAdmin], controller.updateDoctor);

    // DELETE /api/doctors/:id - Delete doctor (admin only)
    app.delete('/api/doctors/:id', [verifyToken, isAdmin], controller.deleteDoctor);
};
