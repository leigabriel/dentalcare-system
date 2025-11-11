const Appointment = require('../models/appointment.model');

// Create new appointment
exports.createAppointment = async (req, res) => {
  const { doctor_id, service_id, appointment_date, appointment_time, notes } = req.body;

  try {
    // Check if user already has 5 appointments on this date
    const appointmentCount = await Appointment.countByUserAndDate(req.userId, appointment_date);
    if (appointmentCount >= 5) {
      return res.status(400).send({ 
        message: 'You have reached the maximum limit of 5 appointments per day.' 
      });
    }

    // Check if the time slot is already booked
    const bookedSlots = await Appointment.getBookedSlots(doctor_id, appointment_date);
    if (bookedSlots.includes(appointment_time)) {
      return res.status(400).send({ 
        message: 'This time slot is already booked. Please select another time.' 
      });
    }

    const appointmentId = await Appointment.create({
      user_id: req.userId,
      doctor_id,
      service_id,
      appointment_date,
      appointment_time,
      payment_status: 'pending',
      status: 'pending',
      notes
    });

    res.status(201).send({ 
      message: 'Appointment booked successfully!', 
      appointmentId 
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get user's appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getByUserId(req.userId);
    res.status(200).send(appointments);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get all appointments (Admin/Staff only)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getAll();
    res.status(200).send(appointments);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).send({ message: 'Appointment not found.' });
    }

    // Users can only view their own appointments
    if (req.userRole === 'user' && appointment.user_id !== req.userId) {
      return res.status(403).send({ message: 'Access denied.' });
    }

    res.status(200).send(appointment);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get booked time slots for a doctor on a specific date
exports.getBookedSlots = async (req, res) => {
  const { doctor_id, date } = req.query;

  try {
    const bookedSlots = await Appointment.getBookedSlots(doctor_id, date);
    res.status(200).send({ bookedSlots });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Update appointment status (Admin/Staff only)
exports.updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const affectedRows = await Appointment.updateStatus(req.params.id, status);
    if (affectedRows === 0) {
      return res.status(404).send({ message: 'Appointment not found.' });
    }
    res.status(200).send({ message: 'Appointment status updated successfully!' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Cancel appointment (User can cancel their own, Admin/Staff can cancel any)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).send({ message: 'Appointment not found.' });
    }

    // Check if user has permission to cancel
    if (req.userRole === 'user' && appointment.user_id !== req.userId) {
      return res.status(403).send({ message: 'Access denied.' });
    }

    await Appointment.updateStatus(req.params.id, 'cancelled');
    res.status(200).send({ message: 'Appointment cancelled successfully!' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Update payment status (Admin/Staff only)
exports.updatePaymentStatus = async (req, res) => {
  const { payment_status, payment_reference } = req.body;

  try {
    const affectedRows = await Appointment.updatePaymentStatus(
      req.params.id, 
      payment_status, 
      payment_reference
    );
    
    if (affectedRows === 0) {
      return res.status(404).send({ message: 'Appointment not found.' });
    }
    
    res.status(200).send({ message: 'Payment status updated successfully!' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get appointments by month (Admin/Staff only)
exports.getAppointmentsByMonth = async (req, res) => {
  const { month, year } = req.query;

  try {
    const appointments = await Appointment.getByMonth(month, year);
    res.status(200).send(appointments);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Delete appointment (Admin only)
exports.deleteAppointment = async (req, res) => {
  try {
    const affectedRows = await Appointment.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).send({ message: 'Appointment not found.' });
    }
    res.status(200).send({ message: 'Appointment deleted successfully!' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
