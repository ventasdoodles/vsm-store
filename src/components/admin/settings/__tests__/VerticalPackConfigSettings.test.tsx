import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerticalPackConfigSettings } from '../VerticalPackConfigSettings';
import type { SettingsFormData, SettingsChangeHandler } from '../settings.types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => {
    return {
        motion: {
            div: ({ children, className, 'data-testid': testId, onClick, layoutId }: any) => (
                <div className={className} data-testid={testId || layoutId} onClick={onClick}>
                    {children}
                </div>
            ),
        },
        AnimatePresence: ({ children }: any) => <>{children}</>,
    };
});

import { Mock } from 'vitest';

describe('VerticalPackConfigSettings', () => {
    let mockHandleChange: Mock;
    let defaultFormData: SettingsFormData;

    beforeEach(() => {
        mockHandleChange = vi.fn();
        defaultFormData = {
            site_name: '',
            description: '',
            whatsapp_number: '',
            whatsapp_default_message: '',
            social_links: { facebook: '', instagram: '', youtube: '', tiktok: '' },
            location_address: '',
            location_city: '',
            location_map_url: '',
            bank_account_info: '',
            payment_methods: { transfer: true, mercadopago: true, cash: false },
            loyalty_config: { enable_loyalty: false, points_per_currency: 1, currency_per_point: 1, min_points_to_redeem: 0, max_points_per_order: 100, points_expiry_days: 365 },
            vertical_pack_config: '', // Empty triggers DEFAULT_CONFIG
        };
    });

    it('renders General tab by default with DEFAULT_CONFIG when empty', () => {
        render(<VerticalPackConfigSettings formData={defaultFormData} handleChange={mockHandleChange as unknown as SettingsChangeHandler} />);
        
        // Check tabs exist
        expect(screen.getByText('General')).toBeInTheDocument();
        expect(screen.getByText('Marketing Hero')).toBeInTheDocument();
        expect(screen.getByText('Secciones')).toBeInTheDocument();
        
        // General tab fields
        expect(screen.getByText('ID de Configuración')).toBeInTheDocument();
        expect(screen.getByDisplayValue('default_pack')).toBeInTheDocument(); // DEFAULT_CONFIG.id
    });

    it('handles hero marketing input changes', () => {
        render(<VerticalPackConfigSettings formData={defaultFormData} handleChange={mockHandleChange as unknown as SettingsChangeHandler} />);
        
        // Go to Hero tab
        fireEvent.click(screen.getByText('Marketing Hero'));
        
        const titleInput = screen.getByPlaceholderText('Ej. Encuentra tu estilo');
        expect(screen.getByText('Título Principal (H1)')).toBeInTheDocument();
        
        // Type into title
        fireEvent.change(titleInput, { target: { value: 'New Hero Title' } });
        
        expect(mockHandleChange).toHaveBeenCalledTimes(1);
        const eventArg = mockHandleChange.mock.calls[0]![0];
        expect(eventArg.target.name).toBe('vertical_pack_config');
        
        const parsedValue = JSON.parse(eventArg.target.value);
        expect(parsedValue.marketing?.homeHero?.primaryCopy?.title).toBe('New Hero Title');
    });

    it('handles adding and updating a section', () => {
        render(<VerticalPackConfigSettings formData={defaultFormData} handleChange={mockHandleChange as unknown as SettingsChangeHandler} />);
        
        // Go to Sections tab
        fireEvent.click(screen.getByText('Secciones'));
        
        // Initial state has 0 sections
        expect(screen.getByText('No has definido ninguna sección todavía.')).toBeInTheDocument();
        
        const addButton = screen.getByText('Añadir Sección');
        fireEvent.click(addButton);
        
        expect(mockHandleChange).toHaveBeenCalledTimes(1);
        const eventArg = mockHandleChange.mock.calls[0]![0];
        const parsedValue = JSON.parse(eventArg.target.value);
        
        expect(parsedValue.sections?.length).toBe(1);
        expect(parsedValue.sections?.[0]?.label).toBe('Nueva Sección');
    });

    it('displays error and locks tabs if JSON is invalid', () => {
        const badFormData = { ...defaultFormData, vertical_pack_config: '{ bad_json' };
        render(<VerticalPackConfigSettings formData={badFormData} handleChange={mockHandleChange as unknown as SettingsChangeHandler} />);
        
        // Should show error message
        expect(screen.getByText('Error de Sintaxis Detectado')).toBeInTheDocument();
        
        // General tab should be disabled
        const generalTabButton = screen.getByText('General').closest('button');
        expect(generalTabButton).toBeDisabled();
        
        // Should automatically be on Advanced tab and see the raw input
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        expect(textarea.value).toBe('{ bad_json');
    });
});
