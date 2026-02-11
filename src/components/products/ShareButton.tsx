// Botón de compartir producto - VSM Store
import { useState, useRef, useEffect } from 'react';
import { Share2, Facebook, MessageCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotification } from '@/hooks/useNotification';

interface ShareButtonProps {
    product: {
        name: string;
        short_description?: string | null;
    };
    className?: string;
}

export function ShareButton({ product, className }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { success } = useNotification();

    const url = window.location.href;
    const text = `Mira este producto: ${product.name} en VSM Store`;

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShare = async () => {
        // Usar Web Share API si está disponible
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.short_description || text,
                    url: url,
                });
                return;
            } catch (err) {
                // Si el usuario cancela o falla, abrimos el menú manual
                console.log('Error sharing:', err);
            }
        }
        setIsOpen(!isOpen);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        success('Enlace copiado', 'El enlace del producto ha sido copiado al portapapeles');
        setTimeout(() => {
            setCopied(false);
            setIsOpen(false);
        }, 2000);
    };

    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            url: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            color: 'text-[#25D366] group-hover:bg-[#25D366]/10',
        },
        {
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: 'text-[#1877F2] group-hover:bg-[#1877F2]/10',
        },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleShare}
                className={cn(
                    'flex items-center gap-2 rounded-xl bg-primary-900/50 px-4 py-3 text-sm font-medium text-primary-300 transition-colors hover:bg-primary-800 hover:text-primary-100',
                    className
                )}
            >
                <Share2 className="h-4 w-4" />
                Compartir
            </button>

            {/* Dropdown manual (fallback) */}
            {isOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-48 origin-top-right rounded-xl border border-primary-800 bg-primary-950 p-1 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-primary-500 uppercase tracking-wider">
                        Compartir en
                    </div>
                    {shareLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-300 transition-colors hover:bg-primary-900',
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            <link.icon className={cn('h-4 w-4', link.color.split(' ')[0])} />
                            {link.name}
                        </a>
                    ))}
                    <button
                        onClick={handleCopy}
                        className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-300 transition-colors hover:bg-primary-900"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4 text-primary-400" />
                        )}
                        {copied ? 'Copiado' : 'Copiar enlace'}
                    </button>
                </div>
            )}
        </div>
    );
}
