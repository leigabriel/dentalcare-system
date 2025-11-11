import Layout from '../components/Layout';

const StaffDashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">Staff dashboard is under construction. This page will include:</p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
            <li>Appointment monitoring</li>
            <li>Confirm/cancel appointments</li>
            <li>View patient list</li>
            <li>Update payment status</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
