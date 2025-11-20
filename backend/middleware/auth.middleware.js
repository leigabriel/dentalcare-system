// Verify user ID from request body/headers
const verifyToken = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.body.userId;
    const userRole = req.headers['x-user-role'] || req.body.userRole;

    if (!userId) {
        return res.status(403).send({ message: 'No user ID provided!' });
    }

    req.userId = parseInt(userId);
    req.userRole = userRole;
    next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).send({ message: 'Require Admin Role!' });
    }
    next();
};

// Check if user is admin or staff
const isAdminOrStaff = (req, res, next) => {
    if (req.userRole !== 'admin' && req.userRole !== 'staff') {
        return res.status(403).send({ message: 'Require Admin or Staff Role!' });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isAdminOrStaff
};
