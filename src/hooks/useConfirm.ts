import { useConfirmStore, ConfirmState } from '@/stores/confirm.store';

export function useConfirm() {
    const openConfirm = useConfirmStore(state => state.openConfirm);

    const confirm = (options: Omit<ConfirmState, 'isOpen' | 'resolve'>) => {
        return openConfirm(options);
    };

    return { confirm };
}
