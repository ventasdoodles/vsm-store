import React, { createContext, useContext, ReactNode } from 'react';
import { useEmergencyMode } from '@/hooks/useEmergencyMode';

interface SafetyContextType {
    isEmergency: boolean;
    checkHealth: () => Promise<void>;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

/**
 * SafetyProvider
 * Orchestrates the "Hyper-Resilience" state across the application.
 * Part of Wave 80 - Phase A.
 */
export const SafetyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const emergencyState = useEmergencyMode();

    return (
        <SafetyContext.Provider value={emergencyState}>
            {children}
        </SafetyContext.Provider>
    );
};

export const useSafety = () => {
    const context = useContext(SafetyContext);
    if (!context) {
        throw new Error('useSafety must be used within a SafetyProvider');
    }
    return context;
};
