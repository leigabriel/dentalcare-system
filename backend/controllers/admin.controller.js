const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const Service = require('../models/service.model');
const bcrypt = require('bcryptjs');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const db = require('../config/db.config');
    
    // Get counts
    const [users] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [staff] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'staff'");
    const [admins] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const [appointments] = await db.query("SELECT COUNT(*) as count FROM appointments");
    const [doctors] = await db.query("SELECT COUNT(*) as count FROM doctors");
    const [services] = await db.query("SELECT COUNT(*) as count FROM services");
    const [pendingAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'");
    const [confirmedAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'confirmed'");

    res.status(200).send({
      totalUsers: users[0].count,
      totalStaff: staff[0].count,
      totalAdmins: admins[0].count,
      totalAppointments: appointments[0].count,
      totalDoctors: doctors[0].count,
      totalServices: services[0].count,
      pendingAppointments: pendingAppointments[0].count,
      confirmedAppointments: confirmedAppointments[0].count
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const db = require('../config/db.config');
    const [users] = await db.query('SELECT id, first_name, last_name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Create admin or staff account
exports.createStaffAccount = async (req, res) => {
  const { first_name, last_name, email, password, phone, role } = req.body;

  // Validate role
  if (role !== 'admin' && role !== 'staff') {
    return res.status(400).send({ message: 'Invalid role. Must be admin or staff.' });
  }

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
      role
    });

    res.status(201).send({ message: `${role} account created successfully!`, userId });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;

  // Validate role
  if (!['user', 'staff', 'admin'].includes(role)) {
    return res.status(400).send({ message: 'Invalid role.' });
  }

  try {
    const db = require('../config/db.config');
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'User not found.' });
    }

    res.status(200).send({ message: 'User role updated successfully!' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const affectedRows = await User.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).send({ message: 'User not found.' });
    }
    res.status(200).send({ message: 'User deleted successfully!' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
