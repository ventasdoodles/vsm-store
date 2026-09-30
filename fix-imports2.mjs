import fs from 'fs';
import path from 'path';

const handlersDir = 'src/services/concierge/handlers';
const files = fs.readdirSync(handlersDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

files.forEach(file => {
    const filePath = path.join(handlersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove all imports
    const bodyContent = content.replace(/^import[\s\S]*?;\s*/gm, '');

    const requiredImports = [];

    // Check for specific words
    const words = [
        'executeAuthenticatedLoyaltyStatusCapsule', 'executeAuthenticatedOrderTrackingCapsule',
        'executeAuthenticatedWarrantyTriageCapsule', 'executeCartOperatorCapsule', 'executeKnowledgeCapsule',
        'executeProductSearchCapsule', 'executeStorefrontBudgetRescueCapsule', 'executeStorefrontCheckoutReadinessCapsule',
        'executeStorefrontCompatibilityCheckCapsule', 'executeStorefrontInventoryOutlookCapsule', 'executeStorefrontKittingBasketCapsule',
        
        'buildCesarinHumanizedSearchMessage', 'rerankCesarinSuggestedProducts', 'buildCesarinAdaptiveConversationView',
        'buildCesarinActionableNextStepView', 'resolveCesarinTurnCommercialJudgment',
        
        'compactCesarinCopy', 'getEffectiveConversationalPrefix', 'isMeaningfullyDistinct', 'mergeConversationalPrefix',
        'getProductsByIds', 'resolveStorefrontAttachmentOffers', 'Product', 'CustomerProfile', 'InternalResolvedProduct',
        'isCustomerIntelligenceNoWriteSmokeActive',
        
        'deriveCheckoutBridgeAction', 'deriveOrderTrackingBridgeAction', 'extractTelemetryNextStepTruth',
        'isSearchLeadingIntent', 'resolveGroundedProductSearchMessage', 'logAITelemetry',
        
        'ConciergeCatalogGate', 'ConciergeMessage', 'ConciergeProductSearchMemoryContext', 'ConciergeSourceContext', 'ConciergeTurnAnalysis'
    ];

    const found = words.filter(w => new RegExp(`\\b${w}\\b`).test(bodyContent));

    const grouped = {
        '@/services/ai-capsule-orchestrator.service': [],
        '@/lib/cesarin-stage1': [],
        '@/lib/cesarin-stage3': [],
        '@/lib/cesarin-stage4': [],
        '@/lib/cesarin-stage5': [],
        '@/lib/cesarin-commercial-judgment': [],
        '@/lib/cesarin-text-utils': [],
        '@/services/products.service': [],
        '@/services/storefront-attachments.service': [],
        '@/types/product': [],
        '@/types/customer': [],
        '@/types/ai-capsule': [],
        '@/lib/customer-intelligence-no-write-smoke': [],
        '../helpers': [],
        '../telemetry': [],
        '../types': []
    };

    const mapping = {
        'executeAuthenticatedLoyaltyStatusCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeAuthenticatedOrderTrackingCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeAuthenticatedWarrantyTriageCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeCartOperatorCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeKnowledgeCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeProductSearchCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeStorefrontBudgetRescueCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeStorefrontCheckoutReadinessCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeStorefrontCompatibilityCheckCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeStorefrontInventoryOutlookCapsule': '@/services/ai-capsule-orchestrator.service',
        'executeStorefrontKittingBasketCapsule': '@/services/ai-capsule-orchestrator.service',
        
        'buildCesarinHumanizedSearchMessage': '@/lib/cesarin-stage1',
        'rerankCesarinSuggestedProducts': '@/lib/cesarin-stage3',
        'buildCesarinAdaptiveConversationView': '@/lib/cesarin-stage4',
        'buildCesarinActionableNextStepView': '@/lib/cesarin-stage5',
        'resolveCesarinTurnCommercialJudgment': '@/lib/cesarin-commercial-judgment',
        
        'compactCesarinCopy': '@/lib/cesarin-text-utils',
        'getEffectiveConversationalPrefix': '@/lib/cesarin-text-utils',
        'isMeaningfullyDistinct': '@/lib/cesarin-text-utils',
        'mergeConversationalPrefix': '@/lib/cesarin-text-utils',
        
        'getProductsByIds': '@/services/products.service',
        'resolveStorefrontAttachmentOffers': '@/services/storefront-attachments.service',
        
        'Product': '@/types/product',
        'CustomerProfile': '@/types/customer',
        'InternalResolvedProduct': '@/types/ai-capsule',
        'isCustomerIntelligenceNoWriteSmokeActive': '@/lib/customer-intelligence-no-write-smoke',
        
        'deriveCheckoutBridgeAction': '../helpers',
        'deriveOrderTrackingBridgeAction': '../helpers',
        'extractTelemetryNextStepTruth': '../helpers',
        'isSearchLeadingIntent': '../helpers',
        'resolveGroundedProductSearchMessage': '../helpers',
        
        'logAITelemetry': '../telemetry',
        
        'ConciergeCatalogGate': '../types',
        'ConciergeMessage': '../types',
        'ConciergeProductSearchMemoryContext': '../types',
        'ConciergeSourceContext': '../types',
        'ConciergeTurnAnalysis': '../types'
    };

    found.forEach(w => {
        grouped[mapping[w]].push(w);
    });

    let newImports = '';
    for (const [source, items] of Object.entries(grouped)) {
        if (items.length > 0) {
            const isType = source.includes('types') ? 'type ' : '';
            newImports += `import ${isType}{ ${items.join(', ')} } from '${source}';\n`;
        }
    }

    newImports += `import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';\n\n`;

    fs.writeFileSync(filePath, newImports + bodyContent);
    console.log(`Cleaned imports for ${file}`);
});
