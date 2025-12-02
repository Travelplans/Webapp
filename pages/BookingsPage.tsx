import React, { useMemo, useState } from 'react';
import DashboardLayout from '../components/shared/DashboardLayout';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { Booking, UserRole } from '../types';
import { BriefcaseIcon, CalendarIcon, ListIcon } from '../components/shared/icons/Icons';


type BookingStatus = Booking['status'];
type PaymentStatus = Booking['paymentStatus'];

// Extends the booking with details for rendering
type DetailedBooking = Booking & {
    customerName: string;
    itineraryTitle: string;
    agentName: string;
};

interface BookingUpdateConfirmation {
  bookingId: string;
  newStatus: BookingStatus | PaymentStatus;
  oldStatus: BookingStatus | PaymentStatus;
  type: 'status' | 'paymentStatus';
}

const BookingsPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const { bookings, customers, itineraries, users, updateBooking } = useData();
    const { addToast } = useToast();

    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayBookings, setSelectedDayBookings] = useState<DetailedBooking[] | null>(null);
    const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<'All' | PaymentStatus>('All');
    const [confirmationDetails, setConfirmationDetails] = useState<BookingUpdateConfirmation | null>(null);

    const allBookings = useMemo(() => {
        if (!currentUser) return [];

        let baseBookings: Booking[];
        if (currentUser.roles.includes(UserRole.ADMIN)) {
            baseBookings = bookings;
        } else if (currentUser.roles.includes(UserRole.AGENT)) {
            const agentCustomers = customers.filter(c => c.registeredByAgentId === currentUser.id);
            const agentCustomerIds = new Set(agentCustomers.map(c => c.id));
            baseBookings = bookings.filter(b => agentCustomerIds.has(b.customerId));
        } else {
            baseBookings = [];
        }
        
        return baseBookings
            .map(booking => {
                const customer = customers.find(c => c.id === booking.customerId);
                const itinerary = itineraries.find(i => i.id === booking.itineraryId);
                const agent = customer ? users.find(u => u.id === customer.registeredByAgentId) : undefined;
                return {
                    ...booking,
                    customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'N/A',
                    itineraryTitle: itinerary ? itinerary.title : 'N/A',
                    agentName: agent ? agent.name : 'N/A',
                };
            })
            .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    }, [currentUser, bookings, customers, itineraries, users]);
    
    const filteredBookings = useMemo(() => {
        return allBookings.filter(booking => {
            const statusMatch = statusFilter === 'All' || booking.status === statusFilter;
            const paymentStatusMatch = paymentStatusFilter === 'All' || booking.paymentStatus === paymentStatusFilter;
            return statusMatch && paymentStatusMatch;
        });
    }, [allBookings, statusFilter, paymentStatusFilter]);

    const handleStatusChangeRequest = (bookingId: string, oldStatus: BookingStatus, newStatus: BookingStatus) => {
        if (oldStatus !== newStatus) {
            setConfirmationDetails({
                bookingId,
                newStatus,
                oldStatus,
                type: 'status',
            });
        }
    };

    const handlePaymentStatusChangeRequest = (bookingId: string, oldStatus: PaymentStatus, newPaymentStatus: PaymentStatus) => {
        if (oldStatus !== newPaymentStatus) {
            setConfirmationDetails({
                bookingId,
                newStatus: newPaymentStatus,
                oldStatus,
                type: 'paymentStatus',
            });
        }
    };

    const handleConfirmStatusUpdate = () => {
        if (!confirmationDetails) return;

        const { bookingId, newStatus, oldStatus, type } = confirmationDetails;
        if (type === 'status') {
            updateBooking(bookingId, { status: newStatus as BookingStatus });
        } else if (type === 'paymentStatus') {
            updateBooking(bookingId, { paymentStatus: newStatus as PaymentStatus });
        }
        
        addToast(`Booking updated from "${oldStatus}" to "${newStatus}".`, 'success');
        setConfirmationDetails(null);
    };

    const bookingStatusOptions: BookingStatus[] = ['Pending', 'Confirmed', 'Completed'];
    const paymentStatusOptions: PaymentStatus[] = ['Unpaid', 'Paid'];

    const bookingStatusColors: Record<BookingStatus, string> = {
        Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        Confirmed: 'bg-green-100 text-green-800 border-green-300',
        Completed: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    
    const paymentStatusColors: Record<PaymentStatus, string> = {
        Unpaid: 'bg-red-100 text-red-800 border-red-300',
        Paid: 'bg-green-100 text-green-800 border-green-300',
    };

    // --- Calendar Logic ---
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday

        const grid: { date: Date; isCurrentMonth: boolean; bookings: DetailedBooking[] }[] = [];
        
        // Add days from previous month for padding
        for (let i = 0; i < startDayOfWeek; i++) {
            const date = new Date(year, month, i - startDayOfWeek + 1);
            grid.push({ date, isCurrentMonth: false, bookings: [] });
        }

        // Add days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayBookings = filteredBookings.filter(b => {
                const bookingDate = new Date(b.bookingDate);
                return bookingDate.getFullYear() === year &&
                       bookingDate.getMonth() === month &&
                       bookingDate.getDate() === day;
            });
            grid.push({ date, isCurrentMonth: true, bookings: dayBookings });
        }

        // Add days from next month for padding
        const remainingCells = 42 - grid.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            const date = new Date(year, month + 1, i);
            grid.push({ date, isCurrentMonth: false, bookings: [] });
        }

        return grid;
    }, [currentDate, filteredBookings]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const CalendarView = () => (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">&larr;</button>
                <h2 className="text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">&rarr;</button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center py-2 bg-gray-50 text-xs font-semibold text-gray-600">{day}</div>
                ))}
                {calendarData.map(({ date, isCurrentMonth, bookings }, index) => (
                    <div 
                        key={index}
                        onClick={() => bookings.length > 0 && setSelectedDayBookings(bookings)}
                        className={`p-2 bg-white min-h-[120px] transition-colors ${!isCurrentMonth ? 'bg-gray-50' : ''} ${bookings.length > 0 ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                    >
                        <span className={`text-sm ${isCurrentMonth ? 'font-medium' : 'text-gray-400'}`}>{date.getDate()}</span>
                        <div className="space-y-1 mt-1">
                            {bookings.slice(0, 3).map(b => (
                                <div key={b.id} className={`px-1.5 py-0.5 text-xs rounded truncate ${bookingStatusColors[b.status]}`}>{b.itineraryTitle}</div>
                            ))}
                            {bookings.length > 3 && <div className="text-xs text-gray-500 mt-1">+{bookings.length - 3} more</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const ListView = () => (
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itinerary</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Date</th>
                        {currentUser?.roles.includes(UserRole.ADMIN) && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                        <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.customerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.itineraryTitle}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                            {currentUser?.roles.includes(UserRole.ADMIN) && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.agentName}</td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <select 
                                    value={booking.status} 
                                    onChange={(e) => handleStatusChangeRequest(booking.id, booking.status, e.target.value as BookingStatus)}
                                    className={`w-full p-1.5 border rounded-md text-xs font-semibold focus:ring-primary focus:border-primary ${bookingStatusColors[booking.status]}`}
                                >
                                    {bookingStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <select 
                                    value={booking.paymentStatus} 
                                    onChange={(e) => handlePaymentStatusChangeRequest(booking.id, booking.paymentStatus, e.target.value as PaymentStatus)}
                                    className={`w-full p-1.5 border rounded-md text-xs font-semibold focus:ring-primary focus:border-primary ${paymentStatusColors[booking.paymentStatus]}`}
                                >
                                    {paymentStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={currentUser?.roles.includes(UserRole.ADMIN) ? 6 : 5} className="text-center py-8 text-gray-500">
                                No bookings found for the selected filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Booking Management</h1>
                <Card>
                    <div className="md:flex justify-between items-center mb-4">
                        <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg">
                             <div className="flex-shrink-0 text-sm font-semibold text-gray-600">Filter by:</div>
                             <div className="flex items-center gap-2">
                                <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Booking Status:</label>
                                <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                    <option value="All">All</option>
                                    {bookingStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="payment-filter" className="text-sm font-medium text-gray-700">Payment Status:</label>
                                <select id="payment-filter" value={paymentStatusFilter} onChange={e => setPaymentStatusFilter(e.target.value as any)} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                    <option value="All">All</option>
                                    {paymentStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-lg mt-4 md:mt-0">
                           <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-white/70'}`}><ListIcon className="w-4 h-4" /> List</button>
                           <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${viewMode === 'calendar' ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-white/70'}`}><CalendarIcon className="w-4 h-4" /> Calendar</button>
                        </div>
                    </div>
                    {viewMode === 'list' ? <ListView /> : <CalendarView />}
                </Card>
            </div>
             {selectedDayBookings && (
                <Modal 
                    isOpen={!!selectedDayBookings} 
                    onClose={() => setSelectedDayBookings(null)} 
                    title={`Bookings for ${new Date(selectedDayBookings[0].bookingDate).toLocaleDateString()}`}
                >
                    <div className="space-y-4">
                        {selectedDayBookings.map(booking => (
                            <div key={booking.id} className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-bold text-primary flex items-center gap-2"><BriefcaseIcon className="w-5 h-5"/> {booking.itineraryTitle}</p>
                                <p className="text-sm text-gray-600 mt-1"><strong>Customer:</strong> {booking.customerName}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${bookingStatusColors[booking.status]}`}>{booking.status}</span>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${paymentStatusColors[booking.paymentStatus]}`}>{booking.paymentStatus}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
            {confirmationDetails && (
                <ConfirmationModal
                    isOpen={!!confirmationDetails}
                    onClose={() => setConfirmationDetails(null)}
                    onConfirm={handleConfirmStatusUpdate}
                    title="Confirm Status Change"
                    message={`Are you sure you want to change the ${confirmationDetails.type === 'status' ? 'booking' : 'payment'} status from "${confirmationDetails.oldStatus}" to "${confirmationDetails.newStatus}"?`}
                />
            )}
        </DashboardLayout>
    );
};

export default BookingsPage;