import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import doctorService from '../services/doctor.service';
import serviceService from '../services/service.service';
import appointmentService from '../services/appointment.service';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDoctorsAndServices();
  }, []);

  useEffect(() => {
    if (selectedDoctor && date) {
      loadBookedSlots();
    }
  }, [selectedDoctor, date]);

  const loadDoctorsAndServices = async () => {
    try {
      const [doctorsData, servicesData] = await Promise.all([
        doctorService.getAll(),
        serviceService.getAll()
      ]);
      setDoctors(doctorsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading doctors and services');
    }
  };

  const loadBookedSlots = async () => {
    try {
      const { bookedSlots } = await appointmentService.getBookedSlots(selectedDoctor, date);
      setBookedSlots(bookedSlots);
    } catch (error) {
      console.error('Error loading booked slots:', error);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await appointmentService.create({
        doctor_id: selectedDoctor,
        service_id: selectedService,
        appointment_date: date,
        appointment_time: time,
        notes
      });
      setMessage('Appointment booked successfully!');
      // Reset form
      setSelectedDoctor('');
      setSelectedService('');
      setDate('');
      setTime('');
      setNotes('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = generateTimeSlots();
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>

          {message && (
            <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {/* Select Doctor */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Service */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Service</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Choose a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.duration_mins} mins)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            {/* Select Time */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={!selectedDoctor || !date}
              >
                <option value="">Choose a time...</option>
                {timeSlots.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                    disabled={bookedSlots.includes(slot)}
                  >
                    {slot.substring(0, 5)} {bookedSlots.includes(slot) ? '(Booked)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method - Auto-set to clinic */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <input
                type="text"
                value="Pay at Clinic"
                readOnly
                className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">All payments are made at the clinic</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                placeholder="Any special requests or concerns..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default BookAppointment;
