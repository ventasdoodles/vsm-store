import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVoiceSearch } from '../useVoiceSearch';
import { voiceIntelligenceService } from '@/services/voice.service';

// --- Mocks Globales ---
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockGetUserMedia = vi.fn();

// Mock MediaRecorder
class MockMediaRecorder {
    start = vi.fn(() => {
        setTimeout(() => {
            if (this.ondataavailable) {
                this.ondataavailable({ data: new Blob(['test-audio'], { type: 'audio/webm' }) } as any);
            }
        }, 10);
    });
    stop = vi.fn(() => {
        if (this.onstop) this.onstop();
    });
    ondataavailable: (e: any) => void = () => {};
    onstop: () => void = () => {};
}

// Mock FileReader
class MockFileReader {
    onloadend: () => void = () => {};
    onerror: () => void = () => {};
    result: string | null = null;
    readAsDataURL(blob: Blob) {
        this.result = 'data:audio/webm;base64,dGVzdC1hdWRpbw==';
        setTimeout(() => this.onloadend(), 10);
    }
}

// Global Mocks Setup via Vitest stubs
vi.stubGlobal('MediaRecorder', MockMediaRecorder);
vi.stubGlobal('FileReader', MockFileReader);

Object.defineProperty(navigator, 'mediaDevices', {
    value: {
        getUserMedia: mockGetUserMedia,
        enumerateDevices: vi.fn().mockResolvedValue([])
    },
    configurable: true,
    writable: true
});

vi.mock('@/services/voice.service', () => ({
    voiceIntelligenceService: {
        processAudio: vi.fn().mockResolvedValue({ searchQuery: 'AI Result', isComplex: false }),
        processTranscript: vi.fn()
    }
}));

describe('useVoiceSearch Premium Hybrid Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset SpeechRecognition Mock
        (window as any).SpeechRecognition = class {
            start = mockStart;
            stop = mockStop;
        };
    });

    it('should trigger MediaRecorder fallback when Native Speech fails', async () => {
        const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
        mockGetUserMedia.mockResolvedValue(mockStream);

        const { result } = renderHook(() => useVoiceSearch());

        // Simular error nativo
        (window as any).SpeechRecognition = class {
            start = vi.fn(function(this: any) {
                setTimeout(() => {
                    if (this.onerror) this.onerror({ error: 'not-allowed' });
                }, 10);
            });
            onerror: any;
            stop = vi.fn();
        };

        await act(async () => {
            result.current.startListening();
        });

        await vi.waitFor(() => {
            expect(mockGetUserMedia).toHaveBeenCalled();
            expect(result.current.transcript).toContain('Escuchando (Modo Híbrido)');
        });
    });

    it('should process audio to base64 and call Gemini on recording stop', async () => {
        const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
        mockGetUserMedia.mockResolvedValue(mockStream);
        
        const { result } = renderHook(() => useVoiceSearch({
            onResult: (text) => {
                // Se espera 'AI Result' configurado en el mock del service
            }
        }));

        // Simular error nativo para disparar fallback
        (window as any).SpeechRecognition = class {
            start = vi.fn(function(this: any) {
                setTimeout(() => {
                    if (this.onerror) this.onerror({ error: 'service-unavailable' });
                }, 5);
            });
            onerror: any;
            stop = vi.fn();
        };

        await act(async () => {
            result.current.startListening();
        });

        // Esperar a que el fallback se active y la grabación inicie
        await vi.waitFor(() => {
            expect(result.current.transcript).toContain('Escuchando (Modo Híbrido)');
        });

        // Detener la grabación para disparar el flujo Gemini
        await act(async () => {
            result.current.stopListening();
        });

        await vi.waitFor(() => {
            expect(voiceIntelligenceService.processAudio).toHaveBeenCalled();
            expect(result.current.isListening).toBe(false);
        }, { timeout: 2000 });
    });

    it('should handle NotFoundError with a premium descriptive message', async () => {
        const error = new Error('Not found');
        error.name = 'NotFoundError';
        mockGetUserMedia.mockRejectedValue(error);

        (window as any).SpeechRecognition = class {
            start = vi.fn(function(this: any) {
                setTimeout(() => {
                    if (this.onerror) this.onerror({ error: 'service-unavailable' });
                }, 5);
            });
            onerror: any;
            stop = vi.fn();
        };

        const { result } = renderHook(() => useVoiceSearch());

        await act(async () => {
            result.current.startListening();
        });

        await vi.waitFor(() => {
            expect(result.current.error).toContain('Hardware no encontrado');
        });
    });
});
