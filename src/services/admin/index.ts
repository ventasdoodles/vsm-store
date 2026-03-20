// ─── Admin Services Barrel ───────────────────────
// Re-exports everything from modular admin services.
// Consumers import from '@/services/admin' instead of individual files.

export { checkIsAdmin } from './admin-auth.service';

export {
    type DailySales,
    type TopProduct,
    type DashboardStats,
    type PulseMetrics,
    getDashboardStats,
    getRecentOrders,
    getDashboardPulse,
    getPulseMetrics,
    getOracleLowStockProducts,
    searchCommandPalette,
} from './admin-dashboard.service';

export {
    type OrderStatus,
    type OrderItem,
    type AdminOrder,
    ORDER_STATUSES,
    getAllOrders,
    updateOrderStatus,
    updateOrderPaymentStatus,
    updateOrderTracking,
    exportOrdersToCSV,
} from './admin-orders.service';

export {
    type ProductFormData,
    type EnrichmentPackage,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductFlag,
    getProductById,
    uploadProductImage,
    generateProductCopy,
    enrichProduct,
    bulkUpdateProducts,
} from './admin-products.service';

export {
    type CategoryFormData,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
} from './admin-categories.service';

export {
    type AdminCustomer,
    type AdminCustomerDetail,
    type CreateCustomerData,
    type WishlistItem,
    getAllCustomers,
    getCustomerOrders,
    getAdminCustomerDetails,
    createCustomerWithDetails,
    updateAdminCustomerNotes,
    uploadCustomerEvidence,
    updateCustomerStatus,
    sendCustomerNotification,
    getCustomerPreferences,
    getCustomerWishlist,
    suggestCustomerTags,
} from './admin-customers.service';

export {
    type AdminCoupon,
    type CouponFormData,
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    generateCouponSystem,
    forecastCouponImpact,
} from './admin-coupons.service';

export {
    type ProductTag,
    getAllTags,
    createTag,
    renameTag,
    deleteTag,
    getTagNames,
} from './admin-tags.service';

export {
    type TestimonialFormData,
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    hardDeleteTestimonial,
    toggleTestimonialFeatured,
    toggleTestimonialActive,
} from './admin-testimonials.service';

export {
    type FlashDeal,
    type FlashDealFormData,
    getAllFlashDeals,
    getActiveFlashDeals,
    createFlashDeal,
    updateFlashDeal,
    deleteFlashDeal,
    toggleFlashDealActive,
} from './admin-flash-deals.service';

export {
    getAllAttributes,
    createAttribute,
    updateAttribute,
    createAttributeValue,
    deleteAttribute,
    deleteAttributeValue,
    getProductVariants,
    syncProductVariants,
    type VariantInput,
} from './admin-variants.service';

export {
    type Brand,
    getBrands,
    getActiveBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    duplicateBrand,
    uploadBrandLogo,
} from './admin-brands.service';

export {
    type WheelPrizeAdmin,
    type WheelPrizeFormData,
    type WheelStats,
    getAllWheelPrizes,
    createWheelPrize,
    updateWheelPrize,
    deleteWheelPrize,
    toggleWheelPrize,
    getWheelStats,
} from './admin-wheel.service';

export {
    type NLPIntent,
    adminNLPService,
} from './admin-nlp.service';

export {
    type CustomerIntelligence,
    type TimelineEvent,
    type CustomerInsight,
    type StrategicAIResponse,
    type AdminCustomerMemory,
    getCustomerIntelligence,
    getCustomerInsights,
    getCustomerTimeline,
    getCustomerMemory,
    getCustomerNarrative,
    getStrategicLoyaltyAnalysis,
    generateWhatsAppMessage,
    getProactiveInsights,
} from './admin-crm.service';

export {
    type FlashDealSuggestion,
    suggestFlashDealSystem,
} from './admin-marketing.service';

export {
    type PilotKPIs,
    type PilotQueryRow,
    type PilotBucket,
    getPilotKPIs,
    getPilotQueryLog,
    filterByBucket,
} from './admin-pilot-ops.service';

// Intervention Workflow (MVP: operator review & decisions; backend: signal creation)
export {
    type RecordSignalInput,
    recordInterventionSignal,    // Backend-only (SERVICE_ROLE)
    diagnoseSignal,               // Pure function
    createRecommendation,         // Backend-only (SERVICE_ROLE)
    getPendingRecommendations,    // MVP: fetch pending for operator
    getRecommendations,           // MVP: fetch with filters
    recordOperatorDecision,       // MVP: operator approve/reject
    acknowledgeSignal,            // MVP: mark signal handled
} from './intervention-workflow.service';
