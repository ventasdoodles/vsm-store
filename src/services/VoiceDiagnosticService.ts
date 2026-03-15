/**
 * VoiceDiagnosticService - VSM Store
 * 
 * Orchestrates hardware access and provides deep diagnostics for voice-related features.
 * Focuses on mobile resilience (Safari iOS) and secure context validation.
 */

export type VoiceErrorType = 
    | 'not-allowed' 
    | 'no-speech' 
    | 'audio-capture' 
    | 'network' 
    | 'not-supported' 
    | 'insecure-context'
    | 'unknown';

export interface DiagnosticResult {
    success: boolean;
    error?: VoiceErrorType;
    message?: string;
}

class VoiceDiagnosticService {
    /**
     * Checks if the current environment is a secure context (required for Web Speech API).
     */
    isSecureContext(): boolean {
        return (
            window.isSecureContext || 
            window.location.protocol === 'https:' || 
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1'
        );
    }

    /**
     * Attempts to trigger the system microphone permission dialog using getUserMedia.
     * This is crucial for Safari iOS to "unlock" the hardware for SpeechRecognition.
     */
    async requestHardwareAccess(): Promise<DiagnosticResult> {
        if (!this.isSecureContext()) {
            return {
                success: false,
                error: 'insecure-context',
                message: 'La búsqueda por voz requiere una conexión segura (HTTPS).'
            };
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return {
                success: false,
                error: 'not-supported',
                message: 'Tu navegador no soporta captura de audio.'
            };
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Immediately stop the stream as we only needed the permission
            stream.getTracks().forEach(track => track.stop());
            
            return { success: true };
        } catch (err: unknown) {
            console.error('[VoiceDiagnostic] Access Denied:', err);
            
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    return {
                        success: false,
                        error: 'not-allowed',
                        message: 'Acceso denegado. Activa el micrófono en la configuración del sitio o del sistema (iOS Settings > Safari).'
                    };
                }
            }
            
            return {
                success: false,
                error: 'audio-capture',
                message: 'No se pudo acceder al micrófono. Revisa la configuración de tu dispositivo.'
            };
        }
    }

    /**
     * Maps technical error codes to user-friendly, high-conversion messages.
     */
    getDetailedErrorMessage(error: string): string {
        switch (error) {
            case 'not-allowed':
                return 'Micrófono bloqueado. Revisa el candado de la barra O ve a "Ajustes > Apps > Chrome > Permisos" en tu Android.';
            case 'not-found':
                return 'Micrófono no detectado. Si estás en Android, es posible que el sistema bloquee el acceso. Revisa "Ajustes > Apps > Chrome".';
            case 'no-speech':
                return 'No te escuchamos. ¿Podrías intentar de nuevo?';
            case 'audio-capture':
                return 'Error de hardware. Revisa tu entrada de audio.';
            case 'network':
                return 'Problema de conexión. Intenta en unos segundos.';
            case 'insecure-context':
                return 'Acceso denegado por seguridad (Requiere HTTPS).';
            default:
                return 'Algo salió mal con el asistente de voz. Intenta de nuevo.';
        }
    }
}

export const voiceDiagnostic = new VoiceDiagnosticService();
