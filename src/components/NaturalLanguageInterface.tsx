import React, { useState } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { cloudProviderService } from '../services/cloudProviders';

interface NaturalLanguageInterfaceProps {
  activeProvider: string;
}

export function NaturalLanguageInterface({ activeProvider }: NaturalLanguageInterfaceProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([
    {
      type: 'system',
      message: `Welcome to CloudFlow! I can help you manage your ${activeProvider.toUpperCase()} resources using natural language. Try saying something like "Create a new virtual machine" or "Show me my storage usage".`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    const userMessage = {
      type: 'user',
      message: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setConversation(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await cloudProviderService.executeNaturalLanguageCommand(input, activeProvider);
      
      const aiResponse = {
        type: 'ai',
        message: response,
        timestamp: new Date().toLocaleTimeString(),
      };

      setConversation(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorResponse = {
        type: 'ai',
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setConversation(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add processing indicator to conversation
  const displayConversation = isProcessing 
    ? [...conversation, {
        type: 'ai',
        message: 'Processing your request...',
        timestamp: new Date().toLocaleTimeString(),
      }]
    : conversation;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Natural Language Interface</h2>
        <div className="text-sm text-gray-400">
          Provider: {activeProvider.toUpperCase()}
        </div>
      </div>

      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
        <div className="flex-1 p-6 overflow-auto space-y-4">
          {displayConversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.type === 'ai'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.type === 'user' ? 'You' : message.type === 'ai' ? 'CloudFlow AI' : 'System'}
                </div>
                <div className="text-sm">{message.message}</div>
                <div className="text-xs opacity-70 mt-2">{message.timestamp}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-700">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
                placeholder="Describe what you want to do with your cloud resources..."
                className="w-full bg-gray-700 text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setIsListening(!isListening)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                  isListening ? 'text-red-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isProcessing ? 'Processing...' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}