const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Register new user
exports.register = async (req, res) => {
    const { first_name, last_name, email, password, phone } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).send({ message: 'Failed! Email is already in use.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            phone,
            role: 'user'
        });

        res.status(201).send({ message: 'User registered successfully!', userId });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        // Verify password
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({
                message: 'Invalid Password!'
            });
        }

        // Send user data (no token needed)
        res.status(200).send({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            role: user.role
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    const { first_name, last_name, phone } = req.body;

    try {
        await User.update(req.userId, { first_name, last_name, phone });
        res.status(200).send({ message: 'Profile updated successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};