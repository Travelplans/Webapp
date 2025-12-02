import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../shared/components/DashboardLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import ItineraryForm from '../components/ItineraryForm';
import { useData } from '../../../shared/hooks/useData';
import { useToast } from '../../../shared/hooks/useToast';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Itinerary, UserRole, Permission } from '../../../shared/types';
import { hasPermission } from '../../../shared/utils/permissions';
import { EditIcon, DeleteIcon } from '../../../shared/components/icons/Icons';

const ItinerariesPage: React.FC = () => {
  const { user } = useAuth();
  const { itineraries, addItinerary, updateItinerary, deleteItinerary } = useData();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [itineraryToEdit, setItineraryToEdit] = useState<Itinerary | undefined>(undefined);
  const [itineraryToDelete, setItineraryToDelete] = useState<Itinerary | null>(null);
  
  const isAdmin = user?.roles.includes(UserRole.ADMIN);
  const canCreateItinerary = isAdmin || hasPermission(user, Permission.CREATE_ITINERARY);

  const filteredItineraries = useMemo(() => {
    return itineraries.filter(itinerary =>
      itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itinerary.destination.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, itineraries]);

  const handleOpenCreateModal = () => {
    setItineraryToEdit(undefined);
    setModalOpen(true);
  };

  const handleOpenEditModal = (itinerary: Itinerary) => {
    setItineraryToEdit(itinerary);
    setModalOpen(true);
  };

  const handleOpenConfirmModal = (itinerary: Itinerary) => {
    setItineraryToDelete(itinerary);
    setConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setItineraryToEdit(undefined);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setItineraryToDelete(null);
  };

  const handleFormSubmit = (itinerary: Itinerary) => {
    if (itinerary.id) {
      updateItinerary(itinerary);
      addToast('Itinerary updated successfully!', 'success');
    } else {
      addItinerary(itinerary);
      addToast('Itinerary created successfully!', 'success');
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    if (itineraryToDelete) {
      deleteItinerary(itineraryToDelete.id);
      addToast(`Itinerary "${itineraryToDelete.title}" deleted successfully.`, 'success');
      handleCloseConfirm();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Itineraries</h1>
          {canCreateItinerary && <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">Create New Itinerary</Button>}
        </div>

        <Card>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by title or destination..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full md:max-w-sm pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {filteredItineraries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredItineraries.map(it => (
                <Card key={it.id} className="overflow-hidden !p-0 flex flex-col group h-full">
                  <div className="relative">
                    <Link to={`/itinerary/${it.id}`} className="block">
                      <img src={it.imageUrl} alt={it.title} className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity" />
                    </Link>
                    {canCreateItinerary && (
                        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEditModal(it)} className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-primary hover:text-primary-dark">
                                <EditIcon />
                            </button>
                            <button onClick={() => handleOpenConfirmModal(it)} className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-red-600 hover:text-red-800">
                                <DeleteIcon />
                            </button>
                        </div>
                    )}
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <Link to={`/itinerary/${it.id}`} className="block">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{it.title}</h3>
                        <p className="text-sm text-gray-500">{it.destination}</p>
                    </Link>
                    {it.description && <p className="mt-2 text-sm text-gray-600 flex-grow">{it.description}</p>}
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                      <span className="text-xl font-bold text-primary">AED {it.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-600">{it.duration} days</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
                No itineraries found. Try adjusting your search or create a new one.
            </p>
          )}
        </Card>
      </div>

      {canCreateItinerary && (
        <>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={itineraryToEdit ? 'Edit Itinerary' : 'Create New Itinerary'}>
                <ItineraryForm onClose={handleCloseModal} onSubmit={handleFormSubmit} itineraryToEdit={itineraryToEdit} />
            </Modal>

            {itineraryToDelete && (
                <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={handleCloseConfirm}
                onConfirm={handleDelete}
                title="Delete Itinerary"
                message={`Are you sure you want to delete the itinerary "${itineraryToDelete.title}"? This action cannot be undone.`}
                />
            )}
        </>
      )}
    </DashboardLayout>
  );
};

export default ItinerariesPage;