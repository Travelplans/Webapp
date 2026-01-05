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
import { hasPermissionSync as hasPermission } from '../../../shared/utils/permissions';
import { EditIcon, DeleteIcon } from '../../../shared/components/icons/Icons';

const ItinerariesPage: React.FC = () => {
  const { user } = useAuth();
  const { itineraries, addItinerary, updateItinerary, deleteItinerary } = useData();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debug: Log when itineraries change
  React.useEffect(() => {
    console.log('[ItinerariesPage] Itineraries updated:', {
      count: itineraries.length,
      itineraries: itineraries.map(it => ({
        id: it.id,
        title: it.title,
        destination: it.destination,
        hasImage: !!it.imageUrl
      }))
    });
  }, [itineraries]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [itineraryToEdit, setItineraryToEdit] = useState<Itinerary | undefined>(undefined);
  const [itineraryToDelete, setItineraryToDelete] = useState<Itinerary | null>(null);
  
  const isAdmin = user?.roles.includes(UserRole.ADMIN);
  const isAgent = user?.roles.includes(UserRole.AGENT);
  const canCreateItinerary = isAdmin || hasPermission(user, Permission.CREATE_ITINERARY);

  const filteredItineraries = useMemo(() => {
    console.log('[ItinerariesPage] Filtering itineraries:', {
      total: itineraries.length,
      searchQuery,
      isAdmin,
      isAgent,
      userId: user?.id,
      itineraryTitles: itineraries.map(it => it.title)
    });
    
    // Filter by role: Agents only see their assigned itineraries
    let roleFiltered = itineraries;
    if (isAgent && !isAdmin) {
      roleFiltered = itineraries.filter(it => {
        // Check new format (assignedAgentIds array)
        if (it.assignedAgentIds && Array.isArray(it.assignedAgentIds)) {
          return it.assignedAgentIds.includes(user?.id || '');
        }
        // Check old format (assignedAgentId) for backward compatibility
        return it.assignedAgentId === user?.id;
      });
      console.log('[ItinerariesPage] Agent filtered itineraries:', {
        total: itineraries.length,
        assigned: roleFiltered.length,
        assignedIds: roleFiltered.map(it => it.id)
      });
    }
    
    // Then filter by search query
    const filtered = roleFiltered.filter(itinerary => {
      if (!itinerary.title || !itinerary.destination) {
        console.warn('[ItinerariesPage] Itinerary missing required fields:', itinerary);
        return false;
      }
      return itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itinerary.destination.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    console.log('[ItinerariesPage] Filtered result:', {
      filtered: filtered.length,
      filteredTitles: filtered.map(it => it.title)
    });
    
    return filtered;
  }, [searchQuery, itineraries, isAdmin, isAgent, user?.id]);

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

  const handleFormSubmit = async (itinerary: Itinerary | Omit<Itinerary, 'id'>) => {
    try {
      console.log('[ItinerariesPage] Submitting itinerary:', { 
        isEdit: 'id' in itinerary && !!itinerary.id,
        hasTitle: !!itinerary.title,
        hasDestination: !!itinerary.destination 
      });
      
      if ('id' in itinerary && itinerary.id) {
        await updateItinerary(itinerary as Itinerary);
        addToast('Itinerary updated successfully!', 'success');
      } else {
        await addItinerary(itinerary as Omit<Itinerary, 'id'>);
        addToast('Itinerary created successfully!', 'success');
      }
      handleCloseModal();
    } catch (error) {
      console.error('[ItinerariesPage] Error saving itinerary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save itinerary';
      addToast(errorMessage, 'error');
    }
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
                      <img 
                        src={it.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070'} 
                        alt={it.title || 'Itinerary'} 
                        className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          // Fallback to default image if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070';
                        }}
                      />
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