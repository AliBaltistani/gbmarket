import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            const { data } = await api.put('/settings', newSettings);
            setSettings(data);
            return true;
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center font-body">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-4 border-[#F5EFE0] border-t-[#F5A623] rounded-full animate-spin" />
                    <span className="text-xs font-bold text-[#3A2E1F]/60 uppercase tracking-widest mt-2">Loading Studio</span>
                </div>
            </div>
        );
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
