// Modal de autenticación - VSM Store
import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
    const [view, setView] = useState<'login' | 'signup'>(initialView);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className={cn(
                        'relative w-full max-w-md rounded-2xl border border-primary-800 bg-primary-950 p-6 shadow-2xl',
                        'animate-[fadeIn_0.2s_ease-out]'
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-lg p-1.5 text-primary-500 hover:bg-primary-800 hover:text-primary-300 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Content */}
                    {view === 'login' ? (
                        <LoginForm
                            onSuccess={onClose}
                            onSwitchToSignUp={() => setView('signup')}
                        />
                    ) : (
                        <SignUpForm
                            onSuccess={onClose}
                            onSwitchToLogin={() => setView('login')}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
