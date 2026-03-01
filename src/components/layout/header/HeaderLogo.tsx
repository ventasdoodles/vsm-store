// HeaderLogo — Logo independiente del header
import { Link } from 'react-router-dom';

export function HeaderLogo() {
    return (
        <Link to="/" className="flex items-center group flex-shrink-0 relative z-10 transition-transform duration-300">
            <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
            <img
                src="/logo-vsm.png"
                alt="VSM Store"
                className="h-10 sm:h-12 xl:h-14 w-auto transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.8)] filter brightness-110 drop-shadow-md relative z-10"
            />
        </Link>
    );
}
