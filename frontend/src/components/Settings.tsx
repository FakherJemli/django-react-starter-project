import React, { useState, useEffect } from 'react';
import { AI_PROMPT_VISIBILITY_KEY } from './TextForm';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

// Local storage key for the OpenAI API key
const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key';

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);

    // Check if API key already exists in localStorage
    const hasApiKey = !!localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
    
    // Check if AI prompt is currently hidden
    const isPromptHidden = localStorage.getItem(AI_PROMPT_VISIBILITY_KEY) === 'false';
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            // Store API key in localStorage
            localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, apiKey);
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 1500);
        }
    };
    
    const handleShowPrompt = () => {
        // Use the global function to show the prompt
        window.toggleAIPrompt();
        onClose();
    };

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setApiKey('');
            setSaved(false);
        }
    }, [isOpen]);

    // If modal is closed, don't render anything
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="openai-api-key" className="block text-sm font-medium text-gray-700 mb-1">
                            OpenAI API Key
                        </label>
                        <input
                            id="openai-api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={hasApiKey ? "••••••••••••••••••••••" : "Enter your OpenAI API key"}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            {hasApiKey 
                                ? "API key is saved in your browser. Enter a new key to update." 
                                : "Your API key is required for thought analysis. It will be stored only in your browser."}
                        </p>
                        {saved && (
                            <p className="mt-2 text-sm text-green-600">
                                API key saved successfully!
                            </p>
                        )}
                    </div>
                    
                    {/* Show AI Prompt link (only if prompt is hidden and API key exists) */}
                    {isPromptHidden && hasApiKey && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleShowPrompt}
                                className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Show Thought Analysis</span>
                            </button>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!apiKey.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings; 