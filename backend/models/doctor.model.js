const db = require('../config/db.config');

class Doctor {
    // Create a new doctor
    static async create(doctorData) {
        const sql = 'INSERT INTO doctors (name, specialization, email, phone, availability, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
        const params = [
            doctorData.name,
            doctorData.specialization,
            doctorData.email,
            doctorData.phone,
            doctorData.availability || 'Monday-Friday, 9AM-5PM'
        ];
        const [result] = await db.query(sql, params);
        return result.insertId;
    }

    // Get all doctors
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM doctors ORDER BY name');
        return rows;
    }

    // Get doctor by ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM doctors WHERE id = ?', [id]);
        return rows[0];
    }

    // Update doctor
    static async update(id, doctorData) {
        const sql = 'UPDATE doctors SET name = ?, specialization = ?, email = ?, phone = ?, availability = ? WHERE id = ?';
        const params = [
            doctorData.name,
            doctorData.specialization,
            doctorData.email,
            doctorData.phone,
            doctorData.availability,
            id
        ];
        const [result] = await db.query(sql, params);
        return result.affectedRows;
    }

    // Delete doctor
    static async delete(id) {
        const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Doctor;
