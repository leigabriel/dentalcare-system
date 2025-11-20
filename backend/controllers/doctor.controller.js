const Doctor = require('../models/doctor.model');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.getAll();
        res.status(200).send(doctors);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).send({ message: 'Doctor not found.' });
        }
        res.status(200).send(doctor);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Create new doctor (Admin only)
exports.createDoctor = async (req, res) => {
    const { name, specialization, email, phone, availability } = req.body;

    try {
        const doctorId = await Doctor.create({
            name,
            specialization,
            email,
            phone,
            availability
        });
        res.status(201).send({ message: 'Doctor created successfully!', doctorId });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update doctor (Admin only)
exports.updateDoctor = async (req, res) => {
    const { name, specialization, email, phone, availability } = req.body;

    try {
        const affectedRows = await Doctor.update(req.params.id, {
            name,
            specialization,
            email,
            phone,
            availability
        });

        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Doctor not found.' });
        }

        res.status(200).send({ message: 'Doctor updated successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Delete doctor (Admin only)
exports.deleteDoctor = async (req, res) => {
    try {
        const affectedRows = await Doctor.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Doctor not found.' });
        }
        res.status(200).send({ message: 'Doctor deleted successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
