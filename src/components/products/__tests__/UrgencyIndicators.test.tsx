import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UrgencyIndicators } from '../UrgencyIndicators';


describe('UrgencyIndicators', () => {
    it('renders non-urgent availability wording for in-stock items', () => {
        render(<UrgencyIndicators stock={12} />);

        expect(screen.getByText('Disponible para envío')).toBeInTheDocument();
    });

    it('renders limited availability wording without urgency claims', () => {
        render(<UrgencyIndicators stock={3} />);

        expect(screen.getByText('Stock limitado: 3 unidades')).toBeInTheDocument();
        expect(screen.queryByText(/Solo quedan/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Ultimas/i)).not.toBeInTheDocument();
    });

    it('renders out-of-stock wording', () => {
        render(<UrgencyIndicators stock={0} />);

        expect(screen.getByText('Agotado')).toBeInTheDocument();
    });
});
