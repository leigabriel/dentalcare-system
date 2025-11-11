# 🦷 DentalCare Appointment Booking System

A modern, full-stack dental clinic management system built with **Node.js/Express** backend and **React** frontend. This project is inspired by the PHP-based dental booking system but rebuilt using the MERN stack (MongoDB alternative: MySQL).

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## ✨ Features

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- Role-based access control (User, Staff, Admin)
- User registration and login
- Profile management

### 📅 Appointment Booking System
- Real-time appointment booking
- Doctor and service selection
- Time slot availability checking
- Prevent double-bookings
- Daily booking limits (5 appointments per day per user)
- Appointment history

### 👨‍⚕️ Doctor Management (Admin)
- CRUD operations for doctors
- Doctor profiles with specialization
- Availability management

### 🦷 Service Management (Admin)
- CRUD operations for dental services
- Service details (name, description, price, duration)
- Service catalog

### 📊 Admin Dashboard
- Statistics overview
- User management
- Appointment management
- Create staff/admin accounts
- Payment monitoring

### 👥 Staff Dashboard
- Appointment monitoring
- Confirm/cancel appointments
- View patient list

### 💰 Payment Processing (Ready for integration)
- Multiple payment methods support
- Payment status tracking
- Payment references

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **mysql2** - MySQL client

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 📁 Project Structure

```
dentalcare-system/
├── backend/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── doctor.controller.js  # Doctor management
│   │   ├── service.controller.js # Service management
│   │   ├── appointment.controller.js
│   │   └── admin.controller.js   # Admin operations
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT verification
│   ├── models/
│   │   ├── user.model.js
│   │   ├── doctor.model.js
│   │   ├── service.model.js
│   │   └── appointment.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── service.routes.js
│   │   ├── appointment.routes.js
│   │   └── admin.routes.js
│   ├── .env                      # Environment variables
│   ├── .env.example             # Example environment file
│   ├── database.sql             # Database schema
│   ├── index.js                 # Express server
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── PublicRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UserLanding.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── BookAppointment.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── StaffDashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── doctor.service.js
│   │   │   ├── service.service.js
│   │   │   └── appointment.service.js
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
│
└── package.json                  # Root package.json
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
cd c:\laragon\www\dentalcare-system
```

### 2. Database Setup

1. Open **MySQL** (via phpMyAdmin, MySQL Workbench, or command line)
2. Create a new database:

```sql
CREATE DATABASE dentalcare_db;
```

3. Import the database schema:

```bash
# If using MySQL command line:
mysql -u root -p dentalcare_db < backend/database.sql

# Or copy the SQL from backend/database.sql and run it in phpMyAdmin
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your database credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=dentalcare_db
# JWT_SECRET=your-super-secret-jwt-key
# PORT=8080
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### 5. Run the Application

**Option 1: Run Backend and Frontend Separately**

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option 2: Run Both Concurrently (from root)**

```powershell
# From root directory
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080 (root)

### 7. Default Login Credentials

After running the database setup, you can login with:

- **Admin Account**:
  - Email: `admin@dentalcare.com`
  - Password: `admin123`

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/profile       - Get current user profile (protected)
PUT    /api/auth/profile       - Update user profile (protected)
```

### Doctor Endpoints

```
GET    /api/doctors            - Get all doctors
GET    /api/doctors/:id        - Get doctor by ID
POST   /api/doctors            - Create doctor (admin only)
PUT    /api/doctors/:id        - Update doctor (admin only)
DELETE /api/doctors/:id        - Delete doctor (admin only)
```

### Service Endpoints

```
GET    /api/services           - Get all services
GET    /api/services/:id       - Get service by ID
POST   /api/services           - Create service (admin only)
PUT    /api/services/:id       - Update service (admin only)
DELETE /api/services/:id       - Delete service (admin only)
```

### Appointment Endpoints

```
POST   /api/appointments                - Create appointment
GET    /api/appointments/my             - Get user's appointments
GET    /api/appointments                - Get all appointments (admin/staff)
GET    /api/appointments/booked-slots   - Get booked time slots
GET    /api/appointments/:id            - Get appointment by ID
PUT    /api/appointments/:id/status     - Update appointment status (admin/staff)
PUT    /api/appointments/:id/cancel     - Cancel appointment
PUT    /api/appointments/:id/payment    - Update payment status (admin/staff)
GET    /api/appointments/month          - Get appointments by month (admin/staff)
```

### Admin Endpoints

```
GET    /api/admin/dashboard         - Get dashboard statistics
GET    /api/admin/users             - Get all users
POST   /api/admin/staff             - Create admin/staff account
PUT    /api/admin/users/:id/role    - Update user role
DELETE /api/admin/users/:id         - Delete user
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dentalcare_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=8080
```

## 🎨 Key Features Implemented

### Security
✅ JWT-based authentication  
✅ Password hashing with bcryptjs  
✅ Protected routes (middleware)  
✅ Role-based access control  
✅ SQL injection prevention (parameterized queries)  

### User Experience
✅ Real-time slot availability  
✅ Booking conflict prevention  
✅ Daily booking limits  
✅ Responsive design with Tailwind CSS  
✅ User-friendly error messages  
✅ **Pay at Clinic** - Simple payment processing  

### Admin Features
✅ Dashboard with statistics  
✅ User management (CRUD)  
✅ Doctor management (CRUD)  
✅ Service management (CRUD)  
✅ Appointment monitoring  

## 📝 API Request Examples

### Register User

```javascript
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "555-0123",
  "password": "password123"
}
```

### Login

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Appointment

```javascript
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_id": 1,
  "service_id": 1,
  "appointment_date": "2025-01-15",
  "appointment_time": "10:00:00",
  "payment_method": "clinic",
  "notes": "First visit"
}
```

## 🐛 Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `.env`
- Ensure `dentalcare_db` database exists

### Port Already in Use
```bash
# Change port in backend/.env
PORT=3000
```

### CORS Errors
- Ensure backend is running on port 8080
- Check frontend is configured to call `http://localhost:8080`

## 🚀 Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, Render, or DigitalOcean
- Set environment variables
- Use production MySQL database

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or GitHub Pages
- Update API URL to production backend

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Made with ❤️ for dental clinics worldwide**

🦷 **DentalCare System** - Modern appointment booking made easy!
