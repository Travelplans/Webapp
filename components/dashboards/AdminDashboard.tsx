import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { UsersIcon, BriefcaseIcon, DollarSignIcon, UserCircleIcon } from '../shared/icons/Icons';


const AdminDashboard: React.FC = () => {
  const { users, itineraries } = useData();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-primary">
              <UsersIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <BriefcaseIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Itineraries</p>
              <p className="text-2xl font-bold text-gray-900">{itineraries.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Itinerary Management */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Itineraries</h2>
          <Link to="/itineraries">
            <Button>Manage Itineraries</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.slice(0, 3).map(it => (
            <Card key={it.id} className="overflow-hidden !p-0 flex flex-col h-full">
              <Link to={`/itinerary/${it.id}`} className="group block h-full flex flex-col">
                <img src={it.imageUrl} alt={it.title} className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity flex-shrink-0"/>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{it.title}</h3>
                  <p className="text-sm text-gray-500">{it.destination}</p>
                  {it.description && <p className="mt-2 text-sm text-gray-600 flex-grow">{it.description}</p>}
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <span className="text-xl font-bold text-primary">AED {it.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-600">{it.duration} days</span>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </Card>

      {/* User Management Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Users</h2>
            <Link to="/users">
                <Button variant="secondary">Manage Users</Button>
            </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.slice(0, 4).map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <span key={role} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;