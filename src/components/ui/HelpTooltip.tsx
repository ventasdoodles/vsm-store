import { HelpCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HelpTooltipProps {
    title: string;
    content: string | string[]; // String o array de pasos
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
    title,
    content,
    position = 'top',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const positionClasses = {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
        right: 'left-full ml-2',
    };

    const renderContent = () => {
        if (Array.isArray(content)) {
            // Pasos numerados
            return (
                <ol className="list-decimal list-inside space-y-1.5 text-sm">
                    {content.map((step, idx) => (
                        <li key={idx} className="text-primary-200">
                            {step}
                        </li>
                    ))}
                </ol>
            );
        }
        // Texto simple
        return <p className="text-sm text-primary-200">{content}</p>;
    };

    return (
        <div className={`relative inline-block ${className}`} ref={tooltipRef}>
            {/* Botón de ayuda */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center w-5 h-5 text-primary-400 hover:text-primary-300 transition-colors"
                aria-label="Ayuda"
            >
                <HelpCircle className="w-4 h-4" />
            </button>

            {/* Tooltip */}
            {isOpen && (
                <div
                    className={`absolute z-50 w-80 bg-primary-800 border border-primary-700 rounded-lg shadow-xl p-4 ${positionClasses[position]}`}
                >
                    {/* Título */}
                    <h4 className="text-sm font-semibold text-primary-100 mb-2">
                        {title}
                    </h4>

                    {/* Contenido */}
                    {renderContent()}

                    {/* Flecha indicadora */}
                    <div
                        className={`absolute w-3 h-3 bg-primary-800 border-primary-700 transform rotate-45 ${position === 'top' ? 'bottom-[-6px] border-r border-b' :
                                position === 'bottom' ? 'top-[-6px] border-l border-t' :
                                    position === 'left' ? 'right-[-6px] border-t border-r' :
                                        'left-[-6px] border-b border-l'
                            }`}
                    />
                </div>
            )}
        </div>
    );
};
