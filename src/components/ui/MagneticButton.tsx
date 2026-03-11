import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}

export function MagneticButton({ children, className, strength = 0.2 }: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * strength, y: middleY * strength });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
            className={cn("inline-block", className)}
        >
            {children}
        </motion.div>
    );
}
