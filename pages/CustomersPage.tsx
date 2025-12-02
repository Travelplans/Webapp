import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/shared/DashboardLayout';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Customer, UserRole } from '../types';
import CustomerDetailModal from '../components/customers/CustomerDetailModal';
import CreateCustomerModal from '../components/customers/CreateCustomerModal';
import { DownloadIcon } from '../components/shared/icons/Icons';

const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const { customers, users, bookings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const canManageCustomers = user?.roles.includes(UserRole.ADMIN) || user?.roles.includes(UserRole.AGENT);
  const canViewDetails = canManageCustomers || user?.roles.includes(UserRole.RELATIONSHIP_MANAGER);

  const customersWithDetails = useMemo(() => {
    let baseCustomers: Customer[];

    // Role-based filtering with correct priority
    if (user?.roles.includes(UserRole.ADMIN)) {
        baseCustomers = customers;
    } else if (user?.roles.includes(UserRole.AGENT)) {
        // Agents see customers they registered.
        baseCustomers = customers.filter(c => c.registeredByAgentId === user.id);
    } else if (user?.roles.includes(UserRole.RELATIONSHIP_MANAGER)) {
        // RMs who are not Admins/Agents see assigned customers.
        baseCustomers = customers.filter(c => c.assignedRmId === user.id);
    } else {
        baseCustomers = [];
    }

    return baseCustomers.map(customer => {
      const agent = users.find(u => u.id === customer.registeredByAgentId);
      const rm = users.find(u => u.id === customer.assignedRmId);
      return {
        ...customer,
        agentName: agent ? agent.name : 'N/A',
        rmName: rm ? rm.name : 'N/A',
      };
    });
  }, [customers, users, user]);

  const filteredCustomers = useMemo(() => {
    return customersWithDetails.filter(customer => {
      const searchMatch =
        customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const statusMatch = statusFilter === 'All' || customer.bookingStatus === statusFilter;

      const dateMatch = (() => {
        if (!startDate && !endDate) {
          return true; // No date filter applied
        }
        
        // Helper to check if a date string is within the selected range
        const isDateInRange = (dateStr: string) => {
            if (!dateStr) return false;
            const startMatch = !startDate || dateStr >= startDate;
            const endMatch = !endDate || dateStr <= endDate;
            return startMatch && endMatch;
        };

        // Check if registration date is in range
        if (isDateInRange(customer.registrationDate)) {
            return true;
        }

        // Check if any booking date is in range
        const customerBookings = bookings.filter(b => b.customerId === customer.id);
        const hasMatchingBooking = customerBookings.some(booking => {
            const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
            return isDateInRange(bookingDate);
        });

        return hasMatchingBooking;
      })();

      return searchMatch && statusMatch && dateMatch;
    });
  }, [searchQuery, statusFilter, startDate, endDate, customersWithDetails, bookings]);

  const handleViewDetails = (customer: Customer) => {
    if (canViewDetails) {
        setSelectedCustomer(customer);
    }
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
  };
  
  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };
  
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      alert("No customer data to export based on the current filters.");
      return;
    }

    const headers = ["ID", "First Name", "Last Name", "Email", "Date of Birth", "Registration Date", "Booking Status", "Assigned RM", "Registered By Agent"];
    
    // Sanitize data for CSV
    const escapeCSV = (field: string) => `"${String(field || '').replace(/"/g, '""')}"`;

    const csvRows = [
      headers.join(','), // header row
      ...filteredCustomers.map(customer => {
        const row = [
          escapeCSV(customer.id),
          escapeCSV(customer.firstName),
          escapeCSV(customer.lastName),
          escapeCSV(customer.email),
          escapeCSV(customer.dob),
          escapeCSV(customer.registrationDate),
          escapeCSV(customer.bookingStatus),
          escapeCSV(customer.rmName),
          escapeCSV(customer.agentName)
        ];
        return row.join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const statusColors: Record<Customer['bookingStatus'], string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-green-100 text-green-800',
    Completed: 'bg-blue-100 text-blue-800',
  };

  const filterButtons: { label: string; value: typeof statusFilter }[] = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Completed', value: 'Completed' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
            {user?.roles.includes(UserRole.RELATIONSHIP_MANAGER) && !canManageCustomers ? 'My Assigned Customers' : 'Customer Management'}
        </h1>

        <Card>
          <div className="space-y-4">
            <div className="md:flex justify-between items-center space-y-4 md:space-y-0">
                <div className="relative w-full md:max-w-xs">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                {canManageCustomers && (
                    <div className="flex items-center space-x-2">
                        <Button onClick={handleExportCSV} variant="secondary" className="inline-flex items-center">
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Export Customers
                        </Button>
                        <Button onClick={() => setCreateModalOpen(true)}>Create New Customer</Button>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 text-sm font-semibold text-gray-600">Filters:</div>
                <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
                    {filterButtons.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                statusFilter === value
                                ? 'bg-white text-primary shadow'
                                : 'text-gray-600 hover:bg-white/60'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                    <span className="text-gray-600">to</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                    <button onClick={handleClearDates} className="text-sm text-gray-600 hover:text-primary underline">Clear</button>
                </div>
            </div>
          </div>
        </Card>
        
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned RM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered By</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                            <tr key={customer.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[customer.bookingStatus]}`}>
                                        {customer.bookingStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.rmName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.agentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {canViewDetails ? (
                                        <button onClick={() => handleViewDetails(customer)} className="text-primary hover:underline">
                                            View Details
                                        </button>
                                    ) : (
                                        <span className="text-gray-400">N/A</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                    No customers found. Try adjusting your search or filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>

      {selectedCustomer && (
        <CustomerDetailModal customer={selectedCustomer} onClose={handleCloseModal} />
      )}

      <CreateCustomerModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />

    </DashboardLayout>
  );
};

export default CustomersPage;