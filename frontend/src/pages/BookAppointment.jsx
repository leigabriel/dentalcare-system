import { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import doctorService from '../services/doctor.service';
import serviceService from '../services/service.service';
import appointmentService from '../services/appointment.service';
import { FaCheck, FaCreditCard, FaMoneyBillWave, FaHospital, FaTooth } from 'react-icons/fa';

const BookAppointment = () => {
  const { user, logout } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('clinic');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Scroll refs
  const serviceScrollRef = useRef(null);
  const doctorScrollRef = useRef(null);

  // Redirect if admin or staff
  if (user && (user.role === 'admin' || user.role === 'staff')) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} replace />;
  }

  useEffect(() => {
    loadDoctorsAndServices();
  }, []);

  useEffect(() => {
    if (selectedDoctor && date) {
      loadBookedSlots();
    } else {
      setBookedSlots([]);
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
      setMessage({ type: 'error', text: 'Error loading doctors and services' });
    }
  };

  const loadBookedSlots = async () => {
    try {
      const { bookedSlots } = await appointmentService.getBookedSlots(selectedDoctor, date);
      setBookedSlots(bookedSlots || []);
    } catch (error) {
      console.error('Error loading booked slots:', error);
      setBookedSlots([]);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00:00`);
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await appointmentService.create({
        doctor_id: selectedDoctor,
        service_id: selectedService,
        appointment_date: date,
        appointment_time: time,
        payment_method: paymentMethod,
        notes
      });
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      // Reset form
      setSelectedDoctor('');
      setSelectedService('');
      setDate('');
      setTime('');
      setNotes('');
      setPaymentMethod('clinic');
      setSelectedDate(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error booking appointment' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const scroll = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selected < today) return;
    
    setSelectedDate(selected);
    setDate(formatDateForInput(selected));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isPastDate = (day) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && 
           currentMonth.getMonth() === selectedDate.getMonth() && 
           currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const changeMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const getServiceDetails = () => {
    const service = services.find(s => s.id === Number(selectedService));
    return service || null;
  };

  const getDoctorDetails = () => {
    const doctor = doctors.find(d => d.id === Number(selectedDoctor));
    return doctor || null;
  };

  const calculateEndTime = () => {
    if (!time || !selectedService) return '—';
    const service = getServiceDetails();
    if (!service) return '—';
    
    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + service.duration_mins;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    const period = endHours >= 12 ? 'PM' : 'AM';
    const displayHours = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
    
    return `${displayHours}:${String(endMins).padStart(2, '0')} ${period}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const isFormValid = () => {
    return selectedService && selectedDoctor && date && time && paymentMethod;
  };

  const getStepClass = (step) => {
    const baseClass = 'bg-blue-900/40 rounded-lg px-4 py-3 border text-center relative';
    
    if (step === 1) {
      return `${baseClass} ${selectedService ? 'border-green-500 bg-green-500/20' : 'border-indigo-500 bg-indigo-500/20'}`;
    }
    if (step === 2) {
      return `${baseClass} ${selectedDoctor ? 'border-green-500 bg-green-500/20' : selectedService ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10'}`;
    }
    if (step === 3) {
      return `${baseClass} ${date ? 'border-green-500 bg-green-500/20' : (selectedService && selectedDoctor) ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10'}`;
    }
    if (step === 4) {
      return `${baseClass} ${time ? 'border-green-500 bg-green-500/20' : (selectedService && selectedDoctor && date) ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10'}`;
    }
    if (step === 5) {
      return `${baseClass} ${isFormValid() ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10'}`;
    }
    return `${baseClass} border-white/10`;
  };

  const timeSlots = generateTimeSlots();
  const minDate = new Date().toISOString().split('T')[0];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const serviceDetails = getServiceDetails();
  const doctorDetails = getDoctorDetails();

  return (
    <div className="min-h-screen bg-blue-950">
      {/* Fixed Header Navigation - Same as UserLanding */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <nav aria-label="Global" className="flex items-center justify-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full shadow-xl">
          <div className="flex lg:flex-1">
            <Link to="/landing" className="-m-1.5 p-1.5">
              <span className="sr-only">DENTALCARE</span>
              <FaTooth className="h-6 w-auto text-white" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="size-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-12">
            <Link to="/landing" className="text-lg/6 font-semibold text-white hover:text-blue-400">Home</Link>
            <a href="/landing#services" className="text-lg/6 font-semibold text-white hover:text-blue-400">Services</a>
            <a href="/landing#about" className="text-lg/6 font-semibold text-white hover:text-blue-400">About</a>
            <a href="/landing#blog" className="text-lg/6 font-semibold text-white hover:text-blue-400">Blog</a>
            <a href="/landing#contact" className="text-lg/6 font-semibold text-white hover:text-blue-400">Contact</a>
            <Link to="/book" className="text-lg/6 font-semibold text-blue-400 border-b-2 border-blue-400">Book Now</Link>
          </div>

          {/* User Profile & Logout */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end relative gap-x-3 items-center whitespace-nowrap">
            <div className="group relative">
              <Link to="/profile" className="flex items-center gap-x-2 text-lg/6 uppercase font-semibold text-white hover:text-blue-400">
                <img src="https://cdn-icons-png.flaticon.com/128/5393/5393061.png" alt="Profile" className="h-6 w-6 rounded-full object-cover invert" />
              </Link>
              <div className="absolute mt-2 w-28 bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                <Link to="/profile" className="block px-4 py-2 text-white hover:bg-gray-700 rounded-t-lg">Profile</Link>
                <button onClick={() => setShowLogoutModal(true)} className="w-full text-left px-4 py-2 text-white hover:bg-red-700 rounded-b-lg">Log out</button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-blue-950 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
              <div className="flex items-center justify-between">
                <Link to="/landing" className="-m-1.5 p-1.5">
                  <span className="sr-only">DENTALCARE</span>
                  <FaTooth className="h-8 w-auto text-white" />
                </Link>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 text-gray-200">
                  <span className="sr-only">Close menu</span>
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-white/10">
                  <div className="space-y-2 py-6">
                    <Link to="/landing" className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                    <a href="/landing#services" className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>Services</a>
                    <a href="/landing#about" className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>About</a>
                    <a href="/landing#blog" className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>Blog</a>
                    <a href="/landing#contact" className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                    <Link to="/book" className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-blue-400 bg-white/5" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
                  </div>
                  <div className="py-6">
                    <Link to="/profile" className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>Profile ({user?.first_name})</Link>
                    <button onClick={() => { setShowLogoutModal(true); setMobileMenuOpen(false); }} className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5 w-full text-left">Log out</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Book Your Appointment
            </h1>
            <p className="text-gray-300 text-lg">Follow the steps below to schedule your visit</p>
          </div>

          {/* Progress Stepper */}
          <div className="mb-12">
            <div className="grid grid-cols-5 gap-4">
              <div className={getStepClass(1)}>
                {selectedService && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    <FaCheck />
                  </span>
                )}
                <div className="text-white font-semibold mb-1">Step 1</div>
                <div className="text-white/80 text-sm">Choose Service</div>
              </div>
              <div className={getStepClass(2)}>
                {selectedDoctor && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    <FaCheck />
                  </span>
                )}
                <div className="text-white font-semibold mb-1">Step 2</div>
                <div className="text-white/80 text-sm">Select Doctor</div>
              </div>
              <div className={getStepClass(3)}>
                {date && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    <FaCheck />
                  </span>
                )}
                <div className="text-white font-semibold mb-1">Step 3</div>
                <div className="text-white/80 text-sm">Pick Date</div>
              </div>
              <div className={getStepClass(4)}>
                {time && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    <FaCheck />
                  </span>
                )}
                <div className="text-white font-semibold mb-1">Step 4</div>
                <div className="text-white/80 text-sm">Choose Time</div>
              </div>
              <div className={getStepClass(5)}>
                <div className="text-white font-semibold mb-1">Step 5</div>
                <div className="text-white/80 text-sm">Confirm & Pay</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service Selection */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3">1</span>
                Select Service
              </h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => scroll(serviceScrollRef, 'left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center -ml-5"
                >
                  ←
                </button>
                <div
                  ref={serviceScrollRef}
                  className="flex gap-4 overflow-x-auto scroll-smooth px-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`flex-shrink-0 w-64 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 relative ${
                        selectedService === service.id
                          ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      {selectedService === service.id && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          <FaCheck />
                        </div>
                      )}
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <span className="text-indigo-600 font-bold text-lg">₱{service.price}</span>
                        <span className="text-gray-500 text-sm">{service.duration_mins} mins</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scroll(serviceScrollRef, 'right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center -mr-5"
                >
                  →
                </button>
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3">2</span>
                Select Doctor
              </h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => scroll(doctorScrollRef, 'left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center -ml-5"
                >
                  ←
                </button>
                <div
                  ref={doctorScrollRef}
                  className="flex gap-4 overflow-x-auto scroll-smooth px-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor.id)}
                      className={`flex-shrink-0 w-64 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 relative ${
                        selectedDoctor === doctor.id
                          ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      {selectedDoctor === doctor.id && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          <FaCheck />
                        </div>
                      )}
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                          {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">Dr. {doctor.first_name} {doctor.last_name}</h3>
                        <p className="text-indigo-600 text-sm font-medium">{doctor.specialization}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scroll(doctorScrollRef, 'right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center -mr-5"
                >
                  →
                </button>
              </div>
            </div>

            {/* Date Selection with Calendar */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3">3</span>
                Pick a Date
              </h2>
              <div className="max-w-md mx-auto">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    ← Previous
                  </button>
                  <h3 className="text-xl font-bold text-gray-800">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Next →
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for days before month starts */}
                    {[...Array(firstDayOfMonth)].map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square" />
                    ))}
                    
                    {/* Actual days */}
                    {[...Array(daysInMonth)].map((_, index) => {
                      const day = index + 1;
                      const past = isPastDate(day);
                      const today = isToday(day);
                      const selected = isSelected(day);
                      
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => !past && handleDateSelect(day)}
                          disabled={past}
                          className={`aspect-square rounded-lg font-semibold transition-all duration-200 ${
                            past
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : selected
                              ? 'bg-green-500 text-white shadow-lg transform scale-110'
                              : today
                              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500 hover:bg-indigo-200'
                              : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3">4</span>
                Choose Time Slot
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {timeSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = time === slot;
                  
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => !isBooked && setTime(slot)}
                      disabled={isBooked || !date}
                      className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                        isBooked
                          ? 'bg-red-100 text-red-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-green-500 text-white shadow-lg transform scale-105'
                          : !date
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md'
                      }`}
                    >
                      {formatTime(slot)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3">5</span>
                Payment Method
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gcash')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 relative ${
                    paymentMethod === 'gcash'
                      ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  {paymentMethod === 'gcash' && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      <FaCheck />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-4xl mb-3 flex justify-center">
                      <FaCreditCard />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">GCash</h3>
                    <p className="text-sm text-gray-600 mt-2">Online Payment</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 relative ${
                    paymentMethod === 'paypal'
                      ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  {paymentMethod === 'paypal' && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      <FaCheck />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-4xl mb-3 flex justify-center">
                      <FaMoneyBillWave />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">PayPal</h3>
                    <p className="text-sm text-gray-600 mt-2">Online Payment</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('clinic')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 relative ${
                    paymentMethod === 'clinic'
                      ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  {paymentMethod === 'clinic' && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      <FaCheck />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-4xl mb-3 flex justify-center">
                      <FaHospital />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">At Clinic</h3>
                    <p className="text-sm text-gray-600 mt-2">Pay on Visit</p>
                  </div>
                </button>
              </div>

              {/* Payment Instructions */}
              {paymentMethod === 'gcash' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">GCash Payment Instructions:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Send payment to: <strong>09XX-XXX-XXXX</strong></li>
                    <li>Use the reference number shown in your appointment</li>
                    <li>Screenshot the payment confirmation</li>
                    <li>Upload proof of payment in your profile</li>
                  </ol>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">PayPal Payment Instructions:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Send payment to: <strong>dentalclinic@example.com</strong></li>
                    <li>Include appointment reference in notes</li>
                    <li>Screenshot the payment confirmation</li>
                    <li>Upload proof of payment in your profile</li>
                  </ol>
                </div>
              )}

              {paymentMethod === 'clinic' && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <h4 className="font-bold text-green-900 mb-2">Clinic Payment Instructions:</h4>
                  <p className="text-sm text-green-800">
                    You can pay in cash when you arrive at the clinic. Please arrive 10 minutes early for payment processing.
                  </p>
                </div>
              )}
            </div>

            {/* Appointment Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Appointment Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-white/80">Service:</span>
                  <span className="font-bold">{serviceDetails ? serviceDetails.name : '—'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-white/80">Doctor:</span>
                  <span className="font-bold">
                    {doctorDetails ? `Dr. ${doctorDetails.first_name} ${doctorDetails.last_name}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-white/80">Date:</span>
                  <span className="font-bold">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-white/80">Time:</span>
                  <span className="font-bold">{time ? `${formatTime(time)} - ${calculateEndTime()}` : '—'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-white/80">Duration:</span>
                  <span className="font-bold">{serviceDetails ? `${serviceDetails.duration_mins} minutes` : '—'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-white/80">Payment Method:</span>
                  <span className="font-bold uppercase">{paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-xl font-bold">Total Amount:</span>
                  <span className="text-3xl font-bold">₱{serviceDetails ? serviceDetails.price : '0'}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-indigo-100">
              <label className="block text-gray-700 font-semibold mb-3">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Any special requests or medical information we should know..."
              />
            </div>

            {/* Message Display */}
            {message.text && (
              <div
                className={`p-4 rounded-xl font-medium ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border-2 border-green-200'
                    : 'bg-red-50 text-red-700 border-2 border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedService('');
                  setSelectedDoctor('');
                  setDate('');
                  setTime('');
                  setNotes('');
                  setPaymentMethod('clinic');
                  setSelectedDate(null);
                  setMessage({ type: '', text: '' });
                }}
                className="flex-1 py-4 px-8 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all duration-200"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg text-white transition-all duration-200 ${
                  loading || !isFormValid()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-2xl hover:scale-105'
                }`}
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer - Same as UserLanding */}
      <footer className="bg-[#212631]/40 rounded-t-4xl border-t border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-gray-200/10 pb-10">
            <div className="space-y-4">
              <h3 className="text-4xl font-bold text-white">DENTALCARE</h3>
              <p className="text-sm text-gray-300">Committed to providing personalized and high-quality dental care in a comfortable and welcoming environment.</p>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.717 21 3 14.283 3 6V5z"></path>
                </svg>
                <span className="font-mono">0963-405-5941</span>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/landing#about" className="text-gray-300 hover:text-white transition">About Us</Link></li>
                <li><Link to="/landing#services" className="text-gray-300 hover:text-white transition">Our Services</Link></li>
                <li><Link to="/landing#contact" className="text-gray-300 hover:text-white transition">Find Us</Link></li>
                <li><Link to="/book" className="text-gray-300 hover:text-white transition">Book</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Patient Center</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/book" className="text-gray-300 hover:text-white transition">Book Appointment</Link></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition">Patient Login</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">FAQs</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Location & Hours</h4>
              <address className="space-y-3 text-sm not-italic">
                <p className="text-gray-300">Naujan, Oriental Mindoro, 5204</p>
                <p className="text-gray-300">Mon - Fri: 8:00 AM - 5:00 PM</p>
                <p className="text-gray-300">Sat: 8:00 AM - 21:00 PM</p>
              </address>
            </div>
          </div>

          <div className="mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
            <p>&copy; {new Date().getFullYear()} DENTALCARE. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition">
                <img src="https://cdn-icons-png.flaticon.com/128/174/174855.png" alt="Instagram" className="w-6 h-6 rounded-md" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition">
                <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" className="w-6 h-6 rounded-md" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition">
                <img src="https://cdn-icons-png.flaticon.com/128/5968/5968830.png" alt="Twitter" className="w-6 h-6 rounded-md invert" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-96 h-64 border-2 border-white duration-500 group overflow-hidden rounded-xl bg-neutral-900 text-neutral-50 p-6 flex flex-col justify-evenly shadow-xl">
            <div className="absolute blur duration-500 group-hover:blur-none w-72 h-72 rounded-full group-hover:translate-x-10 group-hover:translate-y-10 bg-red-900 right-1 -bottom-24"></div>
            <div className="absolute blur duration-500 group-hover:blur-none w-12 h-12 rounded-full group-hover:translate-x-8 group-hover:translate-y-2 bg-rose-700 right-12 bottom-12"></div>
            <div className="absolute blur duration-500 group-hover:blur-none w-36 h-36 rounded-full group-hover:translate-x-10 group-hover:-translate-y-10 bg-rose-800 right-1 -top-12"></div>
            <div className="absolute blur duration-500 group-hover:blur-none w-24 h-24 bg-red-700 rounded-full group-hover:-translate-x-10"></div>

            <div className="z-10 flex flex-col justify-evenly h-full text-center">
              <h3 className="text-2xl font-bold mb-1">Confirm Logout</h3>
              <p className="text-sm text-gray-300 mb-4">Are you sure you want to end your current session?</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => setShowLogoutModal(false)} className="hover:bg-neutral-200 cursor-pointer bg-neutral-50 rounded text-neutral-800 font-semibold w-full sm:w-1/2 py-2 transition">Cancel</button>
                <button onClick={handleLogout} className="bg-red-600 cursor-pointer hover:bg-red-500 text-white rounded font-semibold w-full sm:w-1/2 py-2 transition">Log Out</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookAppointment;
