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
} from './admin-dashboard.service';

export {
    type OrderStatus,
    type OrderItem,
    type AdminOrder,
    ORDER_STATUSES,
    getAllOrders,
    updateOrderStatus,
} from './admin-orders.service';

export {
    type ProductFormData,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductFlag,
    getProductById,
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
    getAllCustomers,
    getCustomerOrders,
    getAdminCustomerDetails,
    createCustomerWithDetails,
    updateAdminCustomerNotes,
    uploadCustomerEvidence,
    updateCustomerStatus,
    sendCustomerNotification,
    getCustomerPreferences,
} from './admin-customers.service';

export {
    type AdminCoupon,
    type CouponFormData,
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} from './admin-coupons.service';
