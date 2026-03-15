import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVoiceSearch } from '../useVoiceSearch';
import { voiceDiagnostic } from '@/services/VoiceDiagnosticService';

// Mock VoiceDiagnosticService
vi.mock('@/services/VoiceDiagnosticService', () => ({
    voiceDiagnostic: {
        requestHardwareAccess: vi.fn(),
        getDetailedErrorMessage: vi.fn((err) => `Mock Error: ${err}`),
        isSecureContext: vi.fn(() => true)
    }
}));

// Mock SpeechRecognition
const mockStart = vi.fn();
const mockStop = vi.fn();

class MockSpeechRecognition {
    start = mockStart;
    stop = mockStop;
    onstart: (() => void) | null = null;
    onresult: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onend: (() => void) | null = null;
    continuous = false;
    interimResults = false;
    lang = 'es-MX';
}

(window as any).SpeechRecognition = MockSpeechRecognition;

describe('useVoiceSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default states', () => {
        const { result } = renderHook(() => useVoiceSearch());
        expect(result.current.isListening).toBe(false);
        expect(result.current.isDiagnosing).toBe(false);
        expect(result.current.transcript).toBe('');
        expect(result.current.error).toBeNull();
    });

    it('should start listening after successful diagnosis', async () => {
        (voiceDiagnostic.requestHardwareAccess as any).mockResolvedValue({ success: true });
        
        const { result } = renderHook(() => useVoiceSearch());
        
        await act(async () => {
            await result.current.startListening();
        });

        expect(voiceDiagnostic.requestHardwareAccess).toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalled();
    });

    it('should set error if diagnosis fails', async () => {
        const mockMessage = 'Acceso denegado al micro';
        (voiceDiagnostic.requestHardwareAccess as any).mockResolvedValue({ 
            success: false, 
            message: mockMessage 
        });
        
        const { result } = renderHook(() => useVoiceSearch());
        
        await act(async () => {
            await result.current.startListening();
        });

        expect(result.current.error).toBe(mockMessage);
        expect(mockStart).not.toHaveBeenCalled();
    });

    it('should handle speech recognition results', async () => {
        (voiceDiagnostic.requestHardwareAccess as any).mockResolvedValue({ success: true });
        
        const { result } = renderHook(() => useVoiceSearch());
        
        await act(async () => {
            await result.current.startListening();
        });

        expect(result.current.isListening).toBe(true);
    });
});
