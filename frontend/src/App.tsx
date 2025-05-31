import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { TextForm } from './components/TextForm';
import { Settings } from './components/Settings';
import { useEffect, useState } from "react";
import { config } from './config';
import introspectLogo from './assets/introspect-logo.svg';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

const LogoutRoute = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await logout();
                navigate('/login', { replace: true });
            } catch (error) {
                navigate('/login', { replace: true });
            }
        };

        performLogout();
    }, [logout, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div>Logging out...</div>
        </div>
    );
};

function App() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    return (
        <BrowserRouter>
            <GoogleOAuthProvider clientId={config.googleClientId}>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/logout" element={<LogoutRoute />} />
                            <Route
                                path="/"
                                element={
                                    <PrivateRoute>
                                        <div className="min-h-screen bg-gray-50 flex justify-center p-4 pt-12 relative">
                                            {/* Settings Gear in top right corner */}
                                            <div className="absolute top-4 right-4">
                                                <button 
                                                    onClick={() => setIsSettingsOpen(true)}
                                                    className="text-gray-500 hover:text-gray-700 bg-white p-2 rounded-full shadow-sm"
                                                    aria-label="Settings"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            
                                            <div className="w-full max-w-lg">
                                                <img src={introspectLogo} alt="Introspect" className="h-12 rounded-lg" />
                                                <TextForm />
                                            </div>
                                        </div>
                                        
                                        {/* Settings Modal */}
                                        <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                                    </PrivateRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AuthProvider>
                </QueryClientProvider>
            </GoogleOAuthProvider>
        </BrowserRouter>
    );
}

export default App;