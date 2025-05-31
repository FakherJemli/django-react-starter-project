import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { client } from '../api/client';
import axios from "axios";
import introspectLogo from '../assets/introspect-logo.svg';

export const Login = () => {
    const { login } = useAuth();

    const googleLogin = useGoogleLogin({
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            try {
                const response = await client.post('/auth/google/', {
                    access_token: tokenResponse.access_token
                });

                if (response.data.access) {
                    login(response.data.access, response.data.refresh);
                }
            } catch (error) {
                console.error('Login failed:', error);
                if (axios.isAxiosError(error) && error.response) {
                    console.error('Error details:', error.response.data);
                }
            }
        },
        onError: errorResponse => {
            console.error('Google Login failed:', errorResponse);
        },
    });

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
            {/* Header/Navigation */}
            <header className="w-full py-4 px-6 flex items-center bg-white shadow-sm">
                <div className="flex items-center space-x-2">
                    <img src={introspectLogo} alt="Introspect" className="h-10 rounded-lg" />
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-4 py-12 md:py-20">
                {/* Left side - Product Info */}
                <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Discover yourself
                    </h1>
                    <p className="text-xl text-gray-700 mb-8">
                        Your private journaling companion helps you express your thoughts and keep track of them. 
                        Use AI to uncover insights and patterns.
                    </p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start">
                            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">Private journaling.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">Data is encrypted.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">Personalized reflection helps you develop self-discipline and emotional resilience.</span>
                        </li>

                    </ul>
                    <button
                        onClick={() => googleLogin()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg transition duration-200 shadow-md"
                    >
                        Introspect
                    </button>
                </div>

                {/* Right side - Video Demo */}
                <div className="md:w-1/2">
                    <div className="rounded-xl shadow-lg overflow-hidden w-full">
                        {/* Vimeo video embed */}
                        <div className="relative w-full h-0 pb-[56.25%]">
                            <iframe 
                                title="vimeo-player" 
                                src="https://player.vimeo.com/video/1088763590?h=9d83e9a969" 
                                className="absolute top-0 left-0 w-full h-full"
                                frameBorder="0" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white py-6 px-4 border-t border-gray-200">
                <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Introspect. All rights reserved.</p>
                    
                    {/* Social Media Icons */}
                    <div className="flex justify-center space-x-6 mt-4">
                        {/* Twitter/X Icon */}
                        <a href="https://x.com/phoe6" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <svg className="h-6 w-6 text-gray-500 hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        </a>
                        
                        {/* GitHub Icon */}
                        <a href="https://github.com/orsenthil/" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <svg className="h-6 w-6 text-gray-500 hover:text-gray-800 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path>
                            </svg>
                        </a>
                        
                        {/* LinkedIn Icon */}
                        <a href="https://www.linkedin.com/in/orsenthil/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <svg className="h-6 w-6 text-gray-500 hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"></path>
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};