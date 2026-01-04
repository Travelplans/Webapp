import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateItinerary, generateImage, GeneratedItinerary } from '../../../services/api/aiService';
import DashboardLayout from '../../../shared/components/DashboardLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { SparklesIcon, RefreshIcon } from '../../../shared/components/icons/Icons';
import { useData } from '../../../shared/hooks/useData';
import { useToast } from '../../../shared/hooks/useToast';

const GenerateItineraryPage: React.FC = () => {
    const navigate = useNavigate();
    const { addItinerary } = useData();
    const { addToast } = useToast();
    
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState('7');
    const [travelerType, setTravelerType] = useState('Couple');
    const [budget, setBudget] = useState('Mid-range');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedItinerary | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setGeneratedPlan(null);
        setGeneratedImage(null);
        setError(null);

        try {
            // 1. Generate Itinerary Text
            const plan = await generateItinerary({
                destination,
                duration,
                travelerType,
                budget,
            });

            setGeneratedPlan(plan);
            
            // 2. Generate Image
            await handleRegenerateImage(true);

        } catch (err) {
            console.error("AI generation failed:", err);
            let errorMessage = err instanceof Error ? err.message : "Failed to generate itinerary. Please try again.";
            
            // Provide helpful guidance for Cloud Function connection errors
            if (errorMessage.includes("Cannot connect to Cloud Function")) {
                errorMessage = `${errorMessage}\n\nTo fix this, deploy the Cloud Functions by running:\nnpm run deploy:functions\n\nSee DEPLOY_FUNCTIONS.md for detailed instructions.`;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateImage = async (isInitialGeneration = false) => {
        if (!destination) return;
        if (!isInitialGeneration) setIsRegeneratingImage(true);
        setError(null);

        try {
            const imageResponse = await generateImage({
                destination,
            });

            setGeneratedImage(imageResponse.imageUrl);
        } catch (err) {
            console.error("Image regeneration failed:", err);
            setError(err instanceof Error ? err.message : "Failed to regenerate the image. Please try again.");
        } finally {
            if (!isInitialGeneration) setIsRegeneratingImage(false);
        }
    };

    const handleSave = () => {
        if (!generatedPlan || !generatedImage) return;
        addItinerary({
            title: generatedPlan.title,
            destination: destination,
            duration: Number(duration),
            price: generatedPlan.price,
            description: generatedPlan.description,
            dailyPlan: generatedPlan.dailyPlan || [], // Save the full day-by-day plan
            imageUrl: generatedImage,
            collaterals: [],
        });
        addToast("Itinerary saved successfully!", "success");
        navigate("/itineraries");
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">AI Itinerary Generator</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
                                    <input type="text" id="destination" value={destination} onChange={e => setDestination(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" />
                                </div>
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (days)</label>
                                    <input type="number" id="duration" value={duration} onChange={e => setDuration(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" />
                                </div>
                                <div>
                                    <label htmlFor="travelerType" className="block text-sm font-medium text-gray-700">Traveler Type</label>
                                    <select id="travelerType" value={travelerType} onChange={e => setTravelerType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white">
                                        <option>Couple</option>
                                        <option>Family with kids</option>
                                        <option>Solo traveler</option>
                                        <option>Group of friends</option>
                                        <option>Adventure seeker</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget</label>
                                    <select id="budget" value={budget} onChange={e => setBudget(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white">
                                        <option>Budget</option>
                                        <option>Mid-range</option>
                                        <option>Luxury</option>
                                    </select>
                                </div>
                                <Button type="submit" disabled={isLoading || isRegeneratingImage} className="w-full inline-flex justify-center items-center gap-2">
                                    {isLoading ? (
                                        <> <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating... </>
                                    ) : (
                                        <> <SparklesIcon className="w-5 h-5"/> Generate Itinerary </>
                                    )}
                                </Button>
                            </form>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="min-h-full">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <SparklesIcon className="w-16 h-16 text-primary animate-pulse" />
                                    <p className="mt-4 text-lg font-semibold text-gray-700">Generating your itinerary...</p>
                                    <p className="mt-2 text-sm text-gray-500">This might take a moment. The AI is crafting the perfect trip!</p>
                                </div>
                            )}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
                                    <p className="text-red-800 font-semibold mb-2">Error generating itinerary:</p>
                                    <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
                                    {error.includes("Cannot connect to Cloud Function") && (
                                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="text-yellow-800 text-sm font-semibold mb-1">Quick Fix:</p>
                                            <code className="text-xs text-yellow-900 block bg-yellow-100 p-2 rounded">
                                                npm run deploy:functions
                                            </code>
                                            <p className="text-yellow-700 text-xs mt-2">
                                                See DEPLOY_FUNCTIONS.md for detailed deployment instructions.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {generatedPlan && (
                                <div className="space-y-6">
                                    {generatedImage && <img src={generatedImage} alt={generatedPlan.title} className="w-full h-64 object-cover rounded-lg shadow-md" />}
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900">{generatedPlan.title}</h2>
                                            <p className="text-lg text-gray-600">for {destination}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {generatedImage && (
                                                <Button onClick={() => handleRegenerateImage()} disabled={isLoading || isRegeneratingImage} variant="secondary" className="inline-flex justify-center items-center gap-2 !py-2 !px-3" >
                                                    {isRegeneratingImage ? (
                                                        <> <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span className="hidden sm:inline">Regenerating...</span></>
                                                    ) : (
                                                        <> <RefreshIcon className="w-5 h-5"/> <span className="hidden sm:inline">Regenerate Image</span> </>
                                                    )}
                                                </Button>
                                            )}
                                            <Button onClick={handleSave}>Save Itinerary</Button>
                                        </div>
                                    </div>
                                    <p className="text-gray-700">{generatedPlan.description}</p>
                                    {generatedPlan.dailyPlan && Array.isArray(generatedPlan.dailyPlan) && generatedPlan.dailyPlan.length > 0 && (
                                        <div className="border-t pt-4">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Plan</h3>
                                            <div className="space-y-4">
                                                {generatedPlan.dailyPlan.map((day, index) => (
                                                    <div key={day.day || index} className="p-4 bg-gray-50 rounded-lg">
                                                        <p className="font-bold text-primary">Day {day.day}: {day.title}</p>
                                                        <p className="mt-1 text-sm text-gray-600">{day.activities}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                             {!isLoading && !generatedPlan && !error && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <p className="text-lg text-gray-500">Your generated itinerary will appear here.</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GenerateItineraryPage;



