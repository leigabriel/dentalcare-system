const controller = require('../controllers/service.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    // GET /api/services - Get all services (public)
    app.get('/api/services', controller.getAllServices);

    // GET /api/services/:id - Get service by ID (public)
    app.get('/api/services/:id', controller.getServiceById);

    // POST /api/services - Create new service (admin only)
    app.post('/api/services', [verifyToken, isAdmin], controller.createService);

    // PUT /api/services/:id - Update service (admin only)
    app.put('/api/services/:id', [verifyToken, isAdmin], controller.updateService);

    // DELETE /api/services/:id - Delete service (admin only)
    app.delete('/api/services/:id', [verifyToken, isAdmin], controller.deleteService);
};