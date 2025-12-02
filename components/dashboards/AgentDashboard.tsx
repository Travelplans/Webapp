import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Card from '../shared/Card';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import CreateCustomerModal from '../customers/CreateCustomerModal';
import { Booking } from '../../types';

type BookingStatus = Booking['status'];

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { itineraries, customers, bookings } = useData();

  const [showTerms, setShowTerms] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | BookingStatus>('All');
  
  const agentItineraries = useMemo(() => {
    return itineraries.filter(it => it.assignedAgentId === user?.id || !it.assignedAgentId)
  }, [user, itineraries]);

  useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem('agentTermsAccepted');
    if (!hasAcceptedTerms) {
      setShowTerms(true);
    }
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('agentTermsAccepted', 'true');
    setShowTerms(false);
  };
  
  const agentItinerariesWithBookings = useMemo(() => {
    if (!user) return [];

    const agentCustomers = customers.filter(c => c.registeredByAgentId === user.id);
    const agentCustomerIds = new Set(agentCustomers.map(c => c.id));
    const agentBookings = bookings.filter(b => agentCustomerIds.has(b.customerId));

    return agentItineraries.map(itinerary => {
      const bookingsForItinerary = agentBookings.filter(b => b.itineraryId === itinerary.id);
      const bookingCounts = {
        Pending: bookingsForItinerary.filter(b => b.status === 'Pending').length,
        Confirmed: bookingsForItinerary.filter(b => b.status === 'Confirmed').length,
        Completed: bookingsForItinerary.filter(b => b.status === 'Completed').length,
      };
      return {
        ...itinerary,
        bookingCounts,
      };
    });
  }, [user, agentItineraries, customers, bookings]);

  const statusCounts = useMemo(() => {
    const counts: Record<'All' | BookingStatus, number> = {
      All: agentItinerariesWithBookings.length,
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
    };
    agentItinerariesWithBookings.forEach(it => {
        if (it.bookingCounts.Pending > 0) counts.Pending++;
        if (it.bookingCounts.Confirmed > 0) counts.Confirmed++;
        if (it.bookingCounts.Completed > 0) counts.Completed++;
    });
    return counts;
  }, [agentItinerariesWithBookings]);


  const filteredItineraries = useMemo(() => {
    if (filterStatus === 'All') {
      return agentItinerariesWithBookings;
    }
    return agentItinerariesWithBookings.filter(it => it.bookingCounts[filterStatus] > 0);
  }, [filterStatus, agentItinerariesWithBookings]);

  const filterButtons: { label: string; value: 'All' | BookingStatus }[] = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Completed', value: 'Completed' },
  ];

  const statusBadgeColors: Record<BookingStatus, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-green-100 text-green-800',
    Completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Agent Dashboard</h1>
        <Button onClick={() => setShowRegister(true)}>Register Customer</Button>
      </div>

      <div>
        <div className="md:flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">My Itineraries &amp; Bookings</h2>
            <div className="flex flex-wrap gap-2 rounded-lg bg-gray-200 p-1">
                {filterButtons.map(({ label, value }) => (
                    <button
                        key={value}
                        onClick={() => setFilterStatus(value)}
                        className={`flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            filterStatus === value
                            ? 'bg-white text-primary shadow'
                            : 'text-gray-600 hover:bg-white/60'
                        }`}
                        aria-pressed={filterStatus === value}
                    >
                        <span>{label}</span>
                        <span
                            className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                filterStatus === value
                                ? 'bg-primary text-white'
                                : 'bg-gray-300 text-gray-800'
                            }`}
                        >
                            {statusCounts[value]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
        
        {filteredItineraries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItineraries.map(it => (
                <Link to={`/itinerary/${it.id}`} key={it.id} className="group block h-full">
                <Card className="overflow-hidden h-full transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1 flex flex-col">
                    <img src={it.imageUrl} alt={it.title} className="w-full h-48 object-cover"/>
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{it.title}</h3>
                        <p className="text-sm text-gray-500">{it.destination}</p>
                        {it.description && <p className="mt-2 text-sm text-gray-600 flex-grow">{it.description}</p>}
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-xl font-bold text-primary">AED {it.price.toLocaleString()}</span>
                            <span className="text-sm text-gray-600">{it.duration} days</span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-100 mt-4 flex flex-wrap gap-2">
                            { (Object.keys(it.bookingCounts) as BookingStatus[]).map(status => (
                                it.bookingCounts[status] > 0 && (
                                    <span key={status} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadgeColors[status]}`}>
                                        {status}: {it.bookingCounts[status]}
                                    </span>
                                )
                            ))}
                            { it.bookingCounts.Pending === 0 && it.bookingCounts.Confirmed === 0 && it.bookingCounts.Completed === 0 && (
                                <span className="text-xs text-gray-400 italic">No bookings from your customers yet.</span>
                            )}
                        </div>
                    </div>
                </Card>
                </Link>
            ))}
            </div>
        ) : (
             <Card>
                <p className="text-center text-gray-500 py-8">
                    No itineraries found for the status "{filterStatus}".
                </p>
            </Card>
        )}
      </div>

      <Modal isOpen={showTerms} onClose={() => {}} title="Terms & General Agreement">
        <div className="text-sm text-gray-600 space-y-4 max-h-96 overflow-y-auto pr-2">
          <p className="font-semibold">Welcome to the Travelplans.fun Agent Portal. By accessing and using this portal, you agree to comply with and be bound by the following terms and conditions.</p>
          
          <div>
            <h4 className="font-bold text-gray-800">1. Agent Responsibilities</h4>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>You agree to provide accurate, current, and complete information for all customer registrations.</li>
              <li>You are responsible for accurately representing our travel itineraries and services to customers without making unauthorized claims or promises.</li>
              <li>You must handle all customer data with the utmost confidentiality and in compliance with data protection regulations.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-800">2. Use of Portal and Materials</h4>
            <ul className="list-disc list-inside space-y-1 mt-1">
                <li>All itineraries, collateral, and materials provided within this portal are the intellectual property of Travelplans.fun.</li>
                <li>Materials marked as "Pending Approval" are for internal review only and must not be distributed to customers.</li>
                <li>You are granted a non-exclusive, non-transferable license to use approved materials for the sole purpose of promoting and selling our travel packages.</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800">3. Booking and Payments</h4>
             <ul className="list-disc list-inside space-y-1 mt-1">
                <li>All bookings must be processed through the official channels provided in this portal.</li>
                <li>You are responsible for informing customers about payment deadlines and ensuring timely collection of payments. Commission structures and payouts will be handled as per your individual agent contract.</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800">4. Confidentiality</h4>
            <p>You acknowledge that you will have access to confidential information, including customer lists, pricing, and business strategies. You agree not to disclose this information to any third party, both during and after your association with Travelplans.fun.</p>
          </div>
          
           <div>
            <h4 className="font-bold text-gray-800">5. Termination</h4>
            <p>Travelplans.fun reserves the right to suspend or terminate your access to the portal at any time for violations of these terms, unethical conduct, or fraudulent activities. You may terminate your access by providing written notice to the administration.</p>
          </div>

          <p className="font-semibold pt-2 border-t">By clicking "I Accept", you acknowledge that you have read, understood, and agree to be bound by these terms.</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleAcceptTerms}>I Accept</Button>
        </div>
      </Modal>

      <CreateCustomerModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
};

export default AgentDashboard;