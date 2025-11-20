import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { FaUsers, FaUserMd, FaShieldAlt, FaCalendarAlt, FaPlus } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStaff: 0,
        totalAdmins: 0,
        totalAppointments: 0
    });
    const [users, setUsers] = useState([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalMode, setModalMode] = useState('add');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'staff'
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch stats (you'll need to create this endpoint)
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);

            // Fetch all users
            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setMessage({ type: 'error', text: 'Failed to load dashboard data' });
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, userData = null) => {
        setModalMode(mode);
        setErrors([]);
        if (mode === 'edit' && userData) {
            setSelectedUser(userData);
            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                password: '',
                role: userData.role || 'staff'
            });
        } else {
            setSelectedUser(null);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                role: 'staff'
            });
        }
        setShowUserModal(true);
    };

    const closeModal = () => {
        setShowUserModal(false);
        setSelectedUser(null);
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            role: 'staff'
        });
        setErrors([]);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        // Validation
        const validationErrors = [];
        if (!formData.first_name.trim()) validationErrors.push('First name is required');
        if (!formData.last_name.trim()) validationErrors.push('Last name is required');
        if (!formData.email.trim()) validationErrors.push('Email is required');
        if (modalMode === 'add' && !formData.password) validationErrors.push('Password is required');
        if (formData.password && formData.password.length < 6) validationErrors.push('Password must be at least 6 characters');

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            if (modalMode === 'add') {
                await api.post('/admin/staff', formData);
                setMessage({ type: 'success', text: 'User created successfully!' });
            } else {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await api.put(`/admin/staff/${selectedUser.id}`, updateData);
                setMessage({ type: 'success', text: 'User updated successfully!' });
            }
            closeModal();
            fetchDashboardData();
        } catch (error) {
            const resMessage = error.response?.data?.message || error.message;
            setErrors([resMessage]);
        }
    };

    const handleDelete = async (userId) => {
        try {
            await api.delete(`/admin/staff/${userId}`);
            setMessage({ type: 'success', text: 'User deleted successfully!' });
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchDashboardData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete user' });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleBadgeClass = (role) => {
        const classes = {
            admin: 'bg-blue-100 text-blue-800',
            staff: 'bg-sky-100 text-sky-800',
            user: 'bg-gray-100 text-gray-800'
        };
        return classes[role] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-20 bg-blue-900 text-gray-300 p-3 flex flex-col items-center justify-between shadow-2xl sticky top-0 h-screen z-20">
                <div>
                    <Link to="/" title="Dentalcare Home" className="flex items-center justify-center h-12 w-12 mb-8 rounded-full bg-blue-500 text-white shadow-md">
                        <img src="https://cdn-icons-png.flaticon.com/128/3914/3914549.png" alt="Dentalcare Logo" className="w-6 h-6 invert" />
                    </Link>

                    <nav className="space-y-4">
                        <Link to="/admin/dashboard" title="Dashboard" className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white shadow-md relative group">
                            <img src="https://cdn-icons-png.flaticon.com/128/3914/3914820.png" alt="" className="w-6 h-6 invert" />
                            <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Dashboard</span>
                        </Link>

                        <Link to="/admin/appointments" title="Appointments" className="flex items-center justify-center h-12 w-12 rounded-full text-gray-400 hover:bg-blue-600 hover:text-white relative group">
                            <img src="https://cdn-icons-png.flaticon.com/128/19027/19027040.png" alt="" className="w-6 h-6 invert" />
                            <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Appointments</span>
                        </Link>

                        <Link to="/admin/doctors" title="Doctors" className="flex items-center justify-center h-12 w-12 rounded-full text-gray-400 hover:bg-blue-600 hover:text-white relative group">
                            <img src="https://cdn-icons-png.flaticon.com/128/9856/9856850.png" alt="" className="w-6 h-6 invert" />
                            <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Doctors</span>
                        </Link>

                        <Link to="/admin/services" title="Services" className="flex items-center justify-center h-12 w-12 rounded-full text-gray-400 hover:bg-blue-600 hover:text-white relative group">
                            <img src="https://cdn-icons-png.flaticon.com/128/3914/3914079.png" alt="" className="w-6 h-6 invert" />
                            <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Services</span>
                        </Link>
                    </nav>
                </div>

                <div>
                    <button onClick={() => setShowLogoutModal(true)} title="Logout" className="flex items-center justify-center h-12 w-12 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors relative group">
                        <img src="https://cdn-icons-png.flaticon.com/128/19006/19006863.png" alt="" className="w-6 h-6 invert" />
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Logout</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Main Content */}
                <main className="flex-1 p-6 sm:p-10 overflow-y-auto h-screen">
                    <header className="mb-10">
                        <h1 className="text-8xl font-extrabold text-gray-900">Dashboard</h1>
                        <p className="text-lg text-gray-600 mt-1">Welcome back, {user?.first_name} {user?.last_name}. Here's a summary of your clinic.</p>
                    </header>

                    {/* Alert Messages */}
                    {message.text && (
                        <div className={`p-4 mb-6 rounded-lg border shadow-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                            <strong className="font-bold">{message.type === 'success' ? 'Success!' : 'Error!'}</strong>
                            <span className="ml-2">{message.text}</span>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                        {/* Total Patients Card */}
                        <div className="flex min-h-[20em] flex-col justify-between gap-[0.5em] rounded-[1.5em] bg-[#E0F2FE] p-[1.5em] text-[#0369A1] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] transition hover:shadow-lg">
                            <div className="flex h-fit w-full items-start justify-between">
                                <div className="flex flex-col items-start justify-center">
                                    <p className="text-[1rem] font-semibold uppercase tracking-wider">Total Patients</p>
                                    <p className="text-[8em] font-extrabold mt-1">{stats.totalUsers}</p>
                                </div>
                                <div className="text-4xl opacity-80">
                                    <FaUsers />
                                </div>
                            </div>
                            <div className="h-[1px] w-full rounded-full bg-[hsla(206,90%,50%,0.2)]"></div>
                            <p className="text-[0.75rem] font-light text-sky-600">All registered patient accounts.</p>
                        </div>

                        {/* Total Staff Card */}
                        <div className="flex min-h-[20em] flex-col justify-between gap-[0.5em] rounded-[1.5em] bg-[#D1FAE5] p-[1.5em] text-[#047857] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] transition hover:shadow-lg">
                            <div className="flex h-fit w-full items-start justify-between">
                                <div className="flex flex-col items-start justify-center">
                                    <p className="text-[1rem] font-semibold uppercase tracking-wider">Total Staff</p>
                                    <p className="text-[8em] font-extrabold mt-1">{stats.totalStaff}</p>
                                </div>
                                <div className="text-4xl opacity-80">
                                    <FaUserMd />
                                </div>
                            </div>
                            <div className="h-[1px] w-full rounded-full bg-[hsla(158,90%,40%,0.2)]"></div>
                            <p className="text-[0.75rem] font-light text-emerald-600">All registered staff accounts.</p>
                        </div>

                        {/* Total Admins Card */}
                        <div className="flex min-h-[20em] flex-col justify-between gap-[0.5em] rounded-[1.5em] bg-[#EDE9FE] p-[1.5em] text-[#5B21B6] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] transition hover:shadow-lg">
                            <div className="flex h-fit w-full items-start justify-between">
                                <div className="flex flex-col items-start justify-center">
                                    <p className="text-[1rem] font-semibold uppercase tracking-wider">Total Admins</p>
                                    <p className="text-[8em] font-extrabold mt-1">{stats.totalAdmins}</p>
                                </div>
                                <div className="text-4xl opacity-80">
                                    <FaShieldAlt />
                                </div>
                            </div>
                            <div className="h-[1px] w-full rounded-full bg-[hsla(263,90%,50%,0.2)]"></div>
                            <p className="text-[0.75rem] font-light text-violet-600">All registered admin accounts.</p>
                        </div>

                        {/* Total Bookings Card */}
                        <div className="flex min-h-[20em] flex-col justify-between gap-[0.5em] rounded-[1.5em] bg-[#FEF3C7] p-[1.5em] text-[#B45309] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] transition hover:shadow-lg">
                            <div className="flex h-fit w-full items-start justify-between">
                                <div className="flex flex-col items-start justify-center">
                                    <p className="text-[1rem] font-semibold uppercase tracking-wider">Total Bookings</p>
                                    <p className="text-[8em] font-extrabold mt-1">{stats.totalAppointments}</p>
                                </div>
                                <div className="text-4xl opacity-80">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                            <div className="h-[1px] w-full rounded-full bg-[hsla(39,90%,40%,0.2)]"></div>
                            <p className="text-[0.75rem] font-light text-amber-700">All appointment records.</p>
                        </div>
                    </section>

                    {/* User Accounts Table */}
                    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">User Accounts</h2>
                            <button type="button" onClick={() => openModal('add')} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <FaPlus /> Add Admin/Staff
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.length > 0 ? (
                                        users.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-4 text-sm font-medium text-gray-900">{u.id}</td>
                                                <td className="px-3 py-4 text-sm text-gray-600">{u.first_name} {u.last_name}</td>
                                                <td className="px-3 py-4 text-sm text-gray-600">{u.email}</td>
                                                <td className="px-3 py-4 text-sm text-gray-600">{u.phone || 'N/A'}</td>
                                                <td className="px-3 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(u.role)}`}>
                                                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 text-sm space-x-2">
                                                    {(u.role === 'admin' || u.role === 'staff') ? (
                                                        <>
                                                            <button onClick={() => openModal('edit', u)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                                                            <button type="button" onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-800 font-medium ml-2">Delete</button>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-3 py-4 text-center text-gray-500">No registered accounts found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>

                {/* Right Sidebar - Profile */}
                <aside className="w-full lg:w-80 h-screen sticky top-0 flex flex-col overflow-y-auto bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 shadow-2xl border-r border-blue-800 text-white">
                    <div className="relative p-6 text-center bg-white/10 backdrop-blur-md rounded-b-3xl shadow-lg mb-6">
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto ring-4 ring-offset-2 ring-blue-400 ring-offset-blue-900 shadow-xl transition-all hover:scale-105 duration-300">
                            <FaShieldAlt className="text-4xl text-blue-600" />
                        </div>
                        <h2 className="mt-3 text-xl font-bold text-white tracking-wide">{user?.first_name} {user?.last_name}</h2>
                        <p className="mt-1 text-xs uppercase font-semibold bg-blue-700 text-blue-100 px-4 py-1 rounded-full inline-block tracking-wider shadow-inner">{user?.role}</p>
                    </div>

                    <div className="px-6 pb-10 flex-grow">
                        <h3 className="text-sm font-semibold text-blue-200 mb-4 uppercase tracking-wider border-b border-blue-700 pb-2">Admin Information</h3>
                        <ul className="space-y-6 text-sm">
                            <li>
                                <span className="block text-blue-200 mb-1">Full Name</span>
                                <span className="text-white font-semibold text-base">{user?.first_name} {user?.last_name}</span>
                            </li>
                            <li>
                                <span className="block text-blue-200 mb-1">Email Address</span>
                                <span className="text-white font-semibold text-base break-words">{user?.email}</span>
                            </li>
                            <li>
                                <span className="block text-blue-200 mb-1">Phone</span>
                                <span className="text-white font-semibold text-base">{user?.phone || 'N/A'}</span>
                            </li>
                            <li>
                                <span className="block text-blue-200 mb-1">Role</span>
                                <span className="text-white font-semibold text-base">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
                            </li>
                        </ul>
                    </div>

                    <footer className="p-6 mt-auto border-t border-blue-800 bg-blue-950/50 backdrop-blur-sm text-center">
                        <p className="text-xs text-blue-300">&copy; {new Date().getFullYear()} DENTALCARE. All rights reserved.</p>
                    </footer>
                </aside>
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                            {modalMode === 'add' ? 'Add New Admin/Staff' : `Edit User: ${selectedUser?.first_name} ${selectedUser?.last_name}`}
                        </h2>

                        {errors.length > 0 && (
                            <div className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
                                <ul className="list-disc pl-5 m-0">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600">
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password <span className="text-xs text-gray-500 ml-1">{modalMode === 'add' ? '(Required, min 6 chars)' : '(Optional - leave blank to keep current)'}</span>
                                </label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={modalMode === 'add'} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    {modalMode === 'add' ? 'Add User' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setSelectedUser(null); } }}>
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="mb-4 text-red-500 text-5xl">⚠️</div>
                            <h3 className="text-2xl font-semibold text-gray-800">Confirm Delete</h3>
                        </div>

                        <p className="text-gray-600 text-center mb-6">
                            WARNING: Delete <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>? This action cannot be undone.
                        </p>

                        <div className="flex justify-center gap-4">
                            <button type="button" onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }} className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium">Cancel</button>
                            <button onClick={() => handleDelete(selectedUser.id)} className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }}>
                    <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="mb-4 text-red-500 text-5xl">🚪</div>
                            <h3 className="text-2xl font-semibold text-gray-800">Confirm Logout</h3>
                        </div>

                        <p className="text-gray-600 text-center mb-8">Are you sure you want to logout? This will end your current session.</p>

                        <div className="flex justify-center gap-4">
                            <button type="button" onClick={() => setShowLogoutModal(false)} className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium">Cancel</button>
                            <button onClick={handleLogout} className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md">Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
