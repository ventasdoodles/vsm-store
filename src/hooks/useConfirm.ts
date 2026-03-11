/**
 * useConfirm - VSM Store
 * 
 * Custom hook para la lógica y gestión de Confirm.
 * @module hooks/useConfirm
 */

import { useConfirmStore, ConfirmState } from '@/stores/confirm.store';

export function useConfirm() {
    const openConfirm = useConfirmStore(state => state.openConfirm);

    const confirm = (options: Omit<ConfirmState, 'isOpen' | 'resolve'>) => {
        return openConfirm(options);
    };

    return { confirm };
}
