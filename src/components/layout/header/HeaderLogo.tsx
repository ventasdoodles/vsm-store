// HeaderLogo — Logo independiente del header
import { Link } from 'react-router-dom';

export function HeaderLogo() {
    return (
        <Link to="/" className="flex items-center group flex-shrink-0 relative z-10">
            <img
                src="/logo-vsm.png"
                alt="VSM Store"
                className="h-12 w-auto sm:h-14 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] filter brightness-110"
            />
        </Link>
    );
}
