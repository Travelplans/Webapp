import React, { useState, useEffect, useMemo } from 'react';
import { Itinerary, UserRole, ItineraryCollateral, CollateralType } from '../../../shared/types';
import { useData } from '../../../shared/hooks/useData';
import Button from '../../../shared/components/Button';
import { ImageIcon, DeleteIcon, FilePlusIcon, SparklesIcon } from '../../../shared/components/icons/Icons';
import { generateImage } from '../../../services/api/aiService';
import { useToast } from '../../../shared/hooks/useToast';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';

// Helper function to convert file to Base64 data URL
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

interface ItineraryFormProps {
  onClose: () => void;
  onSubmit: (itinerary: Omit<Itinerary, 'id'> | Itinerary) => void;
  itineraryToEdit?: Itinerary;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({ onClose, onSubmit, itineraryToEdit }) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(7);
  const [price, setPrice] = useState(1000);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Stores data URL
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [assignedAgentIds, setAssignedAgentIds] = useState<string[]>([]);
  const [collaterals, setCollaterals] = useState<ItineraryCollateral[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [uploadSuccess, setUploadSuccess] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // AI Image Generation State
  const [imageSourceTab, setImageSourceTab] = useState<'upload' | 'ai'>('upload');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { users } = useData();
  const { addToast } = useToast();
  const agents = useMemo(() => {
    if (!users || users.length === 0) return [];
    return users.filter(u => u.roles.includes(UserRole.AGENT));
  }, [users]);

  useEffect(() => {
    if (itineraryToEdit) {
      setTitle(itineraryToEdit.title);
      setDestination(itineraryToEdit.destination);
      setDuration(itineraryToEdit.duration);
      setPrice(itineraryToEdit.price);
      setDescription(itineraryToEdit.description || '');
      setImageUrl(itineraryToEdit.imageUrl || '');
      setImagePreview(itineraryToEdit.imageUrl || null);
      // Support both old (assignedAgentId) and new (assignedAgentIds) format
      if (itineraryToEdit.assignedAgentIds && Array.isArray(itineraryToEdit.assignedAgentIds)) {
        setAssignedAgentIds(itineraryToEdit.assignedAgentIds);
      } else if (itineraryToEdit.assignedAgentId) {
        // Migrate from old format to new format
        setAssignedAgentIds([itineraryToEdit.assignedAgentId]);
      } else {
        setAssignedAgentIds([]);
      }
      setCollaterals(itineraryToEdit.collaterals || []);
    } else {
        // Reset form for creation
        setTitle('');
        setDestination('');
        setDuration(7);
        setPrice(1000);
        setDescription('');
        setImageUrl('');
        setImagePreview(null);
        setAssignedAgentIds([]);
        setCollaterals([]);
    }
  }, [itineraryToEdit]);

  useEffect(() => {
    setAiPrompt(`A scenic, high-quality, vibrant photograph of ${destination || 'this travel destination'}. No text or people.`);
  }, [destination]);


  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const dataUrl = await toBase64(file);
      setImageUrl(dataUrl);
      setImagePreview(dataUrl);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const dataUrl = await toBase64(file);
        setImageUrl(dataUrl);
        setImagePreview(dataUrl);
      }
    }
  };
  
  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview(null);
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      addToast("Please enter a prompt for the image.", "error");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await generateImage({ prompt: aiPrompt });

      if (response.imageUrl) {
        setImageUrl(response.imageUrl);
        setImagePreview(response.imageUrl);
        addToast("Image generated successfully!", "success");
      } else {
        throw new Error("AI failed to return an image.");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      addToast(error instanceof Error ? error.message : "Failed to generate image. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCollateral = () => {
    setCollaterals([
        ...collaterals, 
        { 
            id: `new-${Date.now()}`, 
            name: '', 
            type: CollateralType.PDF, 
            url: '', 
            approved: false 
        }
    ]);
  };

  const handleRemoveCollateral = (index: number) => {
    setCollaterals(collaterals.filter((_, i) => i !== index));
  };
  
  const handleCollateralChange = (index: number, field: keyof ItineraryCollateral, value: string | CollateralType) => {
    const newCollaterals = [...collaterals];
    // Using 'any' for type flexibility, but it's safe within this controlled component
    (newCollaterals[index] as any)[field] = value;
    setCollaterals(newCollaterals);
  };

  const handleCollateralFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileInput = e.target;
      
      // Reset success state for this index
      setUploadSuccess(prev => ({ ...prev, [index]: false }));
      
      try {
        // Upload to Firebase Storage and store ONLY the URL in Firestore.
        // Storing base64 data URLs in Firestore frequently exceeds the 1MB document limit.
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));

        const collateralId = collaterals[index]?.id || `new-${Date.now()}`;
        const safeName = file.name.replace(/[^\w.\-() ]/g, '_');
        const itineraryFolder = itineraryToEdit?.id ? `itineraries/${itineraryToEdit.id}` : `itineraries/_draft`;
        const storagePath = `${itineraryFolder}/collaterals/${collateralId}_${Date.now()}_${safeName}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        const downloadUrl: string = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(prev => ({ ...prev, [index]: pct }));
            },
            (err) => reject(err),
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              } catch (err) {
                reject(err);
              }
            }
          );
        });
        
        const newCollaterals = [...collaterals];
        newCollaterals[index] = { 
            ...newCollaterals[index], 
            url: downloadUrl, 
            name: newCollaterals[index].name || file.name,
            approved: true // Set as approved/active when file is uploaded
        };
        setCollaterals(newCollaterals);
        
        // Show success indicator
        setUploadSuccess(prev => ({ ...prev, [index]: true }));
        addToast(`File "${file.name}" uploaded successfully!`, 'success');
        
        // Reset file input to allow re-uploading
        if (fileInput) {
          fileInput.value = '';
        }
        
        // Clear progress after 2 seconds
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[index];
            return newProgress;
          });
        }, 2000);
      } catch (error) {
        console.error('[ItineraryForm] Collateral upload failed:', error);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
        });
        // Reset file input on error too
        if (fileInput) {
          fileInput.value = '';
        }
        addToast(error instanceof Error ? error.message : 'Failed to upload file. Please try again.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Determine final image URL
      const finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070';
      
      if (itineraryToEdit) {
        // Editing existing itinerary
        const itineraryData: any = {
          id: itineraryToEdit.id,
          title,
          destination,
          duration,
          price,
          description: description || '',
          imageUrl: finalImageUrl,
          collaterals: collaterals || [],
        };
        
        // Preserve dailyPlan if it exists (for AI-generated itineraries)
        if (itineraryToEdit.dailyPlan && Array.isArray(itineraryToEdit.dailyPlan)) {
          itineraryData.dailyPlan = itineraryToEdit.dailyPlan;
        }
        
        // Always include assignedAgentIds so clearing assignments is persisted
        itineraryData.assignedAgentIds = assignedAgentIds;
        // Backward-compat: clear old single field if present
        itineraryData.assignedAgentId = undefined;
        
        await onSubmit(itineraryData as Itinerary);
        setIsSaving(false);
        addToast('Itinerary updated successfully!', 'success');
        // Parent component will handle closing modal
      } else {
        // Creating new itinerary - explicitly exclude id
        const itineraryData: any = {
          title,
          destination,
          duration,
          price,
          description: description || '',
          imageUrl: finalImageUrl,
          collaterals: collaterals || [],
        };
        
        // Include assignedAgentIds if any agents are selected
        if (assignedAgentIds.length > 0) {
          itineraryData.assignedAgentIds = assignedAgentIds;
        }
        
        // Explicitly ensure id is not included
        delete itineraryData.id;
        
        // Remove any undefined values
        Object.keys(itineraryData).forEach(key => {
          if (itineraryData[key] === undefined || itineraryData[key] === null) {
            delete itineraryData[key];
          }
        });
        
        await onSubmit(itineraryData as Omit<Itinerary, 'id'>);
        setIsSaving(false);
        addToast('Itinerary created successfully!', 'success');
        // Parent component will handle closing modal
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      setIsSaving(false);
      addToast('Failed to save itinerary. Please try again.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" />
      </div>
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
        <input type="text" id="destination" value={destination} onChange={e => setDestination(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" />
      </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (days)</label>
            <input type="number" id="duration" value={duration} onChange={e => setDuration(Number(e.target.value))} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" />
        </div>
        <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (AED)</label>
            <input type="number" id="price" value={price} onChange={e => setPrice(Number(e.target.value))} required min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        {imagePreview ? (
            <div className="mt-1 relative">
                <img src={imagePreview} alt="Itinerary preview" className="w-full h-48 object-cover rounded-md" />
                <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-white/70 p-1 rounded-full text-red-600 hover:bg-white shadow-md"
                >
                    <DeleteIcon className="w-5 h-5" />
                </button>
            </div>
        ) : (
          <>
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg my-2">
                <button type="button" onClick={() => setImageSourceTab('upload')} className={`w-full px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${imageSourceTab === 'upload' ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-white/70'}`}>
                    Upload Image
                </button>
                <button type="button" onClick={() => setImageSourceTab('ai')} className={`w-full px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${imageSourceTab === 'ai' ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-white/70'}`}>
                    Generate with AI
                </button>
            </div>
            
            {imageSourceTab === 'upload' && (
                 <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                >
                    <div className="space-y-1 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <label
                                htmlFor="image-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
                            >
                                <span>Upload an image</span>
                                <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageFileChange} accept="image/png, image/jpeg" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                    </div>
                </div>
            )}
            
            {imageSourceTab === 'ai' && (
                <div className="mt-1 space-y-3 p-4 border-2 border-gray-300 border-dashed rounded-md">
                    <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700">Image Prompt</label>
                    <textarea 
                        id="ai-prompt" 
                        rows={3} 
                        value={aiPrompt} 
                        onChange={e => setAiPrompt(e.target.value)} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="e.g., A beautiful beach in Bali with turquoise water and a sunset."
                    />
                    <Button type="button" onClick={handleGenerateImage} disabled={isGenerating} className="w-full inline-flex justify-center items-center gap-2">
                        {isGenerating ? (
                           <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</>
                        ) : (
                           <><SparklesIcon className="w-5 h-5"/> Generate Image</>
                        )}
                    </Button>
                </div>
            )}
        </>
        )}
        <p className="mt-1 text-xs text-gray-500">
            Recommended: 16:9 aspect ratio (e.g., 1200x675px). Formats: PNG, JPG.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Agents</label>
        <div className="mt-1 border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto bg-white">
          <div className="mb-2 pb-2 border-b border-gray-200">
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={agents.length > 0 && assignedAgentIds.length === agents.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAssignedAgentIds(agents.map(a => a.id));
                  } else {
                    setAssignedAgentIds([]);
                  }
                }}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>
          </div>
          <div className="space-y-2">
            {agents.length > 0 ? (
              agents.map(agent => (
                <label
                  key={agent.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={assignedAgentIds.includes(agent.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignedAgentIds([...assignedAgentIds, agent.id]);
                      } else {
                        setAssignedAgentIds(assignedAgentIds.filter(id => id !== agent.id));
                      }
                    }}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{agent.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No agents available</p>
            )}
          </div>
        </div>
        {assignedAgentIds.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {assignedAgentIds.length} agent{assignedAgentIds.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

       <div>
        <label className="block text-sm font-medium text-gray-700">Collateral Materials</label>
        <p className="mt-1 text-xs text-gray-500">
            Supported formats: PDF, DOCX, etc.
        </p>
        <div className="mt-2 space-y-2">
            {collaterals.map((collateral, index) => (
                <div key={collateral.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <input
                        type="text"
                        placeholder="Collateral Name"
                        value={collateral.name}
                        onChange={(e) => handleCollateralChange(index, 'name', e.target.value)}
                        className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                        value={collateral.type}
                        onChange={(e) => handleCollateralChange(index, 'type', e.target.value as CollateralType)}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                    >
                        {Object.values(CollateralType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <div className="flex flex-col items-end gap-2">
                        <label htmlFor={`collateral-upload-${index}`} className="cursor-pointer">
                            <div className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md shadow-sm text-sm font-medium inline-flex items-center border border-green-700">
                               <FilePlusIcon className="w-5 h-5 mr-1" />
                               <span>{collateral.url ? 'Change' : 'Upload'}</span>
                            </div>
                            <input
                                id={`collateral-upload-${index}`}
                                type="file"
                                className="sr-only"
                                onChange={(e) => handleCollateralFileChange(e, index)}
                            />
                        </label>
                        {uploadProgress[index] !== undefined && (
                            <div className="w-32">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-green-600 transition-all duration-300"
                                        style={{ width: `${uploadProgress[index]}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-600 mt-1 text-center">{uploadProgress[index]}%</p>
                            </div>
                        )}
                        {uploadSuccess[index] && (
                            <div className="flex items-center gap-1 text-green-600 text-xs">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Uploaded</span>
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={() => handleRemoveCollateral(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50">
                        <DeleteIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
        <Button type="button" onClick={handleAddCollateral} variant="secondary" className="mt-2 !text-sm !py-1">
            + Add Collateral
        </Button>
      </div>

      <div className="pt-5 flex justify-end space-x-3">
        <button type="button" onClick={onClose} disabled={isSaving} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            itineraryToEdit ? 'Save Changes' : 'Create Itinerary'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ItineraryForm;