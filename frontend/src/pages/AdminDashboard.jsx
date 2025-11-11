import Layout from '../components/Layout';

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">Admin dashboard is under construction. This page will include:</p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
            <li>Statistics overview</li>
            <li>User management</li>
            <li>Doctor management</li>
            <li>Service management</li>
            <li>Appointment monitoring</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
