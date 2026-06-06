import { vape420VerticalPackConfig } from './vape420VerticalPack';
import { secondVerticalProofConfig } from './secondVerticalProof';
import type { VerticalPackConfig } from './types';

const activePackId = import.meta.env?.VITE_ACTIVE_VERTICAL_PACK || 'vape-420';

export const activeVerticalPackConfig: VerticalPackConfig =
    activePackId === 'second-vertical-proof'
        ? secondVerticalProofConfig
        : vape420VerticalPackConfig;
