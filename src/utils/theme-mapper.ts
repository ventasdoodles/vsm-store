export { cn } from '@/lib/utils';

/**
 * // ─── THEME MAPPER ───
 * Convierte tokens semánticos o colores en duro obsoletos a clases reutilizables de Tailwind.
 * Esto erradica el uso de style={{ color: '#hex' }} permitiendo que los temas oscuro/claro funcionen.
 */

// Mapa de colores heredados (hex) o semánticos a clases de fondo sólido
export const getSolidBackgroundClass = (colorOrToken: string | undefined): string => {
  switch (colorOrToken?.toLowerCase()) {
    case 'success':
    case '#10b981': // herbal-500 / emerald-500
    case '#059669': // herbal-600
    case 'green':
      return 'bg-emerald-500 text-white';
    case 'destructive':
    case '#ef4444': // red-500
    case 'red':
      return 'bg-rose-500 text-white';
    case 'warning':
    case '#f59e0b': // amber-500
    case 'yellow':
    case 'orange':
      return 'bg-amber-500 text-white';
    case 'info':
    case '#3b82f6': // vape-500 / blue-500
    case 'blue':
    case 'vape':
      return 'bg-vape-500 text-white';
    case 'accent':
    case '#a855f7': // purple-500
    case '#8b5cf6': // violet-500
    case 'purple':
      return 'bg-purple-500 text-white';
    case 'bronze':
    case '#cd7f32':
      return 'bg-amber-700 text-white';
    case 'silver':
    case '#c0c0c0':
      return 'bg-slate-300 text-slate-900';
    case 'gold':
    case '#ffd700':
      return 'bg-yellow-400 text-slate-900';
    case 'platinum':
    case '#e5e4e2':
      return 'bg-teal-100 text-slate-900';
    case 'slate':
    case 'gray':
    case '#64748b': // slate-500
      return 'bg-slate-500 text-white';
    default:
      return 'bg-theme-secondary text-theme-primary';
  }
};

// Mapa para badges/píldoras (fondo translúcido + texto sólido)
export const getSubtleBadgeClasses = (colorOrToken: string | undefined): string => {
  switch (colorOrToken?.toLowerCase()) {
    case 'success':
    case '#10b981':
    case '#059669':
    case 'green':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'destructive':
    case '#ef4444':
    case 'red':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'warning':
    case '#f59e0b':
    case 'yellow':
    case 'orange':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'info':
    case '#3b82f6':
    case 'blue':
    case 'vape':
      return 'bg-vape-500/10 text-vape-500 border-vape-500/20';
    case 'accent':
    case '#a855f7':
    case '#8b5cf6':
    case 'purple':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'slate':
    case 'gray':
    case '#64748b':
    case '#94a3b8':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    default:
      return 'bg-theme-secondary/50 text-theme-secondary border-border-primary/10';
  }
};

// Mapa estricto para bordes o decoradores laterales
export const getBorderHighlightClass = (colorOrToken: string | undefined): string => {
  switch (colorOrToken?.toLowerCase()) {
    case 'success':
    case '#10b981':
    case '#059669':
    case 'green':
      return 'border-emerald-500';
    case 'destructive':
    case '#ef4444':
    case 'red':
      return 'border-rose-500';
    case 'warning':
    case '#f59e0b':
    case 'yellow':
    case 'orange':
      return 'border-amber-500';
    case 'info':
    case '#3b82f6':
    case 'blue':
    case 'vape':
      return 'border-vape-500';
    case 'accent':
    case '#a855f7':
    case '#8b5cf6':
    case 'purple':
      return 'border-purple-500';
    case 'slate':
    case 'gray':
    case '#64748b':
      return 'border-slate-500';
    default:
      return 'border-transparent';
  }
};

// Mapa estricto para texto
export const getTextHighlightClass = (colorOrToken: string | undefined): string => {
  switch (colorOrToken?.toLowerCase()) {
    case 'success':
    case '#10b981':
    case '#059669':
    case 'green':
      return 'text-emerald-500';
    case 'destructive':
    case '#ef4444':
    case 'red':
      return 'text-rose-500';
    case 'warning':
    case '#f59e0b':
    case 'yellow':
    case 'orange':
      return 'text-amber-500';
    case 'info':
    case '#3b82f6':
    case 'blue':
    case 'vape':
      return 'text-vape-500';
    case 'accent':
    case '#a855f7':
    case '#8b5cf6':
    case 'purple':
      return 'text-purple-500';
    case 'slate':
    case 'gray':
    case '#64748b':
      return 'text-slate-400';
    case 'bronze':
    case '#cd7f32':
      return 'text-amber-700';
    case 'silver':
    case '#c0c0c0':
      return 'text-slate-300';
    case 'gold':
    case '#ffd700':
      return 'text-yellow-400';
    case 'platinum':
    case '#e5e4e2':
      return 'text-teal-100';
    default:
      return 'text-theme-primary';
  }
};

// Mapa para puntos de status (bg + shadow glow)
export const getStatusDotClass = (colorOrToken: string | undefined): string => {
  switch (colorOrToken?.toLowerCase()) {
    case 'success':
      return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    case 'destructive':
      return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
    case 'warning':
      return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    case 'info':
    case 'vape':
      return 'bg-vape-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
    case 'accent':
      return 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
    case 'slate':
      return 'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]';
    default:
      return 'bg-theme-secondary';
  }
};
