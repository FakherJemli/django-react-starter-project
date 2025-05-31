import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { client } from '../api/client';
import { clearAuthHeaders } from '../api/client';


interface AuthContextType {
    isAuthenticated: boolean;
    login: (access: string, refresh: string) => void;
    logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize isAuthenticated based on token existence
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('token');
    });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!token || !refreshToken) {
                setIsAuthenticated(false);
                if (location.pathname !== '/login') {
                    navigate('/login');
                }
                return;
            }

            try {
                await client.get('/entries/');
                setIsAuthenticated(true);
            } catch (error) {
                // The client interceptor should handle token refresh automatically
                // If the token is missing after a refresh attempt, log out
                if (!localStorage.getItem('token')) {
                    await logout();
                }
            }
        };
        verifyAuth();
    }, [location.pathname]);

    const login = (access: string, refresh: string) => {
        localStorage.setItem('token', access);
        localStorage.setItem('refreshToken', refresh);
        setIsAuthenticated(true);
        navigate('/');
    };

    const logout = async (): Promise<void> => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        clearAuthHeaders();
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};