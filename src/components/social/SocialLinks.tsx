// Componente de redes sociales - VSM Store
import { Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/config/site';

interface SocialLinksProps {
    className?: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'icons' | 'buttons';
}

export function SocialLinks({ className, size = 'medium', variant = 'icons' }: SocialLinksProps) {
    const SOCIAL_LINKS = [
        {
            name: 'Facebook',
            icon: Facebook,
            url: SITE_CONFIG.social.facebook,
            color: 'hover:text-[#1877F2]',
            bgColor: 'hover:bg-[#1877F2]/10',
        },
        {
            name: 'Instagram',
            icon: Instagram,
            url: SITE_CONFIG.social.instagram,
            color: 'hover:text-[#E4405F]',
            bgColor: 'hover:bg-[#E4405F]/10',
        },
        {
            name: 'YouTube',
            icon: Youtube,
            url: SITE_CONFIG.social.youtube,
            color: 'hover:text-[#FF0000]',
            bgColor: 'hover:bg-[#FF0000]/10',
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            url: SITE_CONFIG.social.whatsapp,
            color: 'hover:text-[#25D366]',
            bgColor: 'hover:bg-[#25D366]/10',
        },
    ];

    const sizeClasses = {
        small: 'h-4 w-4',
        medium: 'h-5 w-5',
        large: 'h-6 w-6',
    };

    const containerGap = {
        small: 'gap-3',
        medium: 'gap-4',
        large: 'gap-6',
    };

    return (
        <div className={cn('flex items-center', containerGap[size], className)}>
            {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;

                if (variant === 'buttons') {
                    return (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.name}
                            className={cn(
                                'flex items-center justify-center rounded-lg bg-primary-900 p-2.5 text-primary-400 transition-all',
                                'hover:-translate-y-0.5',
                                social.color,
                                social.bgColor
                            )}
                        >
                            <Icon className={sizeClasses[size]} />
                        </a>
                    );
                }

                return (
                    <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className={cn(
                            'text-primary-500 transition-colors',
                            social.color
                        )}
                    >
                        <Icon className={sizeClasses[size]} />
                    </a>
                );
            })}
        </div>
    );
}
