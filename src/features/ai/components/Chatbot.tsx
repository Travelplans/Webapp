import React, { useState, useEffect, useRef } from 'react';
import { chatWithAI } from '../../../services/api/aiService';
import { useData } from '../../../shared/hooks/useData';
import { ChatBubbleIcon, SparklesIcon } from '../../../shared/components/icons/Icons';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const Chatbot: React.FC = () => {
    const { itineraries } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize with welcome message
        setMessages([{ role: 'model', text: 'Hello! How can I help you plan your next adventure today?' }]);
    }, []);

    useEffect(() => {
        // Auto-scroll to the latest message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            // Build itinerary context
            const itineraryContext = itineraries.map(it => 
                `- Title: ${it.title}, Destination: ${it.destination}, Duration: ${it.duration} days, Price: AED ${it.price}, Description: ${it.description}`
            ).join('\n');

            // Add loading message
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            // Call API
            const response = await chatWithAI({
                message: currentInput,
                itineraryContext: itineraryContext || undefined,
            });

            // Update the last message with response
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = response.text;
                return newMessages;
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = 'Sorry, I encountered an error. Please try again.';
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark z-50"
                aria-label="Open travel assistant"
            >
                {isOpen ? (
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <ChatBubbleIcon className="w-8 h-8" />
                )}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[70vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-toast-in">
                    <header className="flex items-center justify-between p-4 bg-sidebar border-b border-gray-200">
                        <div className="flex items-center gap-2">
                             <SparklesIcon className="w-6 h-6 text-primary" />
                             <h2 className="text-lg font-bold text-gray-800">AI Travel Assistant</h2>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md lg:max-w-xs xl:max-w-sm rounded-xl px-4 py-2 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-800 rounded-xl px-4 py-3">
                                    <div className="flex items-center justify-center space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about destinations..."
                                className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isLoading}
                                aria-label="Chat message"
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center hover:bg-primary-dark disabled:bg-primary/50 transition-colors"
                                disabled={isLoading || !input.trim()}
                                aria-label="Send message"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;

