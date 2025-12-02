import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import DashboardLayout from '../components/shared/DashboardLayout';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { SparklesIcon, RefreshIcon } from '../components/shared/icons/Icons';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

interface GeneratedPlan {
  title: string;
  price: number;
  description: string;
  dailyPlan: {
    day: number;
    title: string;
    activities: string;
  }[];
}

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
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setGeneratedPlan(null);
        setGeneratedImage(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // 1. Generate Itinerary Text
            const prompt = `Create a detailed travel itinerary for a ${duration}-day trip to ${destination} for a ${travelerType} on a ${budget} budget. Provide a catchy title, an estimated price for one person in AED, a compelling one-paragraph summary of the trip, and a day-by-day plan. Each day should have a title and a paragraph describing the activities.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    price: { type: Type.INTEGER, description: "Estimated price for one person in AED, based on the budget." },
                    description: { type: Type.STRING, description: "A compelling one-paragraph summary of the trip." },
                    dailyPlan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.INTEGER },
                                title: { type: Type.STRING },
                                activities: { type: Type.STRING },
                            },
                        },
                    },
                },
            };
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema,
                },
            });

            const plan: GeneratedPlan = JSON.parse(response.text);
            setGeneratedPlan(plan);
            
            // 2. Generate Image
            await handleRegenerateImage(true);

        } catch (err) {
            console.error("AI generation failed:", err);
            setError("Failed to generate itinerary. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateImage = async (isInitialGeneration = false) => {
        if (!destination) return;
        if (!isInitialGeneration) setIsRegeneratingImage(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `A scenic, high-quality, vibrant photograph representing a travel destination: ${destination}. No text or people.`,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '16:9',
                },
            });

            if (imageResponse.generatedImages?.length > 0) {
                const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
                setGeneratedImage(`data:image/jpeg;base64,${base64ImageBytes}`);
            } else {
                throw new Error("AI failed to return an image.");
            }
        } catch (err) {
            console.error("Image regeneration failed:", err);
            setError("Failed to regenerate the image. Please try again.");
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
                                    <input type="text" id="destination" value={destination} onChange={e => setDestination(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (days)</label>
                                    <input type="number" id="duration" value={duration} onChange={e => setDuration(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="travelerType" className="block text-sm font-medium text-gray-700">Traveler Type</label>
                                    <select id="travelerType" value={travelerType} onChange={e => setTravelerType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                        <option>Couple</option>
                                        <option>Family with kids</option>
                                        <option>Solo traveler</option>
                                        <option>Group of friends</option>
                                        <option>Adventure seeker</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget</label>
                                    <select id="budget" value={budget} onChange={e => setBudget(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
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
                            {error && <p className="text-red-500 text-center my-4">{error}</p>}
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
                                    <div className="border-t pt-4">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Plan</h3>
                                        <div className="space-y-4">
                                            {generatedPlan.dailyPlan.map(day => (
                                                <div key={day.day} className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="font-bold text-primary">Day {day.day}: {day.title}</p>
                                                    <p className="mt-1 text-sm text-gray-600">{day.activities}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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