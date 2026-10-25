import { useState } from 'react';
import { Palette, Check, Sparkles, RotateCcw } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { rgbStringToHex } from '@/lib/theme';
import type { ThemePresetId } from '@/lib/theme/types';

export function ThemeCustomizationSettings() {
    const {
        activePreset,
        themeTokens,
        availablePresets,
        setPreset,
        setCustomHexColors,
        resetToDefault,
    } = useTheme();

    const [customPrimaryHex, setCustomPrimaryHex] = useState(() =>
        rgbStringToHex(themeTokens.accentPrimary)
    );
    const [customSecondaryHex, setCustomSecondaryHex] = useState(() =>
        rgbStringToHex(themeTokens.accentSecondary)
    );

    const handleApplyCustomColors = () => {
        setCustomHexColors({
            accentPrimary: customPrimaryHex,
            accentSecondary: customSecondaryHex,
        });
    };

    return (
        <div className="group relative col-span-1 lg:col-span-2 overflow-hidden rounded-3xl border border-white/5 bg-theme-primary/10 p-6 shadow-xl backdrop-blur-md transition-all hover:border-accent-primary/20">
            {/* Ambient Atmosphere Glows */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent-primary/10 blur-5xl transition-all" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-accent-secondary/10 blur-4xl" />

            {/* Header */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent-primary/10 rounded-xl border border-accent-primary/20">
                        <Palette className="size-5 text-accent-primary" />
                    </div>
                    <div>
                        <Heading as="h2" className="text-base font-bold text-white flex items-center gap-2">
                            Motor de Temas y Multi-Vertical
                            <span className="rounded-full bg-accent-primary/20 border border-accent-primary/30 px-2 py-0.5 text-2xs uppercase tracking-macro font-semibold text-accent-primary">
                                Dinámico
                            </span>
                        </Heading>
                        <p className="text-xs text-theme-secondary">
                            Personaliza la identidad cromática de tu tienda según tu vertical o marca.
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetToDefault}
                    className="text-xs text-theme-secondary hover:text-white flex items-center gap-1.5"
                >
                    <RotateCcw className="size-3.5" />
                    Restablecer
                </Button>
            </div>

            {/* Preset Cards Grid */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {availablePresets
                    .filter((p) => p.id !== 'custom')
                    .map((preset) => {
                        const isSelected = activePreset === preset.id;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                    setPreset(preset.id as ThemePresetId);
                                    setCustomPrimaryHex(preset.preview.primaryHex);
                                    setCustomSecondaryHex(preset.preview.secondaryHex);
                                }}
                                className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group/card ${
                                    isSelected
                                        ? 'border-accent-primary bg-accent-primary/10 ring-1 ring-accent-primary/30'
                                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                                            {preset.name}
                                            {isSelected && <Check className="size-3.5 text-accent-primary" />}
                                        </div>
                                        <div className="text-2xs text-theme-secondary line-clamp-1">
                                            {preset.vertical}
                                        </div>
                                    </div>

                                    {/* Swatch previews */}
                                    <div className="flex items-center -space-x-1.5 shrink-0">
                                        <span
                                            className="size-5 rounded-full border border-black/40 shadow-sm"
                                            style={{ backgroundColor: preset.preview.primaryHex }}
                                            title="Color Primario"
                                        />
                                        <span
                                            className="size-5 rounded-full border border-black/40 shadow-sm"
                                            style={{ backgroundColor: preset.preview.secondaryHex }}
                                            title="Color Secundario"
                                        />
                                    </div>
                                </div>

                                <p className="text-2xs text-theme-secondary/80 line-clamp-2">
                                    {preset.description}
                                </p>
                            </button>
                        );
                    })}
            </div>

            {/* Custom Brand Colors Drawer/Box */}
            <div className="relative z-10 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="size-4 text-accent-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-theme-secondary">
                        Color de Marca Personalizado (HEX)
                    </span>
                    {activePreset === 'custom' && (
                        <span className="ml-auto text-2xs text-accent-primary font-medium">
                            Tema Personalizado Activo
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-2xs text-theme-secondary mb-1">
                            Acento Primario
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={customPrimaryHex}
                                onChange={(e) => setCustomPrimaryHex(e.target.value)}
                                className="size-9 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                            />
                            <input
                                type="text"
                                value={customPrimaryHex}
                                onChange={(e) => setCustomPrimaryHex(e.target.value)}
                                placeholder="#3b82f6"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white placeholder-white/30 outline-none focus:border-accent-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-2xs text-theme-secondary mb-1">
                            Acento Secundario
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={customSecondaryHex}
                                onChange={(e) => setCustomSecondaryHex(e.target.value)}
                                className="size-9 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                            />
                            <input
                                type="text"
                                value={customSecondaryHex}
                                onChange={(e) => setCustomSecondaryHex(e.target.value)}
                                placeholder="#8b5cf6"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white placeholder-white/30 outline-none focus:border-accent-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleApplyCustomColors}
                            className="w-full text-xs font-medium py-2.5"
                        >
                            Aplicar Colores de Marca
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
