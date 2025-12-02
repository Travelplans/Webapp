
import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { UploadIcon, CheckCircleIcon, EyeIcon, SparklesIcon } from '../shared/icons/Icons';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Customer, CustomerDocument, Itinerary, RecommendedItinerary } from '../../types';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { customers, bookings, itineraries, addDocumentToCustomer, updateCustomer, addBooking, getRecommendedItineraries } = useData();
  const { addToast } = useToast();
  
  const customerData = customers.find(c => c.email === user?.email);

  const [dob, setDob] = useState(customerData?.dob || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [quickViewItinerary, setQuickViewItinerary] = useState<Itinerary | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedItinerary[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);


  useEffect(() => {
    if (customerData) {
      setDob(customerData.dob);
      setLoadingRecs(true);
      getRecommendedItineraries(customerData.id)
        .then(setRecommendations)
        .finally(() => setLoadingRecs(false));
    }
  }, [customerData, getRecommendedItineraries]);

  const customerBookings = customerData ? bookings.filter(b => b.customerId === customerData.id) : [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(event.target.files)]);
    }
  };

  const handleUpload = () => {
    if (customerData && selectedFiles.length > 0) {
      const fileCount = selectedFiles.length;
      selectedFiles.forEach(file => {
        const docType = file.name.split('.').pop()?.toUpperCase() as CustomerDocument['type'] || 'DOCX';
        addDocumentToCustomer(customerData.id, {
          name: file.name,
          type: ['PDF', 'DOCX', 'JPG', 'PNG'].includes(docType) ? docType : 'DOCX',
          uploadDate: new Date().toISOString().split('T')[0],
        });
      });
      setSelectedFiles([]);
      addToast(`${fileCount} document(s) uploaded successfully.`, 'success');
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerData) {
        updateCustomer({ ...customerData, dob });
        addToast("Your details have been updated successfully.", 'success');
    }
  };
  
  const handleBookNow = (itinerary: Itinerary) => {
     if (customerData) {
        addBooking({ customerId: customerData.id, itineraryId: itinerary.id });
        addToast(`Booking request for '${itinerary.title}' sent!`, 'success');
        setQuickViewItinerary(null); // Close modal on booking
    }
  }

  if (!customerData) {
    return (
        <Card>
            <p className="text-center text-gray-600">Could not find your customer profile. Please contact your agent.</p>
        </Card>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">My Booking Portal</h1>
      
      {loadingRecs ? (
        <Card>
          <div className="flex items-center justify-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-primary animate-pulse" />
            <p className="text-gray-600">Finding personalized recommendations for you...</p>
          </div>
        </Card>
      ) : recommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recommended For You</h2>
             <div className="flex overflow-x-auto space-x-6 pb-4">
                {recommendations.map(({ itinerary, reason }) => (
                     <Card key={itinerary.id} className="!p-0 w-80 flex-shrink-0 flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                        <img src={itinerary.imageUrl} alt={itinerary.title} className="w-full h-40 object-cover" />
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{itinerary.title}</h3>
                            <p className="text-sm text-gray-500">{itinerary.destination}</p>
                            <div className="mt-2 p-2 bg-green-50 border-l-4 border-secondary rounded-r-lg">
                                <p className="text-sm text-green-800 italic">"{reason}"</p>
                            </div>
                            <div className="mt-auto pt-4 flex items-center gap-2">
                                <Button variant="secondary" className="!py-2 !px-3" onClick={() => setQuickViewItinerary(itinerary)} title="Quick View"><EyeIcon className="w-5 h-5"/></Button>
                                <Button className="w-full" onClick={() => handleBookNow(itinerary)}>Book Now</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
          </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Explore Our Itineraries</h2>
        <div className="relative">
          <div className="flex overflow-x-auto space-x-6 pb-4">
            {itineraries.map(itinerary => {
              const existingBooking = customerBookings.find(b => b.itineraryId === itinerary.id);
              const isCompleted = existingBooking?.status === 'Completed';

              return (
                <Card key={itinerary.id} className="!p-0 w-80 flex-shrink-0 flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                  <div className="relative">
                    <img src={itinerary.imageUrl} alt={itinerary.title} className="w-full h-40 object-cover" />
                    {isCompleted && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-lg z-10">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Completed
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{itinerary.title}</h3>
                    <p className="text-sm text-gray-500">{itinerary.destination}</p>
                    {itinerary.description && <p className="mt-2 text-sm text-gray-600 h-16 overflow-hidden">{itinerary.description}</p>}
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">AED {itinerary.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">{itinerary.duration} days</span>
                    </div>
                    <div className="mt-auto pt-4 flex items-center gap-2">
                      <Button 
                        variant="secondary" 
                        className="!py-2 !px-3"
                        onClick={() => setQuickViewItinerary(itinerary)}
                        title="Quick View"
                      >
                         <EyeIcon className="w-5 h-5"/>
                      </Button>
                      {existingBooking ? (
                        <Button disabled className="w-full">Booked</Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => handleBookNow(itinerary)}
                        >
                          Book Now
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Bookings</h2>
        {customerBookings.length > 0 ? (
          <div className="space-y-4">
            {customerBookings.map(booking => {
              const itinerary = itineraries.find(it => it.id === booking.itineraryId);
              if (!itinerary) return null;

              const statusColors = {
                Confirmed: 'bg-green-100 text-green-800',
                Pending: 'bg-yellow-100 text-yellow-800',
                Completed: 'bg-blue-100 text-blue-800',
              };

              const paymentStatusColors = {
                Paid: 'bg-green-100 text-green-800',
                Unpaid: 'bg-red-100 text-red-800',
              };
              
              const bookingDate = new Date(booking.bookingDate);

              return (
                <div key={booking.id} className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{itinerary.title}</h3>
                    <p className="text-sm text-gray-500">{itinerary.destination}</p>
                    <p className="text-sm text-gray-500 mt-1">Booked on: {bookingDate.toLocaleDateString()}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[booking.paymentStatus]}`}>
                      {booking.paymentStatus}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">You have no bookings.</p>
        )}
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Complete Your Booking Details</h2>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                        <input type="text" id="firstName" defaultValue={customerData.firstName} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm" readOnly />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input type="text" id="lastName" defaultValue={customerData.lastName} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm" readOnly />
                    </div>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" defaultValue={customerData.email} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm" readOnly />
                </div>
                 <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input type="date" id="dob" value={dob} onChange={e => setDob(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit">Save Details</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Documents</h2>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png"/>
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
              </div>
            </div>
             {selectedFiles.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-md font-medium text-gray-700">Selected files:</h3>
                    <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
                        {selectedFiles.map((file, index) => (
                            <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                            </li>
                        ))}
                    </ul>
                    <Button onClick={handleUpload} className="w-full mt-2">Upload {selectedFiles.length} file(s)</Button>
                </div>
            )}
          </Card>
        </div>
      </div>

       {quickViewItinerary && (
        <Modal 
            isOpen={!!quickViewItinerary} 
            onClose={() => setQuickViewItinerary(null)} 
            title={quickViewItinerary.title}
        >
          <div className="space-y-4">
            <img src={quickViewItinerary.imageUrl} alt={quickViewItinerary.title} className="w-full h-56 object-cover rounded-lg" />
            <p className="text-md text-gray-600">{quickViewItinerary.destination}</p>
            <p className="text-sm text-gray-700">{quickViewItinerary.description}</p>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-2xl font-bold text-primary">AED {quickViewItinerary.price.toLocaleString()}</span>
              <Button onClick={() => handleBookNow(quickViewItinerary)}>Book Now</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerDashboard;
