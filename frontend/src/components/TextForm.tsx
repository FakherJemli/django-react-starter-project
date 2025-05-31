import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '../api/client';
import { TextEntry } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { hasOpenAIApiKey, getThoughtAnalysis } from '../api/openai';

// Local storage key for the AI prompt visibility
export const AI_PROMPT_VISIBILITY_KEY = 'ai_prompt_visibility';
// Local storage key for entry counter
export const ENTRY_COUNTER_KEY = 'entry_counter';
// Local storage key for analysis threshold
export const ANALYSIS_THRESHOLD_KEY = 'analysis_threshold';
// Default number of entries before auto-analysis
export const DEFAULT_ANALYSIS_THRESHOLD = 5;

// Add type declaration for the global window object
declare global {
  interface Window {
    toggleAIPrompt: () => void;
    setAnalysisThreshold?: (value: number) => void;
  }
}

export const TextForm = () => {
    const [content, setContent] = useState('');
    const [thoughtPrompt, setThoughtPrompt] = useState<string | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    
    // Initialize entryCounter from localStorage or default to 0
    const [entryCounter, setEntryCounter] = useState(() => {
        const savedCounter = localStorage.getItem(ENTRY_COUNTER_KEY);
        return savedCounter ? parseInt(savedCounter, 10) : 0;
    });
    
    // Initialize analysisThreshold from localStorage or default to DEFAULT_ANALYSIS_THRESHOLD
    const [analysisThreshold, setAnalysisThreshold] = useState(() => {
        const savedThreshold = localStorage.getItem(ANALYSIS_THRESHOLD_KEY);
        return savedThreshold ? parseInt(savedThreshold, 10) : DEFAULT_ANALYSIS_THRESHOLD;
    });
    
    // Initialize showPrompt from localStorage or default to true
    const [showPrompt, setShowPrompt] = useState(() => {
        const savedVisibility = localStorage.getItem(AI_PROMPT_VISIBILITY_KEY);
        return savedVisibility ? savedVisibility === 'true' : true;
    });
    
    const queryClient = useQueryClient();
    const { logout } = useAuth();

    // Check if OpenAI API key is set in localStorage
    const [hasApiKey, setHasApiKey] = useState(hasOpenAIApiKey());

    // Update localStorage when showPrompt changes
    useEffect(() => {
        localStorage.setItem(AI_PROMPT_VISIBILITY_KEY, String(showPrompt));
    }, [showPrompt]);
    
    // Update localStorage when entryCounter changes
    useEffect(() => {
        localStorage.setItem(ENTRY_COUNTER_KEY, String(entryCounter));
    }, [entryCounter]);
    
    // Update localStorage when analysisThreshold changes
    useEffect(() => {
        localStorage.setItem(ANALYSIS_THRESHOLD_KEY, String(analysisThreshold));
    }, [analysisThreshold]);
    
    // Expose setAnalysisThreshold to window for global configuration
    useEffect(() => {
        window.setAnalysisThreshold = (value: number) => {
            if (value > 0) {
                setAnalysisThreshold(value);
                console.log(`Analysis threshold updated to ${value} entries`);
            }
        };
        
        return () => {
            delete window.setAnalysisThreshold;
        };
    }, []);

    const { data: entries, isLoading } = useQuery({
        queryKey: ['entries'],
        queryFn: async () => {
            try {
                const response = await client.get<TextEntry[]>('/entries/');
                // The backend already limits to 5, but we ensure it here as well
                return response.data.slice(0, 5);
            } catch (error) {
                if (error instanceof AxiosError && error.response?.status === 401) {
                    logout();
                }
                throw error;
            }
        }
    });

    const mutation = useMutation({
        mutationFn: (newContent: string) =>
            client.post('/entries/create/', { content: newContent }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            setContent('');
            
            // Increment entry counter
            const newCounter = entryCounter + 1;
            setEntryCounter(newCounter);
            
            // Only analyze after threshold number of entries
            if (hasApiKey && newCounter >= analysisThreshold) {
                fetchThoughtAnalysis();
                setEntryCounter(0); // Reset counter after analysis
                setShowPrompt(true); // Show the prompt
            }
        }
    });

    // Fetch thought analysis when component mounts if API key exists and entries are available
    useEffect(() => {
        if (hasApiKey && entries && entries.length > 0 && !thoughtPrompt) {
            fetchThoughtAnalysis();
        }
    }, [hasApiKey, entries?.length, thoughtPrompt]);

    // Check for API key changes
    useEffect(() => {
        const checkApiKey = () => {
            const apiKeyExists = hasOpenAIApiKey();
            setHasApiKey(apiKeyExists);
        };

        // Check when component mounts
        checkApiKey();

        // Setup an interval to check periodically
        const interval = setInterval(checkApiKey, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRefreshPrompt = () => {
        if (hasApiKey && entries && entries.length > 0) {
            fetchThoughtAnalysis();
            setEntryCounter(0); // Reset counter after manual refresh
        }
    };

    const fetchThoughtAnalysis = async () => {
        try {
            setIsAnalysisLoading(true);
            const prompt = await getThoughtAnalysis();
            setThoughtPrompt(prompt);
        } catch (error) {
            console.error('Failed to get thought analysis:', error);
            setThoughtPrompt('Unable to analyze thoughts. Please check your API key.');
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            mutation.mutate(content);
        }
    };

    // Public function to toggle prompt visibility
    window.toggleAIPrompt = () => {
        setShowPrompt(true);
        if (hasApiKey && entries && entries.length > 0 && !thoughtPrompt) {
            fetchThoughtAnalysis();
        }
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-md p-6">
            {/* AI Thought Prompt Floating Cloud */}
            {hasApiKey && showPrompt && (thoughtPrompt || isAnalysisLoading) && (
                <div className="relative mb-6">
                    <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-200 rounded-full"></div>
                    <div className="absolute -top-4 left-3 w-4 h-4 bg-blue-200 rounded-full"></div>
                    <div className="absolute -top-1 left-8 w-2 h-2 bg-blue-200 rounded-full"></div>
                    <div className="bg-blue-100 rounded-xl p-4 shadow-md relative border border-blue-200">
                        {/* Close button */}
                        <button 
                            onClick={() => setShowPrompt(false)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 rounded-full w-6 h-6 flex items-center justify-center"
                            aria-label="Close prompt"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        {/* Prompt content */}
                        <div className="p-1">
                            {isAnalysisLoading ? (
                                <div className="flex items-center space-x-2 py-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"/>
                                    <span className="text-sm text-blue-700">Analyzing your thoughts...</span>
                                </div>
                            ) : (
                                <p className="text-blue-700 text-sm italic py-2">
                                    {thoughtPrompt || "Start writing to get personalized prompts."}
                                </p>
                            )}
                        </div>
                        
                        {/* Refresh button */}
                        <button 
                            onClick={handleRefreshPrompt}
                            className="absolute bottom-1 right-1 text-blue-500 hover:text-blue-700 rounded-full w-6 h-6 flex items-center justify-center"
                            aria-label="Refresh prompt"
                            disabled={isAnalysisLoading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        
                        {/* Entries counter indicator - subtle visual indicator */}
                        {entryCounter > 0 && (
                            <div className="absolute bottom-1 left-1 flex items-center space-x-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 opacity-60"></div>
                                <div className={`text-xs text-blue-500 opacity-60`}>
                                    {entryCounter}/{analysisThreshold}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="w-full">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="What's on your mind?"
                    />
                </div>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {mutation.isPending ? 'expressing...' : 'Express'}
                </button>
            </form>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"/>
                </div>
            ) : (
                <>
                    <div className="mt-8 space-y-4">
                        {entries?.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No entries yet. Start writing your thoughts above.
                            </div>
                        ) : (
                            entries?.map(entry => (
                                <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-800 mb-2">{entry.content}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(entry.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Logout button */}
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <Link
                            to="/logout"
                            className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Sign Out
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default TextForm;