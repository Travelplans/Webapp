import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { ItineraryCollateral, CollateralType } from '../types';
import DashboardLayout from '../components/shared/DashboardLayout';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { DownloadIcon, PdfFileIcon, DocFileIcon, PptFileIcon, ImageIcon, VideoIcon, GenericFileIcon } from '../components/shared/icons/Icons';

const ItineraryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { itineraries, users } = useData();
  const itinerary = itineraries.find(it => it.id === id);
  const agent = users.find(user => user.id === itinerary?.assignedAgentId);

  const getCollateralIcon = (type: CollateralType) => {
    const wrapperClass = "flex items-center justify-center w-10 h-10 rounded-lg";
    const iconClass = "w-6 h-6 text-white";

    switch (type) {
      case CollateralType.PDF:
        return <div className={`${wrapperClass} bg-red-500`}><PdfFileIcon className={iconClass} /></div>;
      case CollateralType.DOCX:
        return <div className={`${wrapperClass} bg-blue-500`}><DocFileIcon className={iconClass} /></div>;
      case CollateralType.PPTX:
          return <div className={`${wrapperClass} bg-orange-500`}><PptFileIcon className={iconClass} /></div>;
      case CollateralType.IMAGE:
        return <div className={`${wrapperClass} bg-purple-500`}><ImageIcon className={iconClass} /></div>;
      case CollateralType.VIDEO:
        return <div className={`${wrapperClass} bg-green-500`}><VideoIcon className={iconClass} /></div>;
      default:
        return <div className={`${wrapperClass} bg-gray-500`}><GenericFileIcon className={iconClass} /></div>;
    }
  };
  
  const handleDownload = (collateral: ItineraryCollateral) => {
    const fileContent = `This is a mock collateral document for ${collateral.name}.\n\nType: ${collateral.type}\nStatus: ${collateral.approved ? 'Approved' : 'Pending'}`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', collateral.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!itinerary) {
    return (
      <DashboardLayout>
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Itinerary Not Found</h2>
            <p className="mt-2 text-gray-600">The itinerary you are looking for does not exist.</p>
            <Link to="/" className="mt-6 inline-block">
                <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Link to="/itineraries" className="text-sm font-medium text-primary hover:text-primary-dark inline-flex items-center">
            &larr; Back to Itineraries
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-3">
            <Card className="!p-0 overflow-hidden">
                <div className="overflow-hidden">
                  <img 
                    src={itinerary.imageUrl} 
                    alt={itinerary.title} 
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-500 ease-in-out hover:scale-110" 
                  />
                </div>
                <div className="p-6">
                    <h1 className="text-4xl font-extrabold text-gray-900">{itinerary.title}</h1>
                    <p className="mt-2 text-lg text-gray-600">{itinerary.destination}</p>
                    
                    {itinerary.description && (
                        <p className="mt-4 text-gray-700">{itinerary.description}</p>
                    )}
                    
                    <div className="mt-6 flex justify-between items-center text-gray-800 border-t pt-6 border-gray-200">
                        <span className="text-2xl font-bold text-primary">AED {itinerary.price.toLocaleString()}</span>
                        <span className="text-lg font-medium">{itinerary.duration} Days</span>
                    </div>

                    <div className="mt-6 border-t pt-6 border-gray-200">
                        {agent ? (
                          <div>
                            <p className="text-sm text-gray-500">Managed by</p>
                            <p className="text-lg font-semibold text-gray-900">{agent.name}</p>
                          </div>
                        ) : (
                           <p className="text-md text-gray-500 italic">This itinerary is currently unassigned.</p>
                        )}
                    </div>
                </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Collateral Materials</h2>
              {itinerary.collaterals.length > 0 ? (
                <ul className="space-y-3">
                  {itinerary.collaterals.map((collateral: ItineraryCollateral) => (
                    <li key={collateral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-4">
                        {getCollateralIcon(collateral.type)}
                        <span className="font-medium text-gray-700 truncate">{collateral.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            collateral.approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {collateral.approved ? 'Approved' : 'Pending'}
                        </span>
                        <button
                           onClick={() => handleDownload(collateral)}
                           disabled={!collateral.approved}
                           className={`p-2 rounded-md transition-colors ${
                            collateral.approved 
                            ? 'bg-blue-100 text-primary hover:bg-blue-200' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                           }`}
                           title={collateral.approved ? `Download ${collateral.name}` : 'Approval pending'}
                        >
                          <DownloadIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">No collateral materials available for this itinerary.</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ItineraryDetailPage;