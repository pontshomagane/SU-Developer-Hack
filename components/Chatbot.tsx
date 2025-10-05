
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatbotProps {
    onSubmit: (message: string, setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>) => Promise<void>;
}

const Chatbot: React.FC<ChatbotProps> = ({ onSubmit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([
        { sender: 'bot', text: 'Hi! I\'m AuraBot, your intelligent assistant. How can I help optimize your laundry experience today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        
        setIsLoading(true);
        await onSubmit(input, setHistory);
        setInput('');
        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-5 right-5 z-30">
            {isOpen && (
                <div className="w-80 h-[28rem] bg-white rounded-lg shadow-2xl flex flex-col animate-fade-in-up">
                    <div className="bg-brand-blue p-3 text-white rounded-t-lg">
                        <h3 className="font-bold text-center">AuraBot - Smart Assistant</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {history.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg ${msg.sender === 'user' ? 'bg-brand-light-blue text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-800 p-2 rounded-lg">
                                    <span className="animate-pulse">...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSubmit} className="p-3 border-t">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="bg-brand-blue text-white px-4 py-2 rounded-r-md hover:bg-brand-light-blue disabled:bg-gray-400"
                                disabled={isLoading}
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mt-2 w-16 h-16 bg-brand-blue rounded-full shadow-lg text-white flex items-center justify-center text-3xl hover:bg-brand-light-blue transition-transform transform hover:scale-110"
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default Chatbot;
