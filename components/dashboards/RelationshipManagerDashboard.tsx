import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Card from '../shared/Card';

const RelationshipManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { customers, users } = useData();
  const assignedCustomers = customers.filter(c => c.assignedRmId === user?.id);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Relationship Manager Dashboard</h1>

      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Customers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedCustomers.map(customer => {
                const agent = users.find(u => u.id === customer.registeredByAgentId);
                return (
                    <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            customer.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                            customer.bookingStatus === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {customer.bookingStatus}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent?.name || 'N/A'}</td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RelationshipManagerDashboard;
