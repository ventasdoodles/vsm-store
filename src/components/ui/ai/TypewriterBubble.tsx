import React, { useEffect } from 'react';
import { useTypewriter } from '@/hooks/useTypewriter';

export const TypewriterBubble: React.FC<{ text: string; isLatest: boolean; onTick?: () => void }> = ({ text, isLatest, onTick }) => {
    const { displayedText, isTyping } = useTypewriter(text, isLatest, 3, 12);

    useEffect(() => {
        if (isTyping && onTick) {
            onTick();
        }
    }, [displayedText, isTyping, onTick]);

    return (
        <>
            {displayedText}
            {isTyping && (
                <span className="inline-block w-[3px] h-[1em] ml-0.5 bg-vape-400/70 animate-pulse align-text-bottom" />
            )}
        </>
    );
};
