const controller = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Authorization, Origin, Content-Type, Accept"
    );
    next();
  });

  // GET /api/admin/dashboard - Get dashboard statistics (admin only)
  app.get('/api/admin/dashboard', [verifyToken, isAdmin], controller.getDashboardStats);

  // GET /api/admin/users - Get all users (admin only)
  app.get('/api/admin/users', [verifyToken, isAdmin], controller.getAllUsers);

  // POST /api/admin/staff - Create admin/staff account (admin only)
  app.post('/api/admin/staff', [verifyToken, isAdmin], controller.createStaffAccount);

  // PUT /api/admin/users/:id/role - Update user role (admin only)
  app.put('/api/admin/users/:id/role', [verifyToken, isAdmin], controller.updateUserRole);

  // DELETE /api/admin/users/:id - Delete user (admin only)
  app.delete('/api/admin/users/:id', [verifyToken, isAdmin], controller.deleteUser);
};
