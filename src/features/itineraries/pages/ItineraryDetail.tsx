import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../../shared/hooks/useData';
import { ItineraryCollateral, CollateralType } from '../../../shared/types';
import DashboardLayout from '../../../shared/components/DashboardLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { DownloadIcon, PdfFileIcon, DocFileIcon, PptFileIcon, ImageIcon, VideoIcon, GenericFileIcon } from '../../../shared/components/icons/Icons';

const ItineraryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { itineraries, users } = useData();
  const itinerary = itineraries.find(it => it.id === id);
  
  // Get assigned agents (support both old and new format)
  const assignedAgents = React.useMemo(() => {
    if (!itinerary) return [];
    if (itinerary.assignedAgentIds && Array.isArray(itinerary.assignedAgentIds)) {
      return users.filter(user => itinerary.assignedAgentIds!.includes(user.id));
    } else if (itinerary.assignedAgentId) {
      const agent = users.find(user => user.id === itinerary.assignedAgentId);
      return agent ? [agent] : [];
    }
    return [];
  }, [itinerary, users]);

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
    if (!collateral.url) {
      console.warn('No URL available for collateral:', collateral.name);
      return;
    }
    
    // If it's a data URL, convert it to a blob and download
    if (collateral.url.startsWith('data:')) {
      try {
        // Extract the base64 data and mime type from data URL
        const [header, data] = collateral.url.split(',');
        const mimeMatch = header.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        
        // Convert base64 to binary
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Determine file extension from mime type or use collateral type
        let extension = '';
        if (mimeType.includes('pdf')) extension = '.pdf';
        else if (mimeType.includes('word') || mimeType.includes('document')) extension = '.docx';
        else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) extension = '.pptx';
        else if (mimeType.includes('image')) extension = mimeType.includes('png') ? '.png' : '.jpg';
        else if (mimeType.includes('video')) extension = '.mp4';
        
        link.setAttribute('download', collateral.name + extension);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        // Fallback: open in new window
        window.open(collateral.url, '_blank');
      }
    } else {
      // Regular URL - open in new window
      window.open(collateral.url, '_blank');
    }
  };
  
  const handleView = (collateral: ItineraryCollateral) => {
    if (!collateral.url) {
      console.warn('No URL available for collateral:', collateral.name);
      return;
    }
    
    // If it's a data URL, convert it to a blob and open in new window
    if (collateral.url.startsWith('data:')) {
      try {
        // Extract the base64 data and mime type from data URL
        const [header, data] = collateral.url.split(',');
        const mimeMatch = header.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        
        // Convert base64 to binary
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        // Open blob URL in new window
        const newWindow = window.open(blobUrl, '_blank');
        if (newWindow) {
          // Clean up blob URL after a delay to allow the window to load
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } else {
          // If popup blocked, fall back to download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        }
      } catch (error) {
        console.error('Error viewing file:', error);
        // Fallback: try to open original URL
        window.open(collateral.url, '_blank');
      }
    } else {
      // Regular URL - open in new window/tab
      window.open(collateral.url, '_blank');
    }
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
                    
                    {/* Display Daily Plan if available */}
                    {itinerary.dailyPlan && Array.isArray(itinerary.dailyPlan) && itinerary.dailyPlan.length > 0 && (
                        <div className="mt-6 border-t pt-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Day-by-Day Itinerary</h3>
                            <div className="space-y-4">
                                {itinerary.dailyPlan.map((day, index) => (
                                    <div key={day.day || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <h4 className="font-bold text-lg text-primary mb-2">Day {day.day}: {day.title}</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{day.activities}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-6 flex justify-between items-center text-gray-800 border-t pt-6 border-gray-200">
                        <span className="text-2xl font-bold text-primary">AED {itinerary.price.toLocaleString()}</span>
                        <span className="text-lg font-medium">{itinerary.duration} Days</span>
                    </div>

                    <div className="mt-6 border-t pt-6 border-gray-200">
                        {assignedAgents.length > 0 ? (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">
                              {assignedAgents.length === 1 ? 'Managed by' : 'Managed by'}
                            </p>
                            <div className="space-y-1">
                              {assignedAgents.map(agent => (
                                <p key={agent.id} className="text-lg font-semibold text-gray-900">
                                  {agent.name}
                                </p>
                              ))}
                            </div>
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
                    <li key={collateral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 gap-3">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        {getCollateralIcon(collateral.type)}
                        <span className="font-medium text-gray-700 truncate">{collateral.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            collateral.approved && collateral.url
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {collateral.approved && collateral.url ? 'Active/Uploaded' : 'Pending'}
                        </span>
                        {collateral.url && (
                          <>
                            <button
                               onClick={() => handleView(collateral)}
                               className="p-2 rounded-md transition-colors bg-blue-100 text-primary hover:bg-blue-200 flex-shrink-0"
                               title={`View ${collateral.name}`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                               onClick={() => handleDownload(collateral)}
                               className="p-2 rounded-md transition-colors bg-blue-100 text-primary hover:bg-blue-200 flex-shrink-0"
                               title={`Download ${collateral.name}`}
                            >
                              <DownloadIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
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