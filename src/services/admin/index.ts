// ─── Admin Services Barrel ───────────────────────
// Re-exports everything from modular admin services.
// Consumers import from '@/services/admin' instead of individual files.

export { checkIsAdmin } from './admin-auth.service';

export {
    type DailySales,
    type TopProduct,
    type DashboardStats,
    getDashboardStats,
    getRecentOrders,
    getDashboardPulse,
    getOracleLowStockProducts,
} from './admin-dashboard.service';

export {
    type OrderStatus,
    type OrderItem,
    type AdminOrder,
    ORDER_STATUSES,
    getAllOrders,
    updateOrderStatus,
    updateOrderTracking,
    exportOrdersToCSV,
} from './admin-orders.service';

export {
    type ProductFormData,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductFlag,
    getProductById,
    uploadProductImage,
    generateProductCopy,
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
    generateCouponMagic,
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
    createAttributeValue,
    deleteAttribute,
    deleteAttributeValue,
    getProductVariants,
    syncProductVariants,
} from './admin-variants.service';

export {
    type Brand,
    getBrands,
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
    getCustomerIntelligence,
    getCustomerInsights,
    getCustomerTimeline,
    getCustomerNarrative,
    getStrategicLoyaltyAnalysis,
    generateWhatsAppMessage,
    getProactiveInsights,
} from './admin-crm.service';

export {
    type FlashDealSuggestion,
    suggestFlashDealMagic,
} from './admin-marketing.service';
