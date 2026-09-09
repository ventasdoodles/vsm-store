# Mapa de Contexto (Destilado)

### src\actions\checkout.ts
```typescript
export interface CheckoutActionItem {
export interface CheckoutActionInput {
export interface CheckoutActionResult {
```

### src\AdminApp.tsx
```typescript
export function AdminApp() {
```

### src\App.tsx
```typescript
export function App() {
```

### src\components\addresses\AddressCard.tsx
```typescript
export function AddressCard({ address, onEdit, onDelete, onSetDefault, selected, compact }: AddressCardProps) {
```

### src\components\addresses\AddressForm.tsx
```typescript
export function AddressForm({ address, customerId, onSubmit, onCancel, loading }: AddressFormProps) {
```

### src\components\addresses\AddressList.tsx
```typescript
export function AddressList({ customerId, type, selectable, selectedId, onSelect }: AddressListProps) {
```

### src\components\admin\AdminErrorBoundary.tsx
```typescript
export class AdminErrorBoundary extends React.Component<Props, State> {
```

### src\components\admin\AdminGuard.tsx
```typescript
export function AdminGuard({ children }: AdminGuardProps) {
```

### src\components\admin\AdminLayout.tsx
```typescript
export function AdminLayout({ children }: AdminLayoutProps) {
```

### src\components\admin\brands\BrandAdminCard.tsx
```typescript
export function BrandAdminCard({ brand, onEdit, onDuplicate, onDelete, onToggleActive }: BrandAdminCardProps) {
```

### src\components\admin\brands\BrandsFilters.tsx
```typescript
export function BrandsFilters({ search, onSearchChange }: FiltersProps) {
```

### src\components\admin\brands\BrandsFormModal.tsx
```typescript
export type BrandFormData = Omit<Brand, 'id' | 'created_at' | 'updated_at'>;
export function BrandsFormModal({
```

### src\components\admin\brands\BrandsGrid.tsx
```typescript
export function BrandsGrid({ brands, onEdit, onDuplicate, onDelete, onToggleActive }: BrandsGridProps) {
```

### src\components\admin\brands\BrandsHeader.tsx
```typescript
export function BrandsHeader({ onNew }: BrandsHeaderProps) {
```

### src\components\admin\brands\BrandsStats.tsx
```typescript
export function BrandsStats({ stats }: StatsProps) {
```

### src\components\admin\categories\CategoriesHeader.tsx
```typescript
export function CategoriesHeader({ categories, sectionFilter, onSectionChange, onNew }: CategoriesHeaderProps) {
```

### src\components\admin\categories\CategoryForm.tsx
```typescript
export function CategoryForm({ open, editing, parentCategory, allCategories, isSaving, onSave, onClose }: CategoryFormProps) {
```

### src\components\admin\categories\CategoryTreeContainer.tsx
```typescript
export function CategoryTreeContainer({
```

### src\components\admin\categories\CategoryTreeNode.tsx
```typescript
export function CategoryTreeNode({
```

### src\components\admin\cesarin\TabInteractions.tsx
```typescript
export function TabInteractions({ interactions = [], onAddNote }: TabInteractionsProps) {
```

### src\components\admin\cesarin\TabPerformance.tsx
```typescript
export function TabPerformance() {
```

### src\components\admin\cesarin\TabRules.tsx
```typescript
export function TabRules() {
```

### src\components\admin\cesarin\TabTraining.tsx
```typescript
export function TabTraining() {
```

### src\components\admin\coupons\CouponCard.tsx
```typescript
export function CouponCard({ coupon, onEdit, onDelete, onDuplicate }: Props) {
```

### src\components\admin\coupons\CouponForm.tsx
```typescript
export function CouponForm({ initialData, onSubmit, onCancel, isSubmitting }: Props) {
```

### src\components\admin\coupons\CouponHeader.tsx
```typescript
export function CouponHeader({ onNewCoupon }: CouponHeaderProps) {
```

### src\components\admin\coupons\CouponStats.tsx
```typescript
export function CouponStats({ coupons }: Props) {
```

### src\components\admin\customers\CustomerDirectoryHeader.tsx
```typescript
export function CustomerDirectoryHeader({ onNewCustomer }: Props) {
```

### src\components\admin\customers\CustomerDirectoryStats.tsx
```typescript
export function CustomerDirectoryStats({ customers }: Props) {
```

### src\components\admin\customers\CustomerFormModal.tsx
```typescript
export function CustomerFormModal({ isOpen, onClose, onSuccess }: CustomerFormModalProps) {
```

### src\components\admin\customers\CustomerIntelligencePanel.tsx
```typescript
export function CustomerIntelligencePanel({ customerId }: CustomerIntelligencePanelProps) {
```

### src\components\admin\customers\CustomerList.tsx
```typescript
export function CustomerList({ customers }: Props) {
```

### src\components\admin\customers\details\CustomerAddress.tsx
```typescript
export function CustomerAddress({ customer }: Props) {
```

### src\components\admin\customers\details\CustomerEvidence.tsx
```typescript
export function CustomerEvidence({ customer }: Props) {
```

### src\components\admin\customers\details\CustomerGodMode.tsx
```typescript
export function CustomerGodMode({ customer }: Props) {
```

### src\components\admin\customers\details\CustomerHeader.tsx
```typescript
export function CustomerHeader({ customer }: Props) {
```

### src\components\admin\customers\details\CustomerMarketing.tsx
```typescript
export function CustomerMarketing({ customer }: Props) {
```

### src\components\admin\customers\details\CustomerNotes.tsx
```typescript
export function CustomerNotes({ customer }: Props) {
```

### src\components\admin\customers\details\CustomerPreferences.tsx
```typescript
export function CustomerPreferences({ customer }: Props) {
```

### src\components\admin\customers\details\CustomerStats.tsx
```typescript
export function CustomerStats({ customer }: Props) {
```

### src\components\admin\customers\details\CustomerTimeline.tsx
```typescript
export function CustomerTimeline({ customer }: Props) {
```

### src\components\admin\customers\details\CustomerWishlist.tsx
```typescript
export function CustomerWishlist({ customer }: Props) {
```

### src\components\admin\customers\IntelligenceMessageBubble.tsx
```typescript
export function IntelligenceMessageBubble({
```

### src\components\admin\customers\IntelligenceToolRenderer.tsx
```typescript
export function IntelligenceToolRenderer({
```

### src\components\admin\CustomerSelect.tsx
```typescript
export function CustomerSelect({ value, onChange }: CustomerSelectProps) {
```

### src\components\admin\dashboard\AdminOracleDashboard.tsx
```typescript
export function AdminOracleDashboard() {
```

### src\components\admin\dashboard\AIInsights.tsx
```typescript
export function AIInsights() {
```

### src\components\admin\dashboard\DashboardHeader.tsx
```typescript
export function DashboardHeader({ dateRange, setDateRange, onExport }: DashboardHeaderProps) {
```

### src\components\admin\dashboard\DashboardPulse.tsx
```typescript
export const DashboardPulse = React.memo(({ stats }: DashboardPulseProps) => {
```

### src\components\admin\dashboard\DashboardStats.tsx
```typescript
export function DashboardStats({ stats }: DashboardStatsProps) {
```

### src\components\admin\dashboard\RecentOrders.tsx
```typescript
export function RecentOrders({ orders = [] }: RecentOrdersProps) {
```

### src\components\admin\dashboard\SalesChart.tsx
```typescript
export function SalesChart({ chartData = [], dateRange }: SalesChartProps) {
```

### src\components\admin\dashboard\TopProducts.tsx
```typescript
export function TopProducts({ products = [] }: TopProductsProps) {
```

### src\components\admin\flash-deals\FlashDealEditor.tsx
```typescript
export function FlashDealEditor({
```

### src\components\admin\flash-deals\FlashDealsConfig.tsx
```typescript
export function FlashDealsConfig({ deals }: FlashDealsConfigProps) {
```

### src\components\admin\flash-deals\FlashDealsHeader.tsx
```typescript
export function FlashDealsHeader({ deals, onAdd }: FlashDealsHeaderProps) {
```

### src\components\admin\flash-deals\FlashDealsTable.tsx
```typescript
export function FlashDealsTable({
```

### src\components\admin\home-editor\HomeEditorHeader.tsx
```typescript
export function HomeEditorHeader({
```

### src\components\admin\home-editor\HomeEditorSlotCard.tsx
```typescript
export function HomeEditorSlotCard({
```

### src\components\admin\ImageUploader.tsx
```typescript
export function ImageUploader({ images, coverImage, onChange, onCoverChange }: ImageUploaderProps) {
```

### src\components\admin\layout\AdminPulse.tsx
```typescript
export const AdminPulse = React.memo(() => {
```

### src\components\admin\layout\AnimatedAtmosphere.tsx
```typescript
export const AnimatedAtmosphere = React.memo(() => {
```

### src\components\admin\loyalty\LoyaltyHeader.tsx
```typescript
export function LoyaltyHeader({ loyaltyConfig, onToggleEnable }: LoyaltyHeaderProps) {
```

### src\components\admin\loyalty\LoyaltyRulesForm.tsx
```typescript
export function LoyaltyRulesForm({ config, onChange }: LoyaltyRulesFormProps) {
```

### src\components\admin\loyalty\LoyaltySimulator.tsx
```typescript
export function LoyaltySimulator({ config }: { config: LoyaltyConfig }) {
```

### src\components\admin\loyalty\LoyaltyStats.tsx
```typescript
export function LoyaltyStats() {
```

### src\components\admin\loyalty\TierManagement.tsx
```typescript
export function TierManagement({ tiers, onSave, isUpdating }: TierManagementProps) {
```

### src\components\admin\monitoring\HealthPulse.tsx
```typescript
export function HealthPulse({ isHealthy, lastCheckTime, uptimeMinutes }: HealthPulseProps) {
```

### src\components\admin\monitoring\InventoryAlertsPanel.tsx
```typescript
export function InventoryAlertsPanel() {
```

### src\components\admin\monitoring\LiveUsersPanel.tsx
```typescript
export interface ActiveUser {
export function LiveUsersPanel({ users }: LiveUsersPanelProps) {
```

### src\components\admin\monitoring\MonitoringHeader.tsx
```typescript
export function MonitoringHeader({ onlineCount, errorCount, warnCount }: MonitoringHeaderProps) {
```

### src\components\admin\monitoring\MonitoringStatsGrid.tsx
```typescript
export function MonitoringStatsGrid({
```

### src\components\admin\monitoring\SystemLogsPanel.tsx
```typescript
export interface AppLogEntry {
export function SystemLogsPanel({ logs, isLoading }: SystemLogsPanelProps) {
```

### src\components\admin\orders\OrderBoardCard.tsx
```typescript
export function OrderBoardCard({ order, onStatusChange, isDragging }: OrderBoardCardProps) {
```

### src\components\admin\orders\OrderDetailDrawer.tsx
```typescript
export function OrderDetailDrawer({ order, isOpen, onClose, onStatusChange, onPaymentStatusChange, onTrackingUpdate, onCancelOrder, isCancelling }: OrderDetailDrawerProps) {
```

### src\components\admin\orders\OrderListCard.tsx
```typescript
export function OrderListCard({ order, isUpdating, isSelected, onSelect, onStatusChange, onTrackingChange, onOrderClick }: OrderListCardProps) {
```

### src\components\admin\orders\OrdersFilter.tsx
```typescript
export function OrdersFilter({ statusFilter, setStatusFilter }: OrdersFilterProps) {
```

### src\components\admin\orders\OrdersHeader.tsx
```typescript
export function OrdersHeader({
```

### src\components\admin\orders\OrdersKanbanBoard.tsx
```typescript
export function OrdersKanbanBoard({ orders, onStatusChange, onOrderClick }: OrdersKanbanBoardProps) {
```

### src\components\admin\orders\OrdersTable.tsx
```typescript
export function OrdersTable({
```

### src\components\admin\Pagination.tsx
```typescript
export function Pagination({ currentPage, totalPages, onPageChange, itemsLabel }: PaginationProps) {
export function usePagination<T>(items: T[], pageSize = 10) {
export function paginateItems<T>(items: T[], page: number, pageSize = 10): T[] {
```

### src\components\admin\products\CategoryCascader.tsx
```typescript
export function CategoryCascader({ categories, section, value, onChange }: CategoryCascaderProps) {
```

### src\components\admin\products\ImageUploader.tsx
```typescript
export function ImageUploader({ images, onChange, onUpload, maxImages = 4 }: ImageUploaderProps) {
```

### src\components\admin\products\ProductEditorDrawer.tsx
```typescript
export function ProductEditorDrawer({
```

### src\components\admin\products\ProductEditorTabs.tsx
```typescript
export type EditorTab = 'comercial' | 'clasificacion' | 'configuracion' | 'inteligencia';
export function ProductEditorTabs({ activeTab, setActiveTab }: ProductEditorTabsProps) {
```

### src\components\admin\products\ProductEnrichmentReview.tsx
```typescript
export function EnrichmentFieldRow({ fieldKey, label, approved, onToggle, children }: EnrichmentFieldRowProps) {
export function ProductEnrichmentReview({
```

### src\components\admin\products\ProductsFilter.tsx
```typescript
export function ProductsFilter({
```

### src\components\admin\products\ProductsHeader.tsx
```typescript
export function ProductsHeader({ products, onExportCSV, onAddProduct }: ProductsHeaderProps) {
```

### src\components\admin\products\ProductSpecsBuilder.tsx
```typescript
export function ProductSpecsBuilder({
```

### src\components\admin\products\ProductsTable.tsx
```typescript
export function ProductsTable({
```

### src\components\admin\products\ProductsTableColumns.tsx
```typescript
export const columns = [
```

### src\components\admin\products\ProductsTableContext.ts
```typescript
export interface RowContextType {
export const RowContext = createContext<RowContextType | null>(null);
export function useRowContext() {
export interface TableMetaType {
```

### src\components\admin\products\ProductTableRow.tsx
```typescript
export function ProductTableRow({ row }: ProductTableRowProps) {
```

### src\components\admin\products\ProductVariantsEditor.tsx
```typescript
export function ProductVariantsEditor({
```

### src\components\admin\settings\FlashDealsSettings.tsx
```typescript
export function FlashDealsSettings({ flashDealsEnd, onChangeDate }: FlashDealsSettingsProps) {
```

### src\components\admin\settings\GeneralSettings.tsx
```typescript
export function GeneralSettings({ formData, handleChange }: GeneralSettingsProps) {
```

### src\components\admin\settings\PaymentSettings.tsx
```typescript
export function PaymentSettings({ formData, handleChange }: PaymentSettingsProps) {
```

### src\components\admin\settings\settings.types.ts
```typescript
export interface SettingsFormData {
export type SettingsChangeHandler = (
```

### src\components\admin\settings\SettingsHeader.tsx
```typescript
export function SettingsHeader() {
```

### src\components\admin\settings\SettingsSaveBar.tsx
```typescript
export function SettingsSaveBar({ isPending }: SettingsSaveBarProps) {
```

### src\components\admin\settings\SocialSettings.tsx
```typescript
export function SocialSettings({ formData, handleChange }: SocialSettingsProps) {
```

### src\components\admin\settings\VerticalPackConfigSettings.tsx
```typescript
export function VerticalPackConfigSettings({ formData, handleChange }: Props) {
```

### src\components\admin\settings\WhatsAppSettings.tsx
```typescript
export function WhatsAppSettings({ formData, handleChange }: WhatsAppSettingsProps) {
```

### src\components\admin\sliders\SliderAdminCard.tsx
```typescript
export function SliderAdminCard({
```

### src\components\admin\sliders\SliderFormModal.tsx
```typescript
export function SliderFormModal({
```

### src\components\admin\sliders\SlidersHeader.tsx
```typescript
export function SlidersHeader({ onCreateNew, total, activeCount }: SlidersHeaderProps) {
```

### src\components\admin\sliders\SlidersList.tsx
```typescript
export function SlidersList({ sliders, onEdit, onDelete, onToggleStatus, onReorder }: SlidersListProps) {
```

### src\components\admin\tags\TagFormModal.tsx
```typescript
export interface TagFormData {
export function TagFormModal({
```

### src\components\admin\tags\TagRow.tsx
```typescript
export function TagRow({ tag, isDeleting, onEdit, onDelete }: TagRowProps) {
```

### src\components\admin\tags\TagsFilters.tsx
```typescript
export function TagsFilters({ search, onSearchChange }: TagsFiltersProps) {
```

### src\components\admin\tags\TagsHeader.tsx
```typescript
export function TagsHeader({ onNew }: TagsHeaderProps) {
```

### src\components\admin\tags\TagsStats.tsx
```typescript
export function TagsStats({ total, productsTagged, mostUsedTag }: TagsStatsProps) {
```

### src\components\admin\tags\TagsTable.tsx
```typescript
export function TagsTable({ tags, deletingName, onEdit, onDelete }: TagsTableProps) {
```

### src\components\admin\testimonials\TestimonialAdminCard.tsx
```typescript
export function TestimonialAdminCard({
```

### src\components\admin\testimonials\TestimonialsFilters.tsx
```typescript
export function TestimonialsFilters({
```

### src\components\admin\testimonials\TestimonialsForm.tsx
```typescript
export function TestimonialsForm({
```

### src\components\admin\testimonials\TestimonialsGrid.tsx
```typescript
export function TestimonialsGrid({
```

### src\components\admin\testimonials\TestimonialsHeader.tsx
```typescript
export function TestimonialsHeader({ onNew }: TestimonialsHeaderProps) {
```

### src\components\admin\testimonials\TestimonialsStats.tsx
```typescript
export function TestimonialsStats({ stats, sectionCounts }: StatsProps) {
```

### src\components\admin\ui\AdminCommandPalette.tsx
```typescript
export function AdminCommandPalette() {
```

### src\components\admin\ui\AdminEmptyState.tsx
```typescript
export function AdminEmptyState({ icon: Icon, title, description, className }: AdminEmptyStateProps) {
```

### src\components\admin\ui\SupplierOrderModal.tsx
```typescript
export function SupplierOrderModal({ isOpen, onClose, product }: SupplierOrderModalProps) {
```

### src\components\admin\wheel-game\WheelGameHeader.tsx
```typescript
export function WheelGameHeader({ prizes, stats, onAdd }: WheelGameHeaderProps) {
```

### src\components\admin\wheel-game\WheelGamePrizeEditor.tsx
```typescript
export function WheelGamePrizeEditor({
```

### src\components\admin\wheel-game\WheelGamePrizeList.tsx
```typescript
export function WheelGamePrizeList({
```

### src\components\admin\wheel-game\WheelGameStatsPanel.tsx
```typescript
export function WheelGameStatsPanel({ stats, isLoading }: WheelGameStatsPanelProps) {
```

### src\components\auth\LoginForm.tsx
```typescript
export function LoginForm({ onSuccess, onSwitchToSignUp }: LoginFormProps) {
```

### src\components\auth\ProtectedRoute.tsx
```typescript
export function ProtectedRoute({ children }: ProtectedRouteProps) {
```

### src\components\auth\SignUpForm.tsx
```typescript
export function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
```

### src\components\cart\CartButton.tsx
```typescript
export function CartButton() {
```

### src\components\cart\CartItemCard.tsx
```typescript
export interface CartItemProps {
export const CartItemCard = memo(({ item, isVape, onUpdateQuantity, onRemove }: CartItemProps) => {
```

### src\components\cart\CartSidebar.tsx
```typescript
export function CartSidebar() {
```

### src\components\cart\CartSmartUpsell.tsx
```typescript
export const CartSmartUpsell = memo(({ product }: { product: Product }) => {
```

### src\components\cart\CheckoutForm.tsx
```typescript
export function CheckoutForm({ onSuccess, openRecoverableOrder = null }: CheckoutFormProps) {
```

### src\components\cart\CheckoutSteps.tsx
```typescript
export function CheckoutSteps({ currentStep, steps }: CheckoutStepsProps) {
```

### src\components\cart\CheckoutTransitionStatus.tsx
```typescript
export function CheckoutTransitionStatus({
```

### src\components\cart\OpenRecoverableOrderNotice.tsx
```typescript
export function OpenRecoverableOrderNotice({
```

### src\components\cart\PaymentMethodContent.tsx
```typescript
export function PaymentMethodContent({
```

### src\components\cart\ShippingAddressContent.tsx
```typescript
export function ShippingAddressContent({
```

### src\components\categories\CategoryCard.tsx
```typescript
export function CategoryCard({ category, section, className }: CategoryCardProps) {
```

### src\components\checkout\CheckoutBlockedState.tsx
```typescript
export function CheckoutBlockedState({ headline, detail, onGoToCatalog }: CheckoutBlockedStateProps) {
```

### src\components\checkout\CheckoutDesktopSummary.tsx
```typescript
export function CheckoutDesktopSummary({
```

### src\components\checkout\CheckoutHeader.tsx
```typescript
export function CheckoutHeader({ onBack }: CheckoutHeaderProps) {
```

### src\components\checkout\CheckoutMobileSummary.tsx
```typescript
export function CheckoutMobileSummary({
```

### src\components\ErrorBoundary.tsx
```typescript
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
```

### src\components\gamification\PrizeWheel.tsx
```typescript
export function PrizeWheel() {
```

### src\components\home\ai\SmartBanner.tsx
```typescript
export const SmartBanner: React.FC = () => {
```

### src\components\home\BrandsCarousel.tsx
```typescript
export const BrandsCarousel = () => {
```

### src\components\home\CategoryShowcase.tsx
```typescript
export const CategoryShowcase = () => {
```

### src\components\home\FlashDeals.tsx
```typescript
export const FlashDeals = () => {
```

### src\components\home\MegaHero.tsx
```typescript
export const MegaHero = () => {
```

### src\components\home\ProductRail.tsx
```typescript
export function ProductRail({ type, title, section, className }: ProductRailProps) {
```

### src\components\home\PromoSection.tsx
```typescript
export function PromoSection() {
```

### src\components\home\social\CompactSocialProof.tsx
```typescript
export function CompactSocialProof({
```

### src\components\home\social\SocialHero.tsx
```typescript
export function SocialHero({ avgRating, totalCount }: SocialHeroProps) {
```

### src\components\home\social\SocialSkeleton.tsx
```typescript
export function SocialSkeleton() {
```

### src\components\home\social\TestimonialCard.tsx
```typescript
export function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
```

### src\components\home\social\TestimonialCarousel.tsx
```typescript
export function TestimonialCarousel({ items }: TestimonialCarouselProps) {
```

### src\components\home\social\TrustSection.tsx
```typescript
export function TrustSection({ avgRating, totalCount }: TrustSectionProps) {
```

### src\components\home\SocialProof.tsx
```typescript
export function SocialProof({
```

### src\components\home\TrustBadges.tsx
```typescript
export const TrustBadges = () => {
```

### src\components\home\WheelInvitation.tsx
```typescript
export function WheelInvitation() {
```

### src\components\layout\BottomNavigation.tsx
```typescript
export const BottomNavigation = memo(function BottomNavigation() {
```

### src\components\layout\Footer.tsx
```typescript
export const Footer = memo(function Footer() {
```

### src\components\layout\header\CategoryDropdown.tsx
```typescript
export function CategoryDropdown({ section, label, icon, colorClass, hoverBg, compact = false }: CategoryDropdownProps) {
```

### src\components\layout\header\DeliveryLocation.tsx
```typescript
export function DeliveryLocation() {
```

### src\components\layout\header\DesktopNav.tsx
```typescript
export function DesktopNav({ compact = false }: DesktopNavProps) {
```

### src\components\layout\header\HeaderActions.tsx
```typescript
export function HeaderActions({ menuOpen, onMenuToggle }: HeaderActionsProps) {
```

### src\components\layout\header\HeaderLogo.tsx
```typescript
export function HeaderLogo() {
```

### src\components\layout\header\MegaMenu.tsx
```typescript
export function MegaMenu({ section, label, icon, colorClass, compact = false }: MegaMenuProps) {
```

### src\components\layout\header\MobileMenu.tsx
```typescript
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
```

### src\components\layout\header\NotificationBell.tsx
```typescript
export function NotificationBell() {
```

### src\components\layout\header\TopBanner.tsx
```typescript
export function TopBanner() {
```

### src\components\layout\header\UserMenuDropdown.tsx
```typescript
export function UserMenuDropdown() {
```

### src\components\layout\Header.tsx
```typescript
export function Header() {
```

### src\components\layout\Layout.tsx
```typescript
export function Layout({ children }: LayoutProps) {
```

### src\components\loyalty\ApplyReferralForm.tsx
```typescript
export function ApplyReferralForm() {
```

### src\components\loyalty\PointsDisplay.tsx
```typescript
export function PointsDisplay({ points, size = 'md', label = 'V-Coins' }: PointsDisplayProps) {
```

### src\components\loyalty\ProgressBar.tsx
```typescript
export function ProgressBar({ value, max = 100, tier = 'bronze', label, showPercentage, height = 'md' }: ProgressBarProps) {
```

### src\components\loyalty\ReferralCard.tsx
```typescript
export function ReferralCard({ referralCode, stats, loading }: ReferralCardProps) {
```

### src\components\loyalty\SmartQuests.tsx
```typescript
export const SmartQuests: React.FC = () => {
```

### src\components\loyalty\SmartRewardToast.tsx
```typescript
export function SmartRewardToast() {
```

### src\components\loyalty\TierBadge.tsx
```typescript
export function TierBadge({ tier, size = 'md', showLabel = true, customLabel }: TierBadgeProps) {
```

### src\components\notifications\NotificationCenter.tsx
```typescript
export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
```

### src\components\notifications\OrderNotifications.tsx
```typescript
export function OrderNotifications() {
```

### src\components\notifications\Toast.tsx
```typescript
export function Toast({ notification, onClose }: ToastProps) {
```

### src\components\notifications\ToastContainer.tsx
```typescript
export function ToastContainer() {
```

### src\components\order\PostPurchaseReceiptCard.tsx
```typescript
export function PostPurchaseReceiptCard({
```

### src\components\orders\detail\OrderHeader.tsx
```typescript
export function OrderHeader({ orderNumber, createdAt, statusConfig }: OrderHeaderProps) {
```

### src\components\orders\detail\OrderShippingCard.tsx
```typescript
export function OrderShippingCard({ trackingTrustView }: OrderShippingCardProps) {
```

### src\components\orders\detail\OrderStatusBanner.tsx
```typescript
export function OrderStatusBanner({
```

### src\components\orders\detail\OrderSummaryCard.tsx
```typescript
export function OrderSummaryCard({
```

### src\components\orders\detail\OrderTimeline.tsx
```typescript
export function OrderTimeline({ statusSteps, currentStepIndex, statusConfigMap, statusIcons }: OrderTimelineProps) {
```

### src\components\products\FilterSidebar.tsx
```typescript
export function FilterSidebar({ products, section, activeFilters, onChange, onClose }: FilterSidebarProps) {
```

### src\components\products\FrequentlyBoughtTogether.tsx
```typescript
export function FrequentlyBoughtTogether({ currentProduct }: FrequentlyBoughtTogetherProps) {
```

### src\components\products\ProductActions.tsx
```typescript
export function ProductActions({ product }: ProductActionsProps) {
```

### src\components\products\ProductBadgeGroup.tsx
```typescript
export function ProductBadgeGroup({ product }: ProductBadgeGroupProps) {
```

### src\components\products\ProductBreadcrumbs.tsx
```typescript
export function ProductBreadcrumbs({ section, productName, productSlug, categoryId }: ProductBreadcrumbsProps) {
```

### src\components\products\ProductCard.tsx
```typescript
export const ProductCard = memo(function ProductCard({ product, className, compact = false, priority = false }: ProductCardProps) {
```

### src\components\products\ProductCardSkeleton.tsx
```typescript
export const ProductCardSkeleton = memo(({ className, style }: ProductCardSkeletonProps) => {
```

### src\components\products\ProductGrid.tsx
```typescript
export function ProductGrid({ products, isLoading = false, className, onClearFilter, emptyStateTitle, emptyStateSubtext }: ProductGridProps) {
```

### src\components\products\productGridStatesFixture.ts
```typescript
export function makeProductGridStateFixture(overrides: Partial<Product> = {}): Product {
export function makeProductGridStateFixtures(): Product[] {
```

### src\components\products\ProductImages.tsx
```typescript
export function ProductImages({ images, coverImage, productName }: ProductImagesProps) {
```

### src\components\products\ProductInfo.tsx
```typescript
export function ProductInfo({ product }: ProductInfoProps) {
```

### src\components\products\ProductPriceSection.tsx
```typescript
export function ProductPriceSection({ price, compareAtPrice, section }: ProductPriceSectionProps) {
```

### src\components\products\ProductSkeleton.tsx
```typescript
export function ProductSkeleton() {
```

### src\components\products\ProductSmartKitting.tsx
```typescript
export const ProductSmartKitting = memo(({ product }: ProductSmartKittingProps) => {
```

### src\components\products\productSurfaceFixture.ts
```typescript
export function makeProductSurfaceFixture(overrides: Partial<Product> = {}): Product {
```

### src\components\products\QuickViewModal.tsx
```typescript
export const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
```

### src\components\products\RelatedProducts.tsx
```typescript
export function RelatedProducts({ product }: RelatedProductsProps) {
```

### src\components\products\ShareButton.tsx
```typescript
export function ShareButton({ product, className }: ShareButtonProps) {
```

### src\components\products\StickyAddToCart.tsx
```typescript
export function StickyAddToCart({
```

### src\components\products\StockOracleBadge.tsx
```typescript
export function StockOracleBadge({ prediction, isLoading }: StockOracleBadgeProps) {
```

### src\components\products\UrgencyIndicators.tsx
```typescript
export const UrgencyIndicators = ({ stock, className }: UrgencyIndicatorsProps) => {
```

### src\components\profile\AvatarUpload.tsx
```typescript
export function AvatarUpload({ currentUrl, userId, onUploadSuccess }: AvatarUploadProps) {
```

### src\components\profile\ProfileActions.tsx
```typescript
export function ProfileActions() {
```

### src\components\profile\ProfileForm.tsx
```typescript
export function ProfileForm() {
```

### src\components\profile\ProfileHero.tsx
```typescript
export function ProfileHero() {
```

### src\components\profile\ProfileInfo.tsx
```typescript
export function ProfileInfo() {
```

### src\components\profile\ProfileQuickLinks.tsx
```typescript
export function ProfileQuickLinks() {
```

### src\components\profile\ProfileStats.tsx
```typescript
export function ProfileStats() {
```

### src\components\search\MobileSearchOverlay.tsx
```typescript
export function MobileSearchOverlay() {
```

### src\components\search\SearchBar.tsx
```typescript
export const SearchBar = ({ className }: SearchBarProps = {}) => {
```

### src\components\seo\BreadcrumbJsonLd.tsx
```typescript
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
```

### src\components\seo\OrganizationJsonLd.tsx
```typescript
export function OrganizationJsonLd() {
```

### src\components\seo\ProductJsonLd.tsx
```typescript
export function ProductJsonLd({ product }: ProductJsonLdProps) {
```

### src\components\seo\SEO.tsx
```typescript
export function SEO({
```

### src\components\social\SocialLinks.tsx
```typescript
export function SocialLinks({ className, size = 'medium', variant = 'icons' }: SocialLinksProps) {
```

### src\components\ui\AdaptiveThemeEngine.tsx
```typescript
export const AdaptiveThemeEngine: React.FC = () => {
```

### src\components\ui\ai\AIConcierge.tsx
```typescript
export const AIConcierge: React.FC = () => {
```

### src\components\ui\ai\ConciergeMessageItem.tsx
```typescript
export interface ConciergeMessageItemProps {
export const ConciergeMessageItem: React.FC<ConciergeMessageItemProps> = ({
```

### src\components\ui\ai\helpers.ts
```typescript
export function getLatestCatalogGate(messages: ConciergeMessage[]): ConciergeCatalogGate | null {
export function getSuggestionGroupLabel(matchStrategy: string | undefined) {
export type CesarinVisibleHelpTone = 'direct' | 'public' | 'catalog' | 'action';
export function getVisibleHelpToneClasses(tone: CesarinVisibleHelpTone): string {
export function getNextStepFamilyLabel(family: unknown): string | null {
export function formatSmokeAuditList(value: unknown): string {
export function getNextStepTrustNote(nextStepView: CesarinStorefrontNextStepView | null): string | null {
export function shouldShowSelectorNeededGuidance(messageContent: string, nextStepView: CesarinStorefrontNextStepView | null): boolean {
export function getNextStepActions(nextStepView: CesarinStorefrontNextStepView | null): CesarinStorefrontActionButtonView[] {
export function isFullStorefrontProduct(value: unknown): value is Product {
export function getCartAssemblyProduct(productId: string | undefined, suggestedProducts: ConciergeMessage['suggestedProducts'], fetchedProducts: Record<string, Product>): Product | null {
export function collectCartAssemblyProductIds(messages: ConciergeMessage[], fetchedProducts: Record<string, Product>): string[] {
export function getNextStepActionKey(action: CesarinStorefrontActionButtonView | null, index: number): string {
export function getAdvisoryActionLabel(action: CesarinStorefrontActionButtonView | null, eligibility: CesarinCartAssemblyEligibility | null): string {
export function getAddActionLabel(action: CesarinStorefrontActionButtonView | null, eligibility: CesarinCartAssemblyEligibility): string {
export function getOrderIdFromUrl(url: string | undefined): string | null {
export function emitCtaMeasurement(input: {
export function getVisibleHelpSurface(input: {
export type CartAssemblyFeedback = {
export function getProductPriceLabel(product: { price?: unknown; display_price?: unknown }) {
```

### src\components\ui\ai\PilotDebugBadge.tsx
```typescript
export const PilotDebugBadge: React.FC<PilotDebugBadgeProps> = ({ isAuthorized, isGlobalEnabled }) => {
```

### src\components\ui\ai\TypewriterBubble.tsx
```typescript
export const TypewriterBubble: React.FC<{ text: string; isLatest: boolean; onTick?: () => void }> = ({ text, isLatest, onTick }) => {
```

### src\components\ui\ai\VisualScannerModal.tsx
```typescript
export function VisualScannerModal({ isOpen, onClose }: VisualScannerModalProps) {
```

### src\components\ui\BottomSheet.tsx
```typescript
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
```

### src\components\ui\Button.tsx
```typescript
export type ButtonVariant =
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
export type ButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
```

### src\components\ui\CategorySkeleton.tsx
```typescript
export function CategorySkeleton({ variant = 'chips', count = 4 }: CategorySkeletonProps) {
```

### src\components\ui\ConfirmDialog.tsx
```typescript
export function ConfirmDialog() {
```

### src\components\ui\DeferredSection.tsx
```typescript
export function DeferredSection({
```

### src\components\ui\EmergencyBanner.tsx
```typescript
export const EmergencyBanner: React.FC = () => {
```

### src\components\ui\Heading.tsx
```typescript
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingTag =
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export type HeadingVariant = 'default' | 'muted' | 'accent' | 'gradient';
export type HeadingTracking = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider';
export interface HeadingBaseProps {
export type PolymorphicComponentProps<
export type PolymorphicRef<C extends React.ElementType> =
export type PolymorphicComponentPropsWithRef<
export type HeadingProps<C extends React.ElementType = React.ElementType> =
export const Heading: HeadingComponent = React.forwardRef(HeadingInner) as unknown as HeadingComponent;
```

### src\components\ui\Input.tsx
```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
```

### src\components\ui\InstallPrompt.tsx
```typescript
export function InstallPrompt() {
```

### src\components\ui\MagneticButton.tsx
```typescript
export function MagneticButton({ children, className, strength = 0.2 }: MagneticButtonProps) {
```

### src\components\ui\OptimizedImage.tsx
```typescript
export function OptimizedImage({
```

### src\components\ui\PremiumSkeleton.tsx
```typescript
export function PremiumSkeleton({ className, variant = 'rect' }: PremiumSkeletonProps) {
```

### src\components\ui\ProactiveAISuggestions.tsx
```typescript
export const ProactiveAISuggestions = memo(({
```

### src\components\ui\ScrollToTop.tsx
```typescript
export function ScrollToTop() {
```

### src\components\ui\SectionErrorBoundary.tsx
```typescript
export class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
```

### src\components\ui\SideDrawer.tsx
```typescript
export function SideDrawer({
```

### src\components\ui\SocialProofToast.tsx
```typescript
export const SocialProofToast = () => {
```

### src\components\ui\WhatsAppFloat.tsx
```typescript
export const WhatsAppFloat = () => {
```

### src\config\productization\active.ts
```typescript
export const activeVerticalPackConfig: VerticalPackConfig =
```

### src\config\productization\adminSectionCatalog.ts
```typescript
export interface AdminSectionCatalogEntry extends VerticalSectionConfig {
export interface AdminSectionCatalog {
export function buildAdminSectionCatalog(
export function getAdminDefaultSectionSlug(
export function getAdminSectionCatalogEntry(
export function buildAdminSectionCounts<T extends { section?: string | null }>(
```

### src\config\productization\categoryShowcase.ts
```typescript
export const getVape420CategoryShowcaseFallbackCategories = (config: VerticalPackConfig) =>
export const getVape420CategoryShowcaseFallbackImageUrl = getStorefrontFallbackImageUrl;
```

### src\config\productization\homeHero.ts
```typescript
export interface HomeHeroSliderFallbackConfig {
export const getVape420HomeHeroPrimaryCopy = (config: VerticalPackConfig) =>
export const getVape420HomeHeroSliderFallbacks = (config: VerticalPackConfig): HomeHeroSliderFallbackConfig[] => {
export const getVape420HomeHeroFallbackImageUrl = getStorefrontFallbackImageUrl;
```

### src\config\productization\index.ts
```typescript
export type {
export type { AdminSectionCatalog } from './adminSectionCatalog';
export type { AdminSectionCatalogEntry } from './adminSectionCatalog';
export type { SectionPageProductizationConfig } from './sectionPage';
export type { SectionPresentationProductizationConfig } from './sectionPage';
export type { ProductSurfaceProductizationConfig } from './productSurface';
export type { ProductDetailProductizationConfig } from './productDetail';
export type {
export type { VerticalPackSectionRouteManifestItem } from './routes';
export type { VerticalPackPublicSectionRouteDeclaration } from './routes';
export type { VerticalPackReadModel } from './verticalPackReadModel';
export type { VerticalPackRouteManifestItem } from './verticalPackReadModel';
export type { VerticalPackSectionReadModel } from './verticalPackReadModel';
export type { VerticalPackSectionProductGroup } from './verticalPackReadModel';
export type {
export type { LocalVerticalPackPreview } from './localVerticalPackPreview';
export type { LocalVerticalPackPreviewRouteManifestItem } from './localVerticalPackPreview';
export type { LocalVerticalPackPreviewKey } from './localVerticalPackPreview';
export type { LocalVerticalPackPreviewViewModel } from './localVerticalPackPreview';
export type { LocalVerticalPackPreviewSectionViewModel } from './localVerticalPackPreview';
export type { LocalVerticalPackPreviewShellViewModel } from './localVerticalPackPreview';
```

### src\config\productization\localVerticalPackPreview.ts
```typescript
export interface LocalVerticalPackPreview {
export type LocalVerticalPackPreviewSectionViewModel = VerticalPackSectionReadModel;
export interface LocalVerticalPackPreviewViewModel {
export interface LocalVerticalPackPreviewShellViewModel {
export type LocalVerticalPackPreviewKey = 'second-vertical-proof' | 'vape-420-preview';
export type LocalVerticalPackPreviewRouteManifestItem = VerticalPackRouteManifestItem;
export function buildLocalVerticalPackPreviewViewModel(
export function buildLocalVerticalPackPreviewShellViewModel(
export function resolveLocalVerticalPackPreviewSection(
export function resolveLocalVerticalPackPreviewByRoutePrefix(routePrefix: string): LocalVerticalPackPreview | null {
export function resolveLocalVerticalPackPreviewByKey(
```

### src\config\productization\productDetail.ts
```typescript
export interface ProductDetailProductizationConfig {
export const getVape420ProductDetailPresentationConfig = (
```

### src\config\productization\productSurface.ts
```typescript
export interface ProductSurfaceProductizationConfig {
export const getVape420ProductSurfacePresentationConfig = (
```

### src\config\productization\routes.ts
```typescript
export type VerticalPackSectionRouteManifestItem = VerticalPackRouteManifestItem;
export interface VerticalPackPublicSectionRouteDeclaration {
export const getVape420SectionRouteManifest = (config: VerticalPackConfig): VerticalPackRouteManifestItem[] =>
export const getVape420PublicSectionRouteDeclarations = (config: VerticalPackConfig): VerticalPackPublicSectionRouteDeclaration[] =>
export function resolveSectionFromRouteManifest(
```

### src\config\productization\secondVerticalProof.ts
```typescript
export type { SecondVerticalProofProduct } from './secondVerticalProofFixtures';
export const secondVerticalProofConfig = defineVerticalPack({
export const getSecondVerticalProofSections = () => secondVerticalProofConfig.sections;
```

### src\config\productization\secondVerticalProofFixtures.ts
```typescript
export interface SecondVerticalProofProduct {
export const secondVerticalProofProducts: SecondVerticalProofProduct[] = [
```

### src\config\productization\sectionPage.ts
```typescript
export interface SectionPageProductizationConfig {
export interface SectionPresentationProductizationConfig extends SectionPageProductizationConfig {
```

### src\config\productization\sectionPresentation.ts
```typescript
export const getVape420SectionPresentationConfig = (
export const getVape420SectionPageConfig = (config: VerticalPackConfig, slug: Section): SectionPageProductizationConfig => {
```

### src\config\productization\specs.ts
```typescript
export const getVape420SuggestedSpecs = (config: VerticalPackConfig): Record<string, string[]> =>
export const getVape420SectionDefaultSpecs = (config: VerticalPackConfig): Record<Section, string[]> =>
export const getVape420SpecKeyNormalization = (config: VerticalPackConfig): Record<string, string> =>
export const normalizeVape420SpecKey = (key: string, config: VerticalPackConfig): string => {
```

### src\config\productization\storefrontFallbacks.ts
```typescript
export function getStorefrontFallbackImageUrl(path: string) {
export function buildStorefrontHeroSliderFallbacks<T extends { image: string }>(
export function buildStorefrontFeaturedCategoryFallbacks<
```

### src\config\productization\storefrontRenderability.ts
```typescript
export interface StorefrontRenderabilityRailConfig {
export interface StorefrontRenderabilityGridConfig {
export interface StorefrontRenderabilityProductizationConfig {
export const getVape420StorefrontRenderabilityConfig = (
```

### src\config\productization\tenant.ts
```typescript
export const vsmStoreTenantConfig = {
```

### src\config\productization\types.ts
```typescript
export type CommerceFeatureFlag =
export interface HomeHeroMarketingCopy {
export interface TenantConfig {
export interface VerticalSectionConfig {
export interface CategoryTaxonomyHint {
export interface ProductAttributeHint {
export interface ProductAttributeSchemaConfig {
export interface CategoryShowcaseItemConfig {
export interface VerticalPackConfig {
```

### src\config\productization\vape420VerticalPack.ts
```typescript
export const vape420VerticalPackConfig = defineVerticalPack({
```

### src\config\productization\verticalPackAuthoring.ts
```typescript
export const VERTICAL_PACK_AUTHORING_REQUIRED_FIELDS = {
export function defineVerticalPack(pack: VerticalPackConfig): VerticalPackConfig {
export const verticalPackAuthoringTemplate = defineVerticalPack({
```

### src\config\productization\verticalPackContract.ts
```typescript
export interface VerticalPackContractViolation {
export interface VerticalPackContractSummary {
export function summarizeVerticalPackContract(pack: VerticalPackConfig): VerticalPackContractSummary {
export function getVerticalPackContractViolations(pack: VerticalPackConfig): VerticalPackContractViolation[] {
export function assertValidVerticalPackContract(pack: VerticalPackConfig): VerticalPackConfig {
```

### src\config\productization\verticalPackReadModel.ts
```typescript
export interface VerticalPackRouteManifestItem {
export interface VerticalPackSectionReadModel extends VerticalSectionConfig {
export interface VerticalPackSectionProductGroup<TProduct extends { sectionSlug: string }> {
export interface VerticalPackReadModel<TProduct extends { sectionSlug: string }> {
export function buildVerticalPackRouteManifest(pack: VerticalPackConfig): VerticalPackRouteManifestItem[] {
export function buildVerticalPackReadModel<TProduct extends { sectionSlug: string }>(
export function resolveVerticalPackSection(
```

### src\config\productization\verticalPackReadModelContract.ts
```typescript
export interface VerticalPackReadModelContractViolation {
export interface VerticalPackReadModelContractSummary {
export function summarizeVerticalPackReadModelContract<TProduct extends { sectionSlug: string }>(
export function getVerticalPackReadModelContractViolations<TProduct extends { sectionSlug: string }>(
export function assertValidVerticalPackReadModelContract<TProduct extends { sectionSlug: string }>(
```

### src\config\site.ts
```typescript
export const SITE_CONFIG = {
```

### src\config\storefrontSettingsFallback.ts
```typescript
export function getStorefrontHeroSliderFallbacks(): StorefrontHeroSliderFallback[] {
export function getStorefrontFeaturedCategoryFallbacks(): StorefrontFeaturedCategoryFallback[] {
export function getStorefrontSettingsFallback(): StoreSettings {
```

### src\constants\app.ts
```typescript
export const SECTIONS = {
export const PRODUCT_FLAGS = {
export const ORDER_STATUS = {
export const STORE_SETTINGS_ID = 1 as const;
export const USER_ROLES = {
```

### src\constants\category-showcase.ts
```typescript
export interface CategoryPresetGradient {
export const CATEGORY_GRADIENTS: CategoryPresetGradient[] = [
export const CATEGORY_GRADIENTS_MAP = new Map(CATEGORY_GRADIENTS.map(g => [g.id, g]));
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
export const getFallbackCategories = (config: VerticalPackConfig): FeaturedCategory[] => getVape420CategoryShowcaseFallbackCategories(config).map(
```

### src\constants\homeHero.ts
```typescript
export interface HomeHeroCopy extends HomeHeroMarketingCopy {
export const getNationalHomeHeroCopy = (config: VerticalPackConfig): HomeHeroCopy => getVape420HomeHeroPrimaryCopy(config);
export const getHomeHeroSliderFallbacks = getVape420HomeHeroSliderFallbacks;
export const getHomeHeroFallbackImageUrl = getVape420HomeHeroFallbackImageUrl;
export const hasStaleCityHeroCopy = (slide: HomeHeroSlideLike) => {
export const normalizeHomeHeroSlide = <T extends HomeHeroSlideLike>(slide: T, config: VerticalPackConfig): T => {
```

### src\constants\slider.ts
```typescript
export interface PresetGradient {
export const PREMIUM_GRADIENTS: PresetGradient[] = [
export const PREDEFINED_TAGS = [
export type SliderTag = (typeof PREDEFINED_TAGS)[number];
```

### src\constants\specs.constants.ts
```typescript
export const getSuggestedSpecs = (config: VerticalPackConfig): Record<string, string[]> => getVape420SuggestedSpecs(config);
export const getSectionDefaultSpecs = (config: VerticalPackConfig): Record<Section, string[]> => getVape420SectionDefaultSpecs(config);
export const getSpecKeyNormalization = (config: VerticalPackConfig): Record<string, string> => getVape420SpecKeyNormalization(config);
export function normalizeSpecKey(key: string, config: VerticalPackConfig): string {
```

### src\constants\storeMeta.ts
```typescript
export const getStoreMetaCopy = (config: VerticalPackConfig) => {
```

### src\contexts\AuthContext.tsx
```typescript
export type { CustomerProfile } from '@/types/customer';
export interface AuthContextValue {
export const AuthContext = createContext<AuthContextValue>({
export function AuthProvider({ children }: { children: ReactNode }) {
```

### src\contexts\SafetyContext.tsx
```typescript
export const SafetyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
export const useSafety = () => {
```

### src\contexts\TacticalContext.tsx
```typescript
export const TacticalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
export const useTacticalUI = () => {
```

### src\contexts\ThemeContext.tsx
```typescript
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
```

### src\contexts\VerticalPackContext.tsx
```typescript
export const VerticalPackContext = createContext<VerticalPackContextValue>({
export function VerticalPackProvider({ children }: { children: ReactNode }) {
export function useActiveVerticalPack() {
```

### src\hooks\admin\useAdminCatalog.ts
```typescript
export function useAdminCategories() {
export function useAdminBrands() {
export function useAdminTags() {
```

### src\hooks\admin\useAdminCustomers.ts
```typescript
export function useAdminCustomers() {
export function useAdminCustomerDetail(customerId: string | undefined) {
export function useAdminCustomerIntelligence(customerId: string | undefined) {
export function useAdminCustomerNarrative(customerId: string | undefined) {
export function useAdminStrategicAnalysis(customerId: string | undefined) {
export function useAdminProactiveInsights() {
```

### src\hooks\admin\useAdminDashboard.ts
```typescript
export function useAdminPulse() {
export function useAdminDashboardStats(startDate?: string, endDate?: string) {
export function useAdminRecentOrders(limit = 10) {
export function useAdminOracle() {
export function useAdminOraclePrediction(productId: string, currentStock: number) {
export function useAdminAIInsights(stats: DashboardStats | undefined) {
export function useAdminSearch() {
export function useAdminNLP() {
```

### src\hooks\admin\useAdminMarketing.ts
```typescript
export function useAdminCoupons() {
export function useAdminFlashDeals() {
export function useAdminTestimonials() {
```

### src\hooks\admin\useAdminOrders.ts
```typescript
export function useAdminOrders() {
```

### src\hooks\admin\useAdminPilotOps.ts
```typescript
export type TimeRange = '24h' | '7d' | '30d';
export function usePilotOps() {
```

### src\hooks\admin\useAdminProducts.ts
```typescript
export type { ProductFormData, VariantInput };
export function useAdminProducts() {
export function useAdminProductDetail(id: string | null) {
```

### src\hooks\admin\useAdminTactical.ts
```typescript
export function useAdminTactical() {
```

### src\hooks\admin\useAdminWheel.ts
```typescript
export function useAdminWheel() {
export function useAdminWheelStats() {
```

### src\hooks\admin\useVoiceRecorder.ts
```typescript
export interface VoiceRecorderResult {
export function useVoiceRecorder() {
```

### src\hooks\useAddresses.ts
```typescript
export type { Address, AddressData } from '@/services';
export function useAddresses(customerId: string | undefined) {
export function useDefaultAddress(customerId: string | undefined, type: 'shipping' | 'billing') {
export function useCreateAddress() {
export function useUpdateAddress() {
export function useDeleteAddress() {
export function useSetDefaultAddress() {
```

### src\hooks\useAdminKnowledge.ts
```typescript
export function useAdminKnowledge() {
```

### src\hooks\useAIConcierge.ts
```typescript
export function useAIConcierge() {
```

### src\hooks\useAppMonitoring.ts
```typescript
export function useAppMonitoring() {
```

### src\hooks\useAuth.ts
```typescript
export function useAuth() {
```

### src\hooks\useAuthenticatedOrderReorder.ts
```typescript
export function useAuthenticatedOrderReorder() {
```

### src\hooks\useBehaviorRules.ts
```typescript
export function useBehaviorRules() {
export function useCreateBehaviorRule() {
export function useToggleBehaviorRule() {
export function useDeleteBehaviorRule() {
```

### src\hooks\useBrands.ts
```typescript
export type { PublicBrand } from '@/services';
export function useBrands() {
```

### src\hooks\useCartValidator.ts
```typescript
export function useCartValidator() {
```

### src\hooks\useCategories.ts
```typescript
export function useCategories(section?: Section) {
export function useCategoriesWithChildren(section?: Section) {
export function useCategoryBySlug(slug: string, section: Section) {
export function useCategoryById(id?: string) {
```

### src\hooks\useCesarinActivityLog.ts
```typescript
export interface ActivityEntry {
export function useCesarinActivityLog() {
```

### src\hooks\useCesarinSignalStates.ts
```typescript
export interface SignalState {
export function useCesarinSignalStates() {
```

### src\hooks\useCheckout.ts
```typescript
export interface UseCheckoutOptions {
export interface UseCheckoutReturn {
export function useCheckout({ onSuccess }: UseCheckoutOptions): UseCheckoutReturn {
```

### src\hooks\useCheckoutValidation.ts
```typescript
export function useCheckoutValidation(isAuthenticated: boolean) {
```

### src\hooks\useConfirm.ts
```typescript
export function useConfirm() {
```

### src\hooks\useCoupons.ts
```typescript
export function useValidateCoupon() {
export function useActiveCoupons() {
```

### src\hooks\useCustomerIQ.ts
```typescript
export function useCustomerIQ() {
```

### src\hooks\useDebounce.ts
```typescript
export function useDebounce<T>(value: T, delay: number = 300): T {
```

### src\hooks\useEmergencyMode.ts
```typescript
export function useEmergencyMode() {
```

### src\hooks\useFlashDeals.ts
```typescript
export function useFlashDeals() {
```

### src\hooks\useFocusTrap.ts
```typescript
export function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive: boolean) {
```

### src\hooks\useHaptic.ts
```typescript
export function useHaptic() {
```

### src\hooks\useInventoryOracle.ts
```typescript
export function useInventoryOracle(productId: string, currentStock: number) {
```

### src\hooks\useLoyalty.ts
```typescript
export function usePointsBalance(customerId: string | undefined) {
export function usePointsHistory(customerId: string | undefined) {
export function useTierProgress(customerId: string | undefined) {
export function useRedeemPoints() {
export function useReferralStats(customerId: string | undefined) {
export function useAppliedReferral(customerId: string | undefined) {
export function useApplyReferralCode() {
export function useLoyaltyIA() {
export function useClaimIAProposition() {
```

### src\hooks\useLoyaltyStats.ts
```typescript
export type { LoyaltyStatsData } from '@/services';
export function useLoyaltyStats() {
```

### src\hooks\useNeuralHero.ts
```typescript
export interface PersonalizedSlide {
export function useNeuralHero() {
```

### src\hooks\useNeuralSearch.ts
```typescript
export interface UseNeuralSearchResult {
export function useNeuralSearch(initialQuery: string = ''): UseNeuralSearchResult {
```

### src\hooks\useNotification.ts
```typescript
export const useNotification = () => {
```

### src\hooks\useOrderNotifications.ts
```typescript
export function useOrderNotifications(
```

### src\hooks\useOrders.ts
```typescript
export type { OrderStatus, OrderRecord, OrderItem } from '@/services';
export function useCustomerOrders(customerId: string | undefined) {
export function useOrder(orderId: string | undefined) {
export function useOpenRecoverableOrder(customerId: string | undefined) {
export function useBoundedOrderStatusRefresh({
export function useOrderWithCrossSurfaceReconciliation(orderId: string | undefined) {
export function useCreateOrder() {
export function useOrderTracking() {
```

### src\hooks\usePrizeWheel.ts
```typescript
export function usePrizeWheel() {
```

### src\hooks\useProducts.ts
```typescript
export function useProducts(options?: {
export function useFeaturedProducts(section?: Section) {
export function useProductBySlug(slug: string, section: Section) {
export function useNewProducts(section?: Section) {
export function useBestsellerProducts(options?: { section?: Section; limit?: number }) {
export function useRecentProducts(limit: number = 20) {
export function useDiscountedProducts(limit: number = 50) {
```

### src\hooks\useRealtimeOrders.ts
```typescript
export function useRealtimeOrders(onNewOrder: (order: RealtimeOrderEvent) => void) {
```

### src\hooks\useScrolled.ts
```typescript
export function useScrolled(threshold = 10) {
```

### src\hooks\useSearch.ts
```typescript
export function useSearch(query: string, section?: Section) {
```

### src\hooks\useSectionFromPath.ts
```typescript
export function useSectionFromPath(config?: VerticalPackConfig | null): Section {
```

### src\hooks\useSmartBundleOffer.ts
```typescript
export function useSmartBundleOffer(product: Product | undefined, subtotal: number) {
```

### src\hooks\useSmartRecommendations.ts
```typescript
export function useSmartRecommendations(product: Product | undefined, limit = 4) {
```

### src\hooks\useStats.ts
```typescript
export function useCustomerStats(customerId: string | undefined) {
export function useTopProducts(customerId: string | undefined) {
export function useSpendingHistory(customerId: string | undefined) {
```

### src\hooks\useStorefrontCartDependencyOffer.ts
```typescript
export function useStorefrontCartDependencyOffer(items: CartItem[]) {
```

### src\hooks\useStorefrontPaymentReentry.ts
```typescript
export function useStorefrontPaymentReentry() {
```

### src\hooks\useStorefrontTactical.ts
```typescript
export function useStorefrontTactical() {
```

### src\hooks\useStoreSettings.ts
```typescript
export function useStoreSettings() {
export function useUpdateStoreSettings() {
```

### src\hooks\useSwipe.ts
```typescript
export function useSwipe(ref: RefObject<HTMLElement | null>, options: SwipeInput) {
```

### src\hooks\useTestimonials.ts
```typescript
export function useTestimonials(options?: {
export function useFeaturedTestimonials(limit = 6) {
export function useTestimonialsStats() {
```

### src\hooks\useTypewriter.ts
```typescript
export function useTypewriter(
```

### src\hooks\useUpdateProfile.ts
```typescript
export function useUpdateProfile() {
```

### src\hooks\useUploadAvatar.ts
```typescript
export function useUploadAvatar() {
```

### src\hooks\useUserNotifications.ts
```typescript
export function useUserNotifications(userId: string | undefined) {
```

### src\hooks\useVisualScanner.ts
```typescript
export interface VisualScannerAnalysis {
export interface VisualScannerResult {
export function useVisualScanner() {
```

### src\hooks\useWheelAudio.ts
```typescript
export function useWheelAudio() {
```

### src\hooks\useWheelConfig.ts
```typescript
export const WHEEL_CONFIG_KEY = ['wheel', 'config'] as const;
export function useWheelConfig(): {
```

### src\lib\accessibility.ts
```typescript
export const generateA11yId = (prefix: string): string => {
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
export const trapFocus = (element: HTMLElement) => {
```

### src\lib\ai-capsule-mappers.ts
```typescript
export function mapCapsuleToFrontendResponse(
```

### src\lib\ai-capsule-schemas.ts
```typescript
export const productSearchToolSchema = z.object({
export const knowledgeToolSchema = z.object({
export const cartOperatorToolSchema = z.object({
export const orderTrackingToolSchema = z.object({
export const warrantyTriageToolSchema = z.object({
export const loyaltyStatusToolSchema = z.object({
export const checkoutReadinessToolSchema = z.object({
export const inventoryOutlookToolSchema = z.object({
export const storefrontCompatibilityCheckToolSchema = z.object({
export const storefrontBudgetRescueToolSchema = z.object({
export const storefrontKittingToolSchema = z.object({
export const internalResolvedProductSchema = z.object({
export const publicAttachmentSchema = z.object({
export const storefrontAttachmentProductRefSchema = z.object({
export const storefrontAttachmentOfferSchema = z.object({
export const storefrontPromotionSignalSchema = z.discriminatedUnion('kind', [
export const storefrontReplenishmentSignalSchema = z.object({
export const storefrontOrderTrackingSignalSchema = z.object({
export const storefrontWarrantyTriageSignalSchema = z.object({
export const storefrontLoyaltyStatusSignalSchema = z.object({
export const storefrontCheckoutReadinessSignalSchema = z.object({
export const storefrontInventoryOutlookSignalSchema = z.object({
export const storefrontKittingSignalSchema = z.object({
export const storefrontBudgetRescueSignalSchema = z.object({
export const storefrontCompatibilityCheckSignalSchema = z.object({
export const frontendResponseSchema = z.object({
export const internalCapsuleContractSchema = z.object({
export const internalKnowledgeChunkSchema = z.object({
export const internalKnowledgeContractSchema = z.object({
export const internalCartOperatorContractSchema = z.object({
export const internalOrderTrackingContractSchema = z.object({
export const internalWarrantyTriageContractSchema = z.object({
export const internalLoyaltyStatusContractSchema = z.object({
export const internalCheckoutReadinessContractSchema = z.object({
export const internalInventoryOutlookContractSchema = z.object({
export const internalKittingBasketContractSchema = z.object({
export const internalBudgetRescueContractSchema = z.object({
export const internalCompatibilityCheckContractSchema = z.object({
export type InternalCapsuleContract = z.infer<typeof internalCapsuleContractSchema>;
export type InternalKnowledgeContract = z.infer<typeof internalKnowledgeContractSchema>;
export type InternalCartOperatorContract = z.infer<typeof internalCartOperatorContractSchema>;
export type InternalOrderTrackingContract = z.infer<typeof internalOrderTrackingContractSchema>;
export type InternalWarrantyTriageContract = z.infer<typeof internalWarrantyTriageContractSchema>;
export type InternalLoyaltyStatusContract = z.infer<typeof internalLoyaltyStatusContractSchema>;
export type InternalCheckoutReadinessContract = z.infer<typeof internalCheckoutReadinessContractSchema>;
export type InternalInventoryOutlookContract = z.infer<typeof internalInventoryOutlookContractSchema>;
export type InternalCompatibilityCheckContract = z.infer<typeof internalCompatibilityCheckContractSchema>;
export type InternalKittingBasketContract = z.infer<typeof internalKittingBasketContractSchema>;
export type InternalBudgetRescueContract = z.infer<typeof internalBudgetRescueContractSchema>;
export type InternalResolvedProduct = z.infer<typeof internalResolvedProductSchema>;
export type InternalKnowledgeChunk = z.infer<typeof internalKnowledgeChunkSchema>;
export type PublicAttachment = z.infer<typeof publicAttachmentSchema>;
export type FrontendResponseContract = z.infer<typeof frontendResponseSchema>;
```

### src\lib\ai-telemetry-contract.ts
```typescript
export type AITelemetryOwner = 'edge' | 'client';
export interface AITelemetryContract {
export function resolveAITelemetryContract(input: {
export function shouldClientLogAITelemetry(contract: AITelemetryContract): boolean {
```

### src\lib\analytics.ts
```typescript
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with actual ID
export const pageView = (url: string) => {
export const trackEvent = ({ action, params }: AnalyticsEvent) => {
export const trackViewItem = (product: Product) => {
export const trackAddToCart = (product: Product, quantity: number = 1) => {
export const trackAIInteraction = (action: string, params?: Record<string, unknown>) => {
```

### src\lib\cart-operator-capsule.ts
```typescript
export function evaluateCartOperatorCapsule(
export function buildBlockedMutationContract(
export function buildAmbiguousMutationContract(
export function buildDegradedCartContract(
```

### src\lib\cart-operator-executor.ts
```typescript
export interface CartExecutionResult {
export interface CartExecutionOptions {
```

### src\lib\cesarin-cart-assembly.ts
```typescript
export type CesarinCartAssemblyBlockedReason =
export interface CesarinCartAssemblyVariantToken {
export interface CesarinCartAssemblyEligibility {
export interface ResolveCesarinCartAssemblyEligibilityInput {
export function resolveCesarinCartAssemblyEligibility(
```

### src\lib\cesarin-commercial-judgment.ts
```typescript
export type CesarinCommercialMove =
export type CesarinCommercialSupportLevel = 'weak' | 'supported' | 'strong';
export interface CesarinCommercialJudgment {
export function isBroadExplorationQuery(query: string): boolean {
export function isStrictExplorationQuery(query: string): boolean {
export function isCompareQuery(query: string): boolean {
export function isReadyToCloseQuery(query: string): boolean {
export function isHesitationQuery(query: string): boolean {
export function historyShowsComparison(history?: ResolveCesarinCommercialJudgmentInput['history']): boolean {
export function resolveCesarinCommercialSupportLevel(input: {
export function resolveCesarinTurnCommercialJudgment(
```

### src\lib\cesarin-insights.ts
```typescript
export interface ReportInsights {
export function computeReportInsights(
```

### src\lib\cesarin-stage1.ts
```typescript
export type CesarinSuggestedProduct = Pick<Product, 'id' | 'name' | 'slug' | 'section'> |
export interface CesarinActiveRecoveryState {
export interface CesarinCartMutationVisibleResult {
export const APPROXIMATE_STRATEGY_NOTES: Partial<Record<SupportedMatchStrategy, string>> = {
export function isCesarinApproximateMatchStrategy(matchStrategy?: string | null): boolean {
export function shouldOfferCesarinApproximateRecovery(
export function buildCesarinHumanizedSearchMessage(input: {
export function getCesarinApproximateRecoveryHint(matchStrategy?: string | null): string | null {
export function buildCesarinRecoveryPrompt(
export function detectCesarinFrustrationSignal(message: string): boolean {
export function shouldEscalateCesarinRecovery(input: {
export function buildCesarinHonestEscalation(input: {
export function buildCesarinCartOperatorVisibleMessage(
```

### src\lib\cesarin-stage3.ts
```typescript
export interface CesarinPreferenceSummary {
export function rerankCesarinSuggestedProducts<T extends CesarinRankableProduct>(input: {
```

### src\lib\cesarin-stage4.ts
```typescript
export type CesarinCommercialConversationMode =
export interface CesarinAdaptiveConversationView<T extends CesarinVisibleProduct> {
export function buildCesarinAdaptiveConversationView<T extends CesarinVisibleProduct>(
```

### src\lib\cesarin-stage5.ts
```typescript
export type CesarinStorefrontNextStepFamily =
export interface CesarinStorefrontActionButtonView {
export interface CesarinStorefrontAssistActionView {
export interface CesarinStorefrontNextStepView {
export interface CesarinActionableConversationView<T extends CesarinActionProduct> {
export function buildCesarinActionableNextStepView<T extends CesarinActionProduct>(
```

### src\lib\cesarin-text-utils.ts
```typescript
export function normalizeCompactText(value: string): string {
export function isMeaningfullyDistinct(left: string, right: string): boolean {
export function splitIntoSentences(value: string): string[] {
export function compactCesarinCopy(value: string, maxSentences = 8): string {
export function mergeConversationalPrefix(
export function getEffectiveConversationalPrefix(input: {
```

### src\lib\contracts\admin-coupons-contract.ts
```typescript
export const AdminCouponRequestSchema = z.object({
export type AdminCouponRequest = z.infer<typeof AdminCouponRequestSchema>;
```

### src\lib\contracts\admin-flash-deals-contract.ts
```typescript
export const FlashDealRequestSchema = z.object({
export type FlashDealRequest = z.infer<typeof FlashDealRequestSchema>;
```

### src\lib\contracts\admin-orders-contract.ts
```typescript
export const CancelAdminUnpaidOrderRequestSchema = z.object({
export type CancelAdminUnpaidOrderRequest = z.infer<typeof CancelAdminUnpaidOrderRequestSchema>;
```

### src\lib\contracts\admin-products-contract.ts
```typescript
export const GenerateProductCopyRequestSchema = z.object({
export const EnrichProductRequestSchema = z.object({
export const EmbeddingsProcessorRequestSchema = z.object({
export type GenerateProductCopyRequest = z.infer<typeof GenerateProductCopyRequestSchema>;
export type EnrichProductRequest = z.infer<typeof EnrichProductRequestSchema>;
export type EmbeddingsProcessorRequest = z.infer<typeof EmbeddingsProcessorRequestSchema>;
export const AdminProductRequestSchema = z.object({
export type AdminProductRequest = z.infer<typeof AdminProductRequestSchema>;
```

### src\lib\contracts\admin-variants-contract.ts
```typescript
export const VariantInputSchema = z.object({
export const SyncVariantsRequestSchema = z.array(VariantInputSchema);
export type VariantInputRequest = z.infer<typeof VariantInputSchema>;
```

### src\lib\contracts\admin-wheel-contract.ts
```typescript
export const WheelPrizeRequestSchema = z.object({
export type WheelPrizeRequest = z.infer<typeof WheelPrizeRequestSchema>;
```

### src\lib\contracts\ai-edge-contract.ts
```typescript
export const ChatHistoryRoleSchema = z.enum(['user', 'model']);
export const ChatHistoryPartSchema = z.object({
export const ChatHistoryItemSchema = z.object({
export const CustomerIntelligenceRequestSchema = z.object({
export type CustomerIntelligenceRequest = z.infer<typeof CustomerIntelligenceRequestSchema>;
export const CustomerIntelligenceResponseSchema = z.object({
export type CustomerIntelligenceResponse = z.infer<typeof CustomerIntelligenceResponseSchema>;
```

### src\lib\contracts\loyalty-contract.ts
```typescript
export const LoyaltyTransactionTypeSchema = z.enum(['earned', 'spent', 'expired', 'adjustment']);
export const ProcessLoyaltyPointsRequestSchema = z.object({
export type ProcessLoyaltyPointsRequest = z.infer<typeof ProcessLoyaltyPointsRequestSchema>;
```

### src\lib\contracts\payments-contract.ts
```typescript
export const CreatePaymentRequestSchema = z.object({
export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;
```

### src\lib\contracts\store-settings-contract.ts
```typescript
export const StoreSettingsUpdateSchema = z.object({
export type StoreSettingsUpdate = z.infer<typeof StoreSettingsUpdateSchema>;
```

### src\lib\contracts\storefront-orders-contract.ts
```typescript
export const CreateOrderRequestSchema = z.object({
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
```

### src\lib\conversion-measurement.ts
```typescript
export type ConversionEventType =
export type ConversionSource = 'cesarin' | 'manual';
export type ConversionEventMetadata = Record<string, unknown>;
export function getOrCreateCesarinSessionId(): string {
export function getCesarinSessionId(): string | null {
export function emitConversationConversionEvent(input: {
```

### src\lib\customer-intelligence-no-write-smoke.ts
```typescript
export const CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT = 'customer_intelligence_no_write_v1' as const;
export const CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS = Object.freeze({
export interface CustomerIntelligenceNoWriteSmokeMetadata {
export function buildCustomerIntelligenceNoWriteSmokeRequestFields(): {
export function isCustomerIntelligenceNoWriteSmokeActive(value: unknown): value is CustomerIntelligenceNoWriteSmokeMetadata {
```

### src\lib\domain\adminAttributes.ts
```typescript
export type AttributeApplicability = ProductAttribute['applicability'];
export interface AttributeUpdatePayload {
export function normalizeAttributeTextInput(value: string): string | null {
export function buildAttributeUpdatePayload(
export function toggleAttributeSection(
export function toggleAttributeCategory(
export function clearAttributeCategories(applicability: AttributeApplicability | undefined): AttributeApplicability {
```

### src\lib\domain\adminBatchManager.ts
```typescript
export interface ProductBatchRow extends Partial<ProductFormData> {
export function buildBatchProductRows(products: Array<Partial<ProductFormData> & { id: string }>): ProductBatchRow[] {
export function applyBatchProductFieldChange(
export function countModifiedBatchRows(rows: ProductBatchRow[]): number {
export function buildBatchProductUpdatePayload(rows: ProductBatchRow[]): { id: string; updates: Partial<ProductFormData> }[] {
export function resetBatchProductRows(products: Array<Partial<ProductFormData> & { id: string }>): ProductBatchRow[] {
```

### src\lib\domain\adminBrands.ts
```typescript
export type BrandFormData = Omit<Brand, 'id' | 'created_at' | 'updated_at'>;
export const DEFAULT_BRAND_FORM: BrandFormData = {
export function buildEmptyBrandForm(): BrandFormData {
export function buildBrandCreateForm(brands: Brand[]): BrandFormData {
export function buildBrandEditForm(brand: Brand): BrandFormData {
export function buildBrandDuplicateForm(brand: Brand): BrandFormData {
export function normalizeBrandSortOrderInput(value: string): number {
export function buildBrandSubmitPayload(form: BrandFormData): BrandFormData {
```

### src\lib\domain\adminProductForm.ts
```typescript
export function buildDefaultProductForm(config?: VerticalPackConfig): ProductFormData {
export function buildProductFormFromProduct(product: Product): ProductFormData {
export function applyProductFormChange<K extends keyof ProductFormData>(
export function appendProductTag(tags: string[], rawTag: string): string[] {
export function removeProductTag(tags: string[], tagToRemove: string): string[] {
export function buildProductCategoriesForSection(categories: Category[], section: Section): Category[] {
export function hasRequiredProductFields(form: Pick<ProductFormData, 'name' | 'category_id' | 'price'>): boolean {
export function buildProductSubmitPayload(form: ProductFormData): ProductFormData {
```

### src\lib\domain\cart.ts
```typescript
export type StorefrontCheckoutTransitionStatus = 'ready' | 'review' | 'blocked';
export type StorefrontCartDependencyRelationType = 'uses_coil' | 'uses_pod' | 'uses_battery' | 'uses_liquid';
export type StorefrontCompatibilityScope = 'specific_model' | 'class_generalization';
export interface StorefrontCartDependencyOffer {
export interface StorefrontCheckoutDependencyGuidanceView {
export interface StorefrontCheckoutTransitionView {
export function isBlockingCartValidationIssue(issue: CartValidationIssue): boolean {
export function getStorefrontCheckoutTransitionView(
```

### src\lib\domain\homeFeaturedCategories.ts
```typescript
export const HOME_FEATURED_CATEGORY_SLOTS = 4;
export function buildHomeFeaturedCategories(
export function updateHomeFeaturedCategorySlot(
export function applyHomeFeaturedCategorySelection(
export function findMatchingHomeFeaturedCategoryId(
```

### src\lib\domain\homeHeroSliders.ts
```typescript
export type HomeHeroSliderMoveDirection = 'up' | 'down';
export function sortHomeHeroSlidersByOrder(sliders: HeroSlider[]): HeroSlider[] {
export function buildNewHomeHeroSliderDraft(sliderCount: number): HeroSlider {
export function deleteHomeHeroSliderById(sliders: HeroSlider[], id: string): HeroSlider[] {
export function toggleHomeHeroSliderStatus(sliders: HeroSlider[], id: string): HeroSlider[] {
export function reorderHomeHeroSlider(
export function upsertHomeHeroSlider(
```

### src\lib\domain\loyalty.ts
```typescript
export const POINTS_PER_UNIT = 10;
export const CURRENCY_PER_POINT_UNIT = 100;
export const REWARD_POINTS_REFERRER = 50;
export const REWARD_POINTS_REFERRED = 25;
export type TierId = 'bronze' | 'silver' | 'gold' | 'platinum';
export interface TierDefinition {
export const LOYALTY_TIERS: Record<TierId, TierDefinition> = {
export const TIER_ORDER: TierId[] = ['bronze', 'silver', 'gold', 'platinum'];
export function calculateLoyaltyPoints(total: number, pointsPerCurrency: number = 0.1): number {
export function calculateLoyaltyPointsWithMultiplier(
export function isPointsExpired(createdAt: string | Date, expiryDays: number): boolean {
export function pointsToPesos(points: number, currencyPerPoint: number = 0.1): number {
export function getLoyaltyTier(totalSpent: number): TierId {
export interface TierProgress {
export function getNextTierProgress(totalSpent: number): TierProgress {
```

### src\lib\domain\loyaltySettings.ts
```typescript
export const DEFAULT_LOYALTY_SETTINGS: LoyaltyConfig = {
export const INITIAL_LOYALTY_TIERS: LoyaltyTier[] = [
export interface AdminLoyaltyState {
export function buildAdminLoyaltyState(
export function buildAdminLoyaltyConfig(
export function buildAdminLoyaltyTiers(
export function applyLoyaltyRuleChange(
export function toggleLoyaltyEnabled(config: LoyaltyConfig, nextValue: boolean): LoyaltyConfig {
export function buildLoyaltyConfigUpdatePayload(config: LoyaltyConfig, settingsId: number) {
export function buildLoyaltyTiersUpdatePayload(loyaltyTiers: LoyaltyTier[], settingsId: number) {
```

### src\lib\domain\orders\orderStatus.ts
```typescript
export const STOREFRONT_ORDER_STATUS = {
export type StorefrontOrderStatus = keyof typeof STOREFRONT_ORDER_STATUS;
export const ADMIN_ORDER_STATUS = {
export type AdminOrderStatus = keyof typeof ADMIN_ORDER_STATUS;
export const ADMIN_ORDER_STATUSES_LIST: { value: AdminOrderStatus; label: string; color: string }[] = [
export const ORDER_STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
export function canTransitionTo(
export function isTerminalStatus(status: AdminOrderStatus): boolean {
```

### src\lib\domain\orders\orderViews.ts
```typescript
export interface StorefrontOrderPaymentView {
export interface StorefrontPaymentContinuationView {
export interface StorefrontOrderVisibilityView {
export interface StorefrontOrderLifecycleView {
export interface StorefrontOrdersIndexActionView {
export interface StorefrontOpenOrderRecoveryView {
export type StorefrontPaymentReentryState = 'available' | 'unavailable' | 'resolved';
export interface StorefrontPaymentReentryView {
export interface StorefrontPostPurchaseConfidenceView {
export function getStorefrontOrderPaymentView(
export function getStorefrontPaymentContinuationView(
export function getStorefrontOrderVisibilityView(
export function getStorefrontOrderLifecycleView(
export function getStorefrontOrdersIndexActionView(
export function getStorefrontPaymentReentryView(
export function getStorefrontOpenOrderRecoveryView(
export function getStorefrontPostPurchaseConfidenceView(
export function getStorefrontOrderFreshnessView(
export interface StorefrontOrderFreshnessView {
```

### src\lib\domain\orders\paymentStatus.ts
```typescript
export type StorefrontPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type StorefrontPaymentTone = 'warning' | 'success' | 'danger' | 'neutral';
export interface StorefrontOrderPaymentInput {
export function normalizePaymentStatus(status: string | null | undefined): StorefrontPaymentStatus {
export function isStorefrontPaymentContinuationAvailable(
export function isStorefrontOpenRecoverableOrder(
```

### src\lib\domain\orders\reorderPlan.ts
```typescript
export type StorefrontReorderBlockedReason =
export interface StorefrontReorderReadyItem {
export interface StorefrontReorderBlockedItem {
export interface StorefrontOrderReorderPlan {
export interface StorefrontOrderReorderFeedback {
export function buildStorefrontOrderReorderPlan(
export function getStorefrontOrderReorderFeedback(
```

### src\lib\domain\pricing.ts
```typescript
export type DiscountType = 'percentage' | 'fixed';
export interface CouponData {
export function calculateDiscount(subtotal: number, coupon: CouponData | null): number {
export function calculateOrderTotal(
export function calculateSavingsPercentage(
```

### src\lib\domain\product-search\searchContext.ts
```typescript
export interface ProductSearchContext {
```

### src\lib\domain\product-search\searchDecisions.ts
```typescript
export type DecisionCue = {
export type DecisionGuideResult = {
export type ActionStrength = 'review_only' | 'review_then_cart';
export type ObjectionType = 'cheaper' | 'hesitation' | 'worth_it' | 'alternative';
export type RecoveryCommitmentResult = {
export type CheckoutReadinessResult = {
export type CartPrecisionResult = {
export type VariantReadinessResult = {
export function normalizeDecisionText(value: string): string {
export function buildSingleOptionConfidenceLine(mode: 'exact' | 'narrowed'): string {
export function buildRecoveryHandoffLine(preferredProduct: InternalResolvedProduct, compareAgainst: InternalResolvedProduct | null, actionStrength: ActionStrength): string {
export const CHECKOUT_READINESS_SPEC_CANDIDATES: Array<{
export const CART_PRECISION_SPEC_CANDIDATES: Array<{
export function parseDisplayPrice(product: InternalResolvedProduct): number | null {
export function detectObjectionType(query: string): ObjectionType | null {
export function buildObjectionRecovery(query: string, products: InternalResolvedProduct[], hasSupportedComparison: boolean, supportReason: string | null): { line: string; actionStrength: ActionStrength } | null {
export function buildRecoveryCommitment(query: string, products: InternalResolvedProduct[], hasSupportedComparison: boolean, defaultActionStrength: ActionStrength): RecoveryCommitmentResult | null {
export function buildCheckoutReadiness(product: InternalResolvedProduct, actionStrength: ActionStrength, compareAgainst: InternalResolvedProduct | null, hasSupportBackedRecovery = false): CheckoutReadinessResult | null {
export function buildVariantReadiness(product: InternalResolvedProduct): VariantReadinessResult | null {
export function buildCartPrecision(product: InternalResolvedProduct, checkoutReadiness: CheckoutReadinessResult | null, actionStrength: ActionStrength, compareAgainst: InternalResolvedProduct | null): CartPrecisionResult | null {
export const DECISION_SPEC_CANDIDATES: Array<{
export function getDifferentiatingSpecKeys(products: InternalResolvedProduct[]): Set<string> {
export function buildProductDecisionCues(product: InternalResolvedProduct, differentiatingKeys: Set<string>): DecisionCue[] {
export function pickDecisionCue(cues: DecisionCue[], usedKeys: Set<string>): DecisionCue | null {
export function buildDecisionGuide(products: InternalResolvedProduct[]): DecisionGuideResult | null {
export function buildAmbiguityQuestion(query: string): string {
```

### src\lib\domain\product-search\searchEvaluator.ts
```typescript
export type CapsuleTruthSignals = NonNullable<InternalCapsuleContract['truth_signals']>;
export type CapsuleHelpContract = NonNullable<InternalCapsuleContract['help_contract']>;
export type CapsulePromotionSignal = NonNullable<InternalCapsuleContract['promotion_signal']>;
export type CapsuleReplenishmentSignal = NonNullable<InternalCapsuleContract['replenishment_signal']>;
export function buildTruthSignals(input: {
export function buildHelpContract(input: {
export function evaluateProductSearchFallbackTree(context: ProductSearchContext): InternalCapsuleContract {
export function buildContract(status: InternalCapsuleContract['execution_status'], strategy: InternalCapsuleContract['match_strategy'], draft: string, confidence: number, products: InternalResolvedProduct[], degradedReason?: InternalCapsuleContract['degraded_reason'], reasoning?: string, exhaustedExact?: InternalResolvedProduct[], retrievalSource: InternalCapsuleContract['retrieval_source'] = 'NONE', truthSignals?: CapsuleTruthSignals, helpContract?: CapsuleHelpContract, promotionSignal?: CapsulePromotionSignal, replenishmentSignal?: CapsuleReplenishmentSignal): InternalCapsuleContract {
```

### src\lib\domain\product-search\searchFacts.ts
```typescript
export const SPEC_KEY_ALIASES: Record<string, string[]> = {
export type ConcreteFactRequest = | { family: 'Puffs' }
export type ConcreteFactResolution = {
export function extractSpecsFact(product: InternalResolvedProduct): string | null {
export function extractDescriptionContext(product: InternalResolvedProduct): string | null {
export function extractSpecValue(product: InternalResolvedProduct, key: string): string | null {
export function detectConcreteFactRequest(query: string): ConcreteFactRequest | null {
export function resolveConcreteFactAnswer(query: string, product: InternalResolvedProduct): ConcreteFactResolution | null {
```

### src\lib\domain\product-search\searchIntents.ts
```typescript
export const FLAVOR_HINTS = ['menta', 'mango', 'uva', 'frutal', 'fruta', 'dulce', 'ice', 'hielo', 'sandia', 'fresa', 'melon', 'mora', 'cereza', 'tabaco', 'caramelo'];
export const DEVICE_HINTS = ['desechable', 'pod', 'pods', 'cartucho', 'cartuchos', 'kit', 'mod', 'vape', 'pipa', 'bateria', 'baterias', 'extracto', 'extractos', 'wax', 'pluma', '510'];
export const BUDGET_HINTS = ['barato', 'economico', 'economico', 'precio', 'presupuesto', 'menos', 'maximo', 'maximo', '$'];
export const EFFECT_HINTS = ['suave', 'fuerte', 'relajar', 'relaje', 'rico', 'dia', 'dia', 'noche', 'pegar', 'tranqui', 'intenso'];
export const BEGINNER_HINTS = ['empezar', 'empiezo', 'inicio', 'primera', 'nuevo', 'nueva', 'principiante', 'novato'];
export const CONVENIENCE_HINTS = ['facil', 'simple', 'sencillo', 'sencilla', 'practico', 'practica', 'comodidad', 'rapido'];
export const EXPLORATION_HINTS = ['algo', 'recomiendame', 'quiero', 'quiero probar', 'que me conviene', 'busco', 'buscame'];
export const HESITATION_HINTS = ['no se', 'no me convence', 'no me convence tanto', 'mmm', 'mm', 'duda', 'dudas'];
export const WORTH_HINTS = ['vale la pena', 'realmente vale', 'si conviene', 'conviene'];
export const ALTERNATIVE_HINTS = ['otra opcion', 'otra alternativa', 'alternativa', 'otra cercana', 'otra parecida'];
export const PROMOTION_HINTS = ['promo', 'promocion', 'promociones', 'descuento', 'descuentos', 'oferta', 'ofertas', 'cupon', 'coupon', 'codigo', 'sale'];
export const READY_CLOSE_HINTS = ['me lo llevo', 'me llevo', 'me conviene', 'cierro', 'cerramos', 'listo', 'comprar', 'lo compro'];
export const REPLENISHMENT_HINTS = ['lo de siempre', 'lo mismo', 'mis pods', 'quiero repetir', 'repetir', 'volver a pedir'];
export function normalizeSearchText(value: string): string {
export function hasAnyHint(value: string, hints: string[]): boolean {
export function hasModelCue(value: string): boolean {
export function joinSentences(...parts: Array<string | null | undefined>): string {
export function buildHandoffLine(mode: 'single' | 'options', products: InternalResolvedProduct[] = [], hasSupportedComparison = false, actionStrength: ActionStrength = 'review_only'): string {
```

### src\lib\domain\product-search\searchPromotions.ts
```typescript
export function isPromotionQuestion(query: string): boolean {
export function isIncentiveYieldContext(query: string): boolean {
export function formatCurrency(value: number): string {
export function buildPromotionYieldLine(input: {
export function buildPromotionOnlyResponse(signal?: CapsulePromotionSignal | null): string | null {
```

### src\lib\domain\product-search\searchRecovery.ts
```typescript
export type OutOfStockPivotReason = 'STOCK_ZERO' | 'VARIANT_UNAVAILABLE';
export function normalizeRecoveryText(value: string): string {
export function extractRecoveryTokens(value: string): string[] {
export function flattenSpecText(specs: unknown): string {
export function buildProductRecoveryText(product: InternalResolvedProduct): string {
export function scoreOutOfStockAlternative(query: string, requestedProduct: InternalResolvedProduct, candidate: InternalResolvedProduct): number {
export function rankOutOfStockAlternatives(query: string, requestedProduct: InternalResolvedProduct, candidates: InternalResolvedProduct[]): InternalResolvedProduct[] {
export function buildOutOfStockPivotDraft(input: {
export function buildOutOfStockAlternativeContract(input: {
export function findCheaperAlternative(products: InternalResolvedProduct[], anchor: InternalResolvedProduct): InternalResolvedProduct | null {
export function buildExplicitSupportReason(product: InternalResolvedProduct): string | null {
export function buildRecoveryQuestion(query: string): string {
export function buildSemanticRefinementLine(query: string, source: ProductSearchContext['semantic_match_source']): string {
```

### src\lib\domain\product-search\searchReplenishment.ts
```typescript
export function isReplenishmentIntent(query: string): boolean {
export function buildReplenishmentTarget(signal: CapsuleReplenishmentSignal): string {
export function buildReplenishmentDraft(signal: CapsuleReplenishmentSignal): string {
export function buildReplenishmentHandoff(signal: CapsuleReplenishmentSignal): string | null {
export function buildUnavailableReplenishmentDraft(signal: CapsuleReplenishmentSignal): string {
export function buildMissingReplenishmentDraft(query: string): string {
```

### src\lib\domain\products.ts
```typescript
export type StorefrontPurchaseabilityReason =
export interface StorefrontProductPurchaseabilityView {
export function getVariantDisplayName(variant: ProductVariant | null): string {
export function getProductVariantById(product: Product, variantId?: string | null): ProductVariant | null {
export function getStorefrontProductPurchaseability(
```

### src\lib\domain\storeSettingsForm.ts
```typescript
export const DEFAULT_LOYALTY_SETTINGS: LoyaltyConfig = {
export const DEFAULT_STORE_SETTINGS_FORM: SettingsFormData = {
export function buildStoreSettingsFormData(
export function buildStoreSettingsUpdatePayload(
export function applyStoreSettingsFormChange(
```

### src\lib\domain\validations\address.schema.ts
```typescript
export const addressSchema = z.object({
export type AddressFormData = z.infer<typeof addressSchema>;
```

### src\lib\domain\validations\checkout.schema.ts
```typescript
export const checkoutSchema = z.object({
```

### src\lib\domain\validations\contact.schema.ts
```typescript
export const contactSchema = z.object({
export type ContactFormData = z.infer<typeof contactSchema>;
```

### src\lib\domain\validations\profile.schema.ts
```typescript
export const profileSchema = z.object({
export type ProfileFormData = z.infer<typeof profileSchema>;
```

### src\lib\domain\wheel.ts
```typescript
export function selectPrizeByProbability(
export function calculateTargetRotation(
export function formatPrizeValue(prize: WheelPrize): string {
```

### src\lib\knowledge-rag-capsule.ts
```typescript
export const KNOWLEDGE_RAG_CAPSULE_VERSION = '1.0.0';
export function buildDegradedKnowledgeContract(
export function buildEmptyKnowledgeContract(
export function evaluateKnowledgeRAGTree(
```

### src\lib\pilot-activation.ts
```typescript
export const PILOT_ACTIVATION_EVENT = 'vsm:pilot-activation-changed';
export type StorefrontAIExposureSource = 'Disabled' | 'PilotOverride' | 'GlobalFlag' | 'GlobalFlagWithPilot';
export function resolveStorefrontAIExposure(input: {
export function activatePilot(): void {
export function deactivatePilot(): void {
export function isPilotActive(): boolean {
export function bootstrapPilotFromSearch(search: string): boolean {
export function getPilotActivationState(): {
```

### src\lib\product-filtering.ts
```typescript
export interface FilterState {
export function getAvailableFilters(products: Product[]) {
export function applyFilters(products: Product[], filters: FilterState): Product[] {
```

### src\lib\product-sorting.ts
```typescript
export type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'name_az' | 'newest';
export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
export function sortProducts(products: Product[], sort: SortKey): Product[] {
```

### src\lib\react-query.ts
```typescript
export function getErrorMessage(error: unknown): string {
export const queryClient = new QueryClient({
```

### src\lib\runtime-build.ts
```typescript
export const runtimeBuildInfo = {
export type RuntimeShellFreshness =
export interface RuntimeReleaseManifest {
export interface ServiceWorkerDiagnostics {
export function parseServiceWorkerVersion(scriptUrl: string | null | undefined): string | null {
export function resolveShellFreshness(input: {
export function detectStandaloneMode(): boolean {
```

### src\lib\supabase.ts
```typescript
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
export const supabase = isSupabaseConfigured
```

### src\lib\test-router.tsx
```typescript
export interface TestRouterContextValue {
export const TestRouterContext = createContext<TestRouterContextValue>({
export function parseRoute(pattern: string, url: string): Record<string, string> {
export function parseSearch(url: string): Record<string, string> {
export function TestRouter({
export function useTestRouter() {
```

### src\lib\upsell-logic.ts
```typescript
export const CATEGORY_COMPATIBILITY: Record<string, string[]> = {
export function getCompatibleCategorySlugs(currentCategorySlug: string): string[] {
export function areCategoriesComplementary(catA: string, catB: string): boolean {
```

### src\lib\utils.ts
```typescript
export function cn(...inputs: ClassValue[]): string {
export function formatPrice(price: number): string {
export function slugify(text: string): string {
export function formatTimeAgo(dateInput: string | Date): string {
export function optimizeImage(
```

### src\lib\z-index.ts
```typescript
export const Z = {
export type ZLayer = keyof typeof Z;
```

### src\pages\Addresses.tsx
```typescript
export function Addresses() {
```

### src\pages\admin\AdminAttributes.tsx
```typescript
export function AdminAttributes() {
```

### src\pages\admin\AdminBatchManager.tsx
```typescript
export function AdminBatchManager() {
```

### src\pages\admin\AdminBrands.tsx
```typescript
export function AdminBrands() {
```

### src\pages\admin\AdminCategories.tsx
```typescript
export function AdminCategories() {
```

### src\pages\admin\AdminCesarinOS.tsx
```typescript
export function AdminCesarinOS() {
```

### src\pages\admin\AdminCoupons.tsx
```typescript
export function AdminCoupons() {
```

### src\pages\admin\AdminCustomerDetails.tsx
```typescript
export function AdminCustomerDetails() {
```

### src\pages\admin\AdminCustomers.tsx
```typescript
export function AdminCustomers() {
```

### src\pages\admin\AdminDashboard.tsx
```typescript
export function AdminDashboard() {
```

### src\pages\admin\AdminFlashDeals.tsx
```typescript
export function AdminFlashDeals() {
```

### src\pages\admin\AdminHomeEditor.tsx
```typescript
export function AdminHomeEditor() {
```

### src\pages\admin\AdminHomeSliders.tsx
```typescript
export function AdminHomeSliders() {
```

### src\pages\admin\AdminLoyalty.tsx
```typescript
export function AdminLoyalty() {
```

### src\pages\admin\AdminMonitoring.tsx
```typescript
export function AdminMonitoring() {
```

### src\pages\admin\AdminOrders.tsx
```typescript
export function AdminOrders() {
```

### src\pages\admin\AdminProductForm.tsx
```typescript
export function AdminProductForm() {
```

### src\pages\admin\AdminProducts.tsx
```typescript
export function AdminProducts() {
```

### src\pages\admin\AdminSettings.tsx
```typescript
export function AdminSettings() {
```

### src\pages\admin\AdminTags.tsx
```typescript
export function AdminTags() {
```

### src\pages\admin\AdminTestimonials.tsx
```typescript
export function AdminTestimonials() {
```

### src\pages\admin\AdminWheelGame.tsx
```typescript
export function AdminWheelGame() {
```

### src\pages\auth\Login.tsx
```typescript
export function Login() {
```

### src\pages\auth\SignUp.tsx
```typescript
export function SignUp() {
```

### src\pages\BestsellersPage.tsx
```typescript
export function BestsellersPage() {
```

### src\pages\CategoryPage.tsx
```typescript
export function CategoryPage() {
```

### src\pages\Checkout.tsx
```typescript
export function Checkout() {
```

### src\pages\Contact.tsx
```typescript
export function Contact() {
```

### src\pages\Home.tsx
```typescript
export function Home() {
```

### src\pages\legal\Privacy.tsx
```typescript
export function Privacy() {
```

### src\pages\legal\Terms.tsx
```typescript
export function Terms() {
```

### src\pages\Loyalty.tsx
```typescript
export function Loyalty() {
```

### src\pages\NewArrivals.tsx
```typescript
export function NewArrivals() {
```

### src\pages\NotFound.tsx
```typescript
export function NotFound() {
```

### src\pages\OffersPage.tsx
```typescript
export function OffersPage() {
```

### src\pages\OrderDetail.tsx
```typescript
export function OrderDetail() {
```

### src\pages\Orders.tsx
```typescript
export function Orders() {
```

### src\pages\PaymentFailure.tsx
```typescript
export function PaymentFailure() {
```

### src\pages\PaymentPending.tsx
```typescript
export function PaymentPending() {
```

### src\pages\PaymentSuccess.tsx
```typescript
export function PaymentSuccess() {
```

### src\pages\ProductDetail.tsx
```typescript
export function ProductDetail() {
```

### src\pages\ProductGridStatesFixture.tsx
```typescript
export function ProductGridStatesFixture() {
```

### src\pages\ProductSurfaceFixture.tsx
```typescript
export function ProductSurfaceFixture() {
```

### src\pages\Profile.tsx
```typescript
export function Profile() {
```

### src\pages\SearchResults.tsx
```typescript
export function SearchResults() {
```

### src\pages\SecondVerticalProofFixture.tsx
```typescript
export function SecondVerticalProofFixture() {
```

### src\pages\SectionPage.tsx
```typescript
export function SectionPage() {
```

### src\pages\SectionSlugResolver.tsx
```typescript
export function SectionSlugResolver() {
```

### src\pages\Stats.tsx
```typescript
export function Stats() {
```

### src\pages\TrackOrder.tsx
```typescript
export function TrackOrder() {
```

### src\pages\user\Notifications.tsx
```typescript
export function Notifications() {
```

### src\pages\Wishlist.tsx
```typescript
export function Wishlist() {
```

### src\router.tsx
```typescript
export const rootRoute = createRootRoute({
export const appRoute = createRoute({
export const adminAppRoute = createRoute({
export const router = createRouter({ routeTree });
```

### src\services\addresses.service.ts
```typescript
export interface AddressData {
export interface Address extends AddressData {
export function formatAddress(addr: Address): string {
```

### src\services\admin\admin-brands.service.ts
```typescript
export interface Brand {
```

### src\services\admin\admin-case-drafts.service.ts
```typescript
export type CreateCaseDraftInput = Omit<PrivateCaseDraft, 'id' | 'created_at' | 'updated_at'>;
export function deriveCaseDraftReadiness(
```

### src\services\admin\admin-categories.service.ts
```typescript
export interface CategoryFormData {
```

### src\services\admin\admin-conversion-readout.service.ts
```typescript
export type ConversionFunnelEventType =
export type ConversionPathSource = 'cesarin' | 'manual' | 'unknown';
export interface ConversionEventRow {
export interface ConversionOrderRow {
export interface ConversionProductRow {
export interface ConversionFunnelStage {
export interface ConversionProductSummary {
export interface ConversionSessionReadout {
export interface ConversionFunnelReadout {
export function buildConversionFunnelReadout(input: BuildReadoutInput): ConversionFunnelReadout {
```

### src\services\admin\admin-coupons.service.ts
```typescript
export interface AdminCoupon {
export interface CouponFormData {
export interface GenerateDedicatedCouponParams {
```

### src\services\admin\admin-crm.service.ts
```typescript
export interface CustomerIntelligence {
export interface TimelineEvent {
export interface CustomerInsight {
export interface StrategicAIResponse {
export interface AdminCustomerMemory {
export function getCustomerInsights(intel: CustomerIntelligence): CustomerInsight[] {
```

### src\services\admin\admin-customers.service.ts
```typescript
export interface AdminCustomer {
export interface AdminCustomerDetail extends AdminCustomer {
export interface CreateCustomerData {
export interface WishlistItem {
```

### src\services\admin\admin-dashboard.service.ts
```typescript
export interface PulseMetrics {
export interface DailySales {
export interface TopProduct {
export interface DashboardStats {
```

### src\services\admin\admin-decision-trace.service.ts
```typescript
export type AdminDecisionTraceEvidenceKind =
export interface AdminDecisionTraceView {
export function buildAdminDecisionTraceView({
export function buildAdminDecisionTraceViewFromSimulationResult(result: SimulationResult): AdminDecisionTraceView {
```

### src\services\admin\admin-eval.service.ts
```typescript
export interface EvaluationData {
```

### src\services\admin\admin-flash-deals.service.ts
```typescript
export interface FlashDeal {
export interface FlashDealFormData {
```

### src\services\admin\admin-improvement-workflow.service.ts
```typescript
export type AdminWorkflowEvidenceKind =
export type AdminWorkflowSourceKind =
export type AdminWorkflowLifecycleStatus =
export type AdminWorkflowStepKey =
export type AdminWorkflowStepState =
export interface AdminWorkflowStepView {
export interface AdminImprovementWorkflowView {
export function buildAdminImprovementWorkflowViewForInteraction(
export function buildAdminImprovementWorkflowViewFromSimulationResult(
export function buildAdminImprovementWorkflowViewFromRecommendation(
export function buildAdminImprovementWorkflowViewFromImprovementItem(
export function buildLatestDraftMap<T extends string>(
```

### src\services\admin\admin-improvement.service.ts
```typescript
export type ImprovementLane   = 'rule' | 'knowledge' | 'compatibility' | 'commerce' | 'other';
export type ImprovementStatus = 'open' | 'in_progress' | 'resolved' | 'wont_fix';
export type ImprovementSourceKind = 'review_interaction' | 'intervention_recommendation';
export interface ImprovementItem {
export interface CreateImprovementItemInput {
export function laneFromPrimaryTag(tag: string): ImprovementLane {
```

### src\services\admin\admin-marketing.service.ts
```typescript
export interface FlashDealSuggestion {
```

### src\services\admin\admin-nlp.service.ts
```typescript
export interface NLPIntent {
export const adminNLPService = {
```

### src\services\admin\admin-operator-actions.service.ts
```typescript
export interface OperatorActionRow {
export interface InsertOperatorActionInput {
```

### src\services\admin\admin-orders.service.ts
```typescript
export type OrderStatus = AdminOrderStatus;
export const ORDER_STATUSES = ADMIN_ORDER_STATUSES_LIST;
export interface OrderItem {
export interface AdminOrder {
export function exportOrdersToCSV(orders: AdminOrder[]) {
```

### src\services\admin\admin-pilot-ops.service.ts
```typescript
export interface PilotKPIs {
export interface OfferedProduct {
export interface PilotQueryRow {
export type PilotBucket =
export function filterByBucket(rows: PilotQueryRow[], bucket: PilotBucket): PilotQueryRow[] {
```

### src\services\admin\admin-premium-simulation-lab.service.ts
```typescript
export interface CreatePremiumLabSessionInput {
export interface BuildPremiumLabTurnArtifactInput {
export interface CreatePremiumLabTurnInput extends BuildPremiumLabTurnArtifactInput {
export interface SavePremiumLabTurnReviewInput {
export interface CreatePremiumLabCommentInput {
export interface CreatePremiumLabCaseDraftLinkInput {
export interface CreatePremiumLabImprovementLinkInput {
export interface PremiumLabSessionBundle {
export function buildPremiumLabArtifactSnapshot(
```

### src\services\admin\admin-products.service.ts
```typescript
export interface ProductFormData {
export interface EnrichmentPackage {
```

### src\services\admin\admin-repo-graph.service.ts
```typescript
export interface RepoGraphChunk {
export interface RepoGraphNode {
export interface RepoGraphLink {
export interface RepoGraphResolvedLink {
export interface RepoGraphChunkPreview {
export interface RepoGraphInspector {
export interface RepoGraphOverview {
export const DEFAULT_REPO_GRAPH_NODE_ID = 'src/pages/admin/AdminCesarinOS.tsx';
export function getRepoGraphOverview(): RepoGraphOverview {
export function getRepoGraphNodeById(nodeId: string | null | undefined): RepoGraphNode | null {
export function listRepoGraphNodes(options?: {
export function getRepoGraphInspector(nodeId: string): RepoGraphInspector | null {
```

### src\services\admin\admin-signal-states.service.ts
```typescript
export type SignalStatusDB =
export interface SignalStateRow {
```

### src\services\admin\admin-simulation-lab.service.ts
```typescript
export const ADMIN_SIMULATION_CONTEXT_MESSAGE_LIMIT = 12;
export interface BuildSimulationSessionTurnRecordInput {
export interface AdminSimulationConversationTurnView {
export interface AdminSimulationLabView {
export function createSimulationSessionTurnRecord({
export function extractSimulationSessionTurnRecords(
export function buildAdminSimulationLabView({
export function buildSimulationSessionPreviewLabel(session: SimulationSession): string {
```

### src\services\admin\admin-tags.service.ts
```typescript
export interface ProductTag {
export function isTechnicalTag(tagName: string): boolean {
```

### src\services\admin\admin-testimonials.service.ts
```typescript
export interface TestimonialFormData {
```

### src\services\admin\admin-variants.service.ts
```typescript
export interface VariantInput {
```

### src\services\admin\admin-wheel.service.ts
```typescript
export interface WheelPrizeAdmin {
export interface WheelPrizeFormData {
export interface WheelStats {
```

### src\services\admin\intervention-workflow.service.ts
```typescript
export interface RecordSignalInput {
export function diagnoseSignal(signal: InterventionSignal): InterventionDiagnosis | null {
export interface CreateRecommendationInput {
export interface OperatorDecisionInput {
```

### src\services\admin-compatibility.service.ts
```typescript
export interface Concept {
export interface Alias {
export interface Relation {
export const adminCompatibilityService = {
```

### src\services\admin-knowledge.service.ts
```typescript
export type KnowledgeCategory = 'shipping' | 'payments' | 'vape_basics' | '420_basics' | 'policies' | 'faq' | 'onboarding';
export interface StoreKnowledgeNode {
export const adminKnowledgeService = {
```

### src\services\ai\semantic-search.repo.ts
```typescript
export type ProductSearchRow = {
export const PRODUCT_SEARCH_SELECT = `
export const PRODUCT_RECOVERY_STOPWORDS = new Set([
export const RECOVERY_FRUIT_HINTS = ['frutal', 'fruta', 'uva', 'mango', 'berry', 'cereza', 'fresa', 'kiwi', 'lychee', 'sandia', 'tropical', 'limon', 'apple'];
export const RECOVERY_MINT_HINTS = ['menta', 'mint', 'mentol', 'menthol', 'ice', 'helado', 'fresco'];
export const RECOVERY_BUDGET_HINTS = ['barato', 'barata', 'economico', 'economica', 'precio', 'presupuesto', 'menos', 'accesible', 'caro', 'cara', 'no muy caro', 'no tan caro'];
export const RECOVERY_VAPE_HINTS = ['vape', 'vapear', 'pod', 'pods', 'mod', 'mods', 'kit', 'kits', 'pen', 'device', 'starter', 'nic', 'nicsalt', 'salt', 'liquido', 'liquidos', 'juice', 'eliquid'];
export const RECOVERY_420_HINTS = ['thc', 'cbd', 'gomitas', 'brownies', 'paletas', 'herb', 'dry herb', 'convection', 'balloon', 'desktop vape', 'vaporizador', 'vaporizer', 'hemp'];
export const RECOVERY_LIQUID_HINTS = ['liquido', 'liquidos', 'juice', 'juicee', 'eliquid', 'e-liquid', 'salt', 'nicsalt', 'nic salt', 'ml', 'nicotina'];
export const RECOVERY_DEVICE_HINTS = ['vape', 'pod', 'kit', 'mod', 'pen', 'device', 'starter', 'equipo', 'aparato', 'chico', 'compacto', 'compacta'];
export const RECOVERY_SMALL_HINTS = ['chico', 'chica', 'compacto', 'compacta', 'mini', 'micro', 'slim', 'stealth', 'bolsillo', 'portatil', 'portatil'];
export const RECOVERY_MIXED_HINTS = ['ademas', 'tambien', ' y ', ' junto con ', ' aparte '];
export const RECOVERY_EXPLORATION_HINTS = ['busco', 'quiero', 'algo', 'no se cual', 'recomiendame', 'conviene', 'entre esos dos', 'cual conviene', 'me llevo', 'me lo llevo', 'ese'];
export const RECOVERY_NOT_FOUND_HINTS = ['no encuentro', 'no encontre', 'no sale', 'no aparece', 'no lo veo'];
export const RECOVERY_FACT_NICOTINE_HINTS = ['nicotina', 'mg'];
export const RECOVERY_FACT_FLAVOR_HINTS = ['sabor', 'frutal', 'fruta', 'menta', 'mint', 'ice', 'uva', 'mango', 'berry', 'cereza', 'fresa', 'sandia', 'tropical', 'apple'];
export const VARIANT_COLOR_HINTS = ['rojo', 'azul', 'verde', 'negro', 'blanco', 'gris', 'rosa', 'morado', 'amarillo', 'naranja', 'cafe', 'marron', 'silver', 'gold'];
export const VARIANT_ATTRIBUTE_HINTS = {
export type RecoveryQuerySignals = {
export type VariantTruth = NonNullable<InternalResolvedProduct['variant_truth']>;
export type ProductVariantOptionRow = {
export type ProductVariantRow = {
export function normalizeRecoveryToken(value: string): string {
export function extractRecoveryTokens(query: string): string[] {
export function normalizeRecoveryText(value: string): string {
export function normalizeVariantKey(value: string): string {
export function matchesVariantAttributeName(attributeName: string, requestedAttribute: VariantTruth['requested_attribute']): boolean {
export function hasRecoveryHint(normalizedText: string, hints: readonly string[]): boolean {
export function flattenSpecText(specs: unknown): string {
export function flattenVariantText(variants?: ProductVariantRow[] | null): string {
export function detectVariantAttribute(query: string): VariantTruth['requested_attribute'] {
export function extractVariantValueFromQuery(query: string, attribute: VariantTruth['requested_attribute']): string | null {
export function buildVariantTruth(query: string, product: ProductSearchRow): VariantTruth | undefined {
export function buildRecoverySignals(query: string): RecoveryQuerySignals {
export function buildProductRecoveryHaystack(product: ProductSearchRow): string {
export function isLikelyLiquidProduct(product: ProductSearchRow, haystack: string): boolean {
export function isLikelyDeviceProduct(haystack: string): boolean {
export function hasSpecLikeValue(haystack: string, key: string): boolean {
export function isLikelySmallProduct(haystack: string): boolean {
export function scoreRecoveryCandidate(product: ProductSearchRow, signals: RecoveryQuerySignals): number {
export function selectRecoveryCandidates(
export class SemanticSearchRepo {
```

### src\services\ai-behavior.service.ts
```typescript
export interface AIBehaviorRule {
```

### src\services\ai-capsules\constants.ts
```typescript
export const PRODUCT_SEARCH_SELECT = `
export const PRODUCT_RECOVERY_STOPWORDS = new Set([
export const RECOVERY_FRUIT_HINTS = ['frutal', 'fruta', 'uva', 'mango', 'berry', 'cereza', 'fresa', 'kiwi', 'lychee', 'sandia', 'tropical', 'limon', 'apple'];
export const RECOVERY_MINT_HINTS = ['menta', 'mint', 'mentol', 'menthol', 'ice', 'helado', 'fresco'];
export const RECOVERY_BUDGET_HINTS = ['barato', 'barata', 'economico', 'economica', 'precio', 'presupuesto', 'menos', 'accesible', 'caro', 'cara', 'no muy caro', 'no tan caro'];
export const RECOVERY_VAPE_HINTS = ['vape', 'vapear', 'pod', 'pods', 'mod', 'mods', 'kit', 'kits', 'pen', 'device', 'starter', 'nic', 'nicsalt', 'salt', 'liquido', 'liquidos', 'juice', 'eliquid'];
export const RECOVERY_420_HINTS = ['thc', 'cbd', 'gomitas', 'brownies', 'paletas', 'herb', 'dry herb', 'convection', 'balloon', 'desktop vape', 'vaporizador', 'vaporizer', 'hemp'];
export const RECOVERY_LIQUID_HINTS = ['liquido', 'liquidos', 'juice', 'juicee', 'eliquid', 'e-liquid', 'salt', 'nicsalt', 'nic salt', 'ml', 'nicotina'];
export const RECOVERY_DEVICE_HINTS = ['vape', 'pod', 'kit', 'mod', 'pen', 'device', 'starter', 'equipo', 'aparato', 'chico', 'compacto', 'compacta'];
export const RECOVERY_SMALL_HINTS = ['chico', 'chica', 'compacto', 'compacta', 'mini', 'micro', 'slim', 'stealth', 'bolsillo', 'portatil', 'portatil'];
export const RECOVERY_MIXED_HINTS = ['ademas', 'tambien', ' y ', ' junto con ', ' aparte '];
export const RECOVERY_EXPLORATION_HINTS = ['busco', 'quiero', 'algo', 'no se cual', 'recomiendame', 'conviene', 'entre esos dos', 'cual conviene', 'me llevo', 'me lo llevo', 'ese'];
export const RECOVERY_NOT_FOUND_HINTS = ['no encuentro', 'no encontre', 'no sale', 'no aparece', 'no lo veo'];
export const RECOVERY_FACT_NICOTINE_HINTS = ['nicotina', 'mg'];
export const RECOVERY_FACT_FLAVOR_HINTS = ['sabor', 'frutal', 'fruta', 'menta', 'mint', 'ice', 'uva', 'mango', 'berry', 'cereza', 'fresa', 'sandia', 'tropical', 'apple'];
export const VARIANT_COLOR_HINTS = ['rojo', 'azul', 'verde', 'negro', 'blanco', 'gris', 'rosa', 'morado', 'amarillo', 'naranja', 'cafe', 'marron', 'silver', 'gold'];
export const VARIANT_ATTRIBUTE_HINTS = {
```

### src\services\ai-capsules\mapper.ts
```typescript
export function mapDbToInternal(dbProducts: ProductSearchRow[], query: string): InternalResolvedProduct[] {
export function mapSearchRowToInternal(p: ProductSearchRow, query: string): InternalResolvedProduct {
export function mapStorefrontProductToInternal(product: Product, query: string): InternalResolvedProduct {
```

### src\services\ai-capsules\recovery.ts
```typescript
export function normalizeRecoveryToken(value: string): string {
export function extractRecoveryTokens(query: string): string[] {
export function normalizeRecoveryText(value: string): string {
export function normalizeVariantKey(value: string): string {
export function matchesVariantAttributeName(attributeName: string, requestedAttribute: any): boolean {
export function hasRecoveryHint(normalizedText: string, hints: readonly string[]): boolean {
export function flattenSpecText(specs: unknown): string {
export function flattenVariantText(variants?: ProductVariantRow[] | null): string {
export function detectVariantAttribute(query: string): VariantTruth['requested_attribute'] {
export function extractVariantValueFromQuery(query: string, attribute: VariantTruth['requested_attribute']): string | null {
export function buildVariantTruth(query: string, product: ProductSearchRow): VariantTruth | undefined {
export function buildRecoverySignals(query: string): RecoveryQuerySignals {
export function buildProductRecoveryHaystack(product: ProductSearchRow): string {
export function isLikelyLiquidProduct(product: ProductSearchRow, haystack: string): boolean {
export function isLikelyDeviceProduct(haystack: string): boolean {
export function hasSpecLikeValue(haystack: string, key: string): boolean {
export function isLikelySmallProduct(haystack: string): boolean {
export function scoreRecoveryCandidate(product: ProductSearchRow, signals: RecoveryQuerySignals): number {
export function selectRecoveryCandidates(
```

### src\services\ai-capsules\types.ts
```typescript
export type ProductSearchRow = {
export type RecoveryQuerySignals = {
export type VariantTruth = NonNullable<InternalResolvedProduct['variant_truth']>;
export type ProductVariantOptionRow = {
export type ProductVariantRow = {
export interface PilotFeedbackInput {
```

### src\services\brands.service.ts
```typescript
export interface PublicBrand {
```

### src\services\bundle.service.ts
```typescript
export interface SmartBundleOffer {
```

### src\services\concierge\cache.ts
```typescript
export const searchCache = new Map<string, any>();
```

### src\services\concierge\helpers.ts
```typescript
export function isRecord(value: unknown): value is Record<string, unknown> {
export function extractCustomerIntelligenceNoWriteSmokeMetadata(value: unknown): CustomerIntelligenceNoWriteSmokeMetadata | null {
export function attachCustomerIntelligenceNoWriteSmokeMetadata(error: unknown, metadata: unknown): Error {
export function resolveFallbackCurrentTurnDecision(primaryIntent: string | null | undefined): string | null {
export function normalizeTurnPriority(value: unknown): ConciergeTurnPriority {
export function canonicalizeTurnIntent(value: unknown): string | null {
export function isSearchLeadingIntent(intent: string | null | undefined): boolean {
export function hasInventorySpecificProductReference(query: string): boolean {
export function hasGroundedProductSearchDraft(input: {
export function hasDegradingUncertainty(value: string): boolean {
export function messagePreservesCompactDraft(candidate: string, compactDraft: string): boolean {
export function dropsVisibleProductAnchor(input: {
export function resolveGroundedProductSearchMessage(input: {
export function normalizeCatalogGateReason(value: unknown): ConciergeCatalogGateReason {
export function normalizeSourceContext(raw: unknown): ConciergeSourceContext | undefined {
export function buildConciergeCatalogGate(input: {
export function normalizeServerCatalogGate(
export function normalizeTurnAnalysis(raw: unknown, fallback: Partial<ConciergeTurnAnalysis> = {}): ConciergeTurnAnalysis {
export function getFallbackTurnAnalysis(data: {
export function extractTelemetryNextStepTruth(raw: unknown): {
export function isNonEmptyString(value: unknown): value is string {
export function deriveCheckoutBridgeAction(rawSignal: unknown): ConciergeMessage['action'] | undefined {
export function deriveOrderTrackingBridgeAction(rawSignal: unknown): ConciergeMessage['action'] | undefined {
```

### src\services\concierge\preferences.ts
```typescript
export function getPersonalizedBanner(segment: string): {
```

### src\services\concierge\types.ts
```typescript
export interface ConciergeMessage {
export interface ConciergeProductSearchMemoryContext {
export type ConciergeTurnPriority = 'primary' | 'secondary' | 'mixed' | 'unknown';
export type ConciergeCatalogGateReason =
export interface ConciergeTurnAnalysis {
export interface ConciergeCatalogGate {
export interface ConciergeSourceContext {
```

### src\services\concierge.service.ts
```typescript
export const conciergeService = {
```

### src\services\coupons.service.ts
```typescript
export interface CouponValidation {
export interface CouponRow {
```

### src\services\flash-deals.service.ts
```typescript
export interface FlashDeal {
export const flashDealsService = {
```

### src\services\gamification.service.ts
```typescript
export interface WheelPrize {
export interface WheelAttempt {
export const gamificationService = {
```

### src\services\index.ts
```typescript
export type { StorefrontOrderStatus as OrderStatus } from '@/lib/domain/orders';
export type { OrderRecord, OrderItem, CreateOrderData } from '@/types/order';
```

### src\services\inventory.service.ts
```typescript
export interface OraclePrediction {
export const inventoryService = {
```

### src\services\loyalty.service.ts
```typescript
export type Tier = TierId;
export type TierInfo = TierDefinition;
export interface PointsTransaction {
export interface ReferralStats {
export interface DynamicTier {
export function getTierFromSpent(totalSpent: number): Tier {
export function getTierInfo(tier: Tier, dynamicTiers?: DynamicTier[] | null): TierInfo {
export function getProgressToNextTier(totalSpent: number, _dynamicTiers?: DynamicTier[] | null) {
export interface LoyaltyStatsData {
export interface SmartLoyaltyProposition {
```

### src\services\monitoring.service.ts
```typescript
export const initMonitoring = () => {
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export interface AppLog {
export function logError(category: string, error: unknown, extraDetails?: Record<string, unknown>) {
export const MONITORING_CHANNEL = 'store_monitoring';
export function createPresenceChannel(
export function unsubscribeChannel(channel: ReturnType<typeof supabase.channel>) {
```

### src\services\notifications.service.ts
```typescript
export interface UserNotification {
export function subscribeToOrderUpdates(
```

### src\services\payments\mercadopago.service.ts
```typescript
export const mercadopagoService = {
```

### src\services\products.service.ts
```typescript
export function mapProductVariations(data: Product[]): Product[];
export function mapProductVariations(data: Product): Product;
export function mapProductVariations(data: Product | Product[]): Product | Product[] {
```

### src\services\settings.service.ts
```typescript
export interface HeroSlider {
export interface FeaturedCategory {
export interface LoyaltyTier {
export interface LoyaltyConfig {
export interface PilotRunbookItem {
export interface StoreSettings {
```

### src\services\stats.service.ts
```typescript
export interface TopProduct {
export interface MonthlySpending {
export interface CustomerStats {
```

### src\services\storefront-budget-rescue.service.ts
```typescript
export interface StorefrontBudgetRescueResolution {
```

### src\services\storefront-cart-audit.service.ts
```typescript
export type StorefrontCartDependencyRelationType =
export type StorefrontCompatibilityScope = 'specific_model' | 'class_generalization';
export interface StorefrontCartDependencyOffer {
```

### src\services\storefront-checkout-readiness.service.ts
```typescript
export interface StorefrontCheckoutReadinessResolution {
```

### src\services\storefront-compatibility-check.service.ts
```typescript
export interface StorefrontCompatibilityCheckResolution {
```

### src\services\storefront-loyalty-status.service.ts
```typescript
export interface StorefrontLoyaltyStatusResolution {
```

### src\services\storefront-order-tracking.service.ts
```typescript
export interface StorefrontOrderTrackingResolution {
export interface StorefrontOrderTrackingTrustView {
export function getStorefrontOrderTrackingTrustView(order: Pick<OrderRecord, 'status' | 'tracking_number' | 'tracking_notes'>): StorefrontOrderTrackingTrustView {
```

### src\services\storefront-replenishment.service.ts
```typescript
export function detectStorefrontReplenishmentIntent(
```

### src\services\storefront-warranty-triage.service.ts
```typescript
export interface StorefrontWarrantyTriageResolution {
```

### src\services\wishlist.service.ts
```typescript
export interface WishlistRow {
```

### src\stores\cart.store.ts
```typescript
export interface CartValidationIssue {
export interface CartValidationResult {
export interface CartConversionContext {
export const useCartStore = create<CartState>()(
export const selectTotalItems = (state: CartState) =>
export const selectSubtotal = (state: CartState) => {
export const selectTotal = selectSubtotal;
```

### src\stores\confirm.store.ts
```typescript
export interface ConfirmState {
export const useConfirmStore = create<ConfirmState & ConfirmActions>((set, get) => ({
```

### src\stores\notifications.store.ts
```typescript
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export interface Notification {
export const useNotificationsStore = create<NotificationsState>((set) => ({
```

### src\stores\search-overlay.store.ts
```typescript
export const useSearchOverlay = create<SearchOverlayStore>((set) => ({
```

### src\stores\wishlist.store.ts
```typescript
export const useWishlistStore = create<WishlistState>()(
```

### src\types\ai-capsule.ts
```typescript
export type ProductSearchToolArgs = z.infer<typeof productSearchToolSchema>;
export type InternalResolvedProductType = z.infer<typeof internalResolvedProductSchema>;
export type PublicAttachmentType = z.infer<typeof publicAttachmentSchema>;
export type FrontendResponseContractType = z.infer<typeof frontendResponseSchema>;
export type InternalCapsuleContractType = z.infer<typeof internalCapsuleContractSchema>;
export type KnowledgeToolArgs = z.infer<typeof knowledgeToolSchema>;
export type InternalKnowledgeChunkType = z.infer<typeof internalKnowledgeChunkSchema>;
export type InternalKnowledgeContractType = z.infer<typeof internalKnowledgeContractSchema>;
export type CartOperatorToolArgs = z.infer<typeof cartOperatorToolSchema>;
export type InternalCartOperatorContractType = z.infer<typeof internalCartOperatorContractSchema>;
export type OrderTrackingToolArgs = z.infer<typeof orderTrackingToolSchema>;
export type InternalOrderTrackingContractType = z.infer<typeof internalOrderTrackingContractSchema>;
export type WarrantyTriageToolArgs = z.infer<typeof warrantyTriageToolSchema>;
export type InternalWarrantyTriageContractType = z.infer<typeof internalWarrantyTriageContractSchema>;
export type LoyaltyStatusToolArgs = z.infer<typeof loyaltyStatusToolSchema>;
export type InternalLoyaltyStatusContractType = z.infer<typeof internalLoyaltyStatusContractSchema>;
export type CheckoutReadinessToolArgs = z.infer<typeof checkoutReadinessToolSchema>;
export type InternalCheckoutReadinessContractType = z.infer<typeof internalCheckoutReadinessContractSchema>;
export type InventoryOutlookToolArgs = z.infer<typeof inventoryOutlookToolSchema>;
export type InternalInventoryOutlookContractType = z.infer<typeof internalInventoryOutlookContractSchema>;
export type CompatibilityCheckToolArgs = z.infer<typeof storefrontCompatibilityCheckToolSchema>;
export type InternalCompatibilityCheckContractType = z.infer<typeof internalCompatibilityCheckContractSchema>;
export type BudgetRescueToolArgs = z.infer<typeof storefrontBudgetRescueToolSchema>;
export type InternalBudgetRescueContractType = z.infer<typeof internalBudgetRescueContractSchema>;
export type KittingBasketToolArgs = z.infer<typeof storefrontKittingToolSchema>;
export type InternalKittingBasketContractType = z.infer<typeof internalKittingBasketContractSchema>;
export type {
```

### src\types\cart.ts
```typescript
export interface CartItem {
export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethod = 'whatsapp' | 'mercadopago' | 'cash' | 'transfer' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export interface CheckoutFormData {
export interface MercadoPagoPaymentData {
export interface Order extends CheckoutFormData {
```

### src\types\category.ts
```typescript
export interface Category {
export type CategoryInsert = Omit<Category, 'id' | 'created_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;
export interface CategoryWithChildren extends Category {
```

### src\types\cesarin.ts
```typescript
export type BehaviorMode = 'vendedor' | 'informativo' | 'soporte';
export interface AIConfig {
export interface AIRule {
export interface LearningItem {
export interface SimulationMessage {
export interface SimulationSessionTurnRecord {
export interface SimulationDebug {
export interface SimulationSessionMetadata {
export interface SimulationSession {
export type PremiumLabModeIdentity = 'storefront-equivalent' | 'admin-simulated' | 'replay';
export type PremiumLabSessionStatus = 'draft' | 'active' | 'closed' | 'archived';
export type PremiumLabExecutionKind = 'storefront_runtime' | 'lab_simulation' | 'replay_snapshot';
export type PremiumLabCommentScope = 'session' | 'turn';
export type PremiumLabTurnReviewSource = 'linked_ai_evaluation' | 'lab_review';
export type PremiumLabCaseDraftLinkKind = 'derived_case_draft' | 'linked_case_draft';
export type PremiumLabImprovementLinkKind = 'improvement_item' | 'intervention_signal' | 'intervention_recommendation';
export interface PremiumLabArtifactTraceSnapshot {
export interface PremiumLabArtifactSnapshot {
export interface PremiumLabSession {
export interface PremiumLabTurn {
export interface PremiumLabComment {
export interface PremiumLabTurnReview {
export interface PremiumLabCaseDraftLink {
export interface PremiumLabImprovementLink {
export type CaseDraftSourceType = 'review_drawer' | 'qa_simulation';
export type CaseDraftReadinessStatus = 'draft' | 'needs_expected_outcome' | 'ready';
export interface PrivateCaseDraft {
export interface MemoryTrace {
export interface SimulationResult {
export interface SimulationReport {
export interface NavTab {
export interface ProductAIInfo {
export type InterventionSignalType = 'enrichment_gap' | 'compatibility_miss' | 'escalation_theme';
export type InterventionType = 'enrichment' | 'compatibility' | 'escalation_playbook';
export type OperatorDecision = 'pending' | 'approved' | 'rejected' | 'deferred';
export type ExecutionStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type Confidence = 'high' | 'medium' | 'low';
export interface InterventionSignal {
export interface InterventionDiagnosis {
export interface InterventionRecommendation {
```

### src\types\collection.ts
```typescript
export interface Collection {
export type CollectionInsert = Omit<Collection, 'id' | 'created_at'>;
export type CollectionUpdate = Partial<CollectionInsert>;
```

### src\types\constants.ts
```typescript
export const SECTIONS = {
export const SYSTEM_CATEGORY_SLUGS = {
export type Section = string;
export const PRODUCT_STATUS = {
export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];
```

### src\types\customer.ts
```typescript
export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AccountStatus = 'active' | 'suspended' | 'banned';
export interface IAContext {
export interface AIPreferences {
export interface CustomerProfile {
```

### src\types\order-admin-events.ts
```typescript
export const ORDER_ADMIN_EVENT_TYPES = [
export type OrderAdminEventType = typeof ORDER_ADMIN_EVENT_TYPES[number];
export const ORDER_ADMIN_EVENT_SOURCES = [
export type OrderAdminEventSource = typeof ORDER_ADMIN_EVENT_SOURCES[number];
export const ORDER_ADMIN_EVENT_VISIBILITIES = [
export type OrderAdminEventVisibility = typeof ORDER_ADMIN_EVENT_VISIBILITIES[number];
export interface OrderAdminEventRecord {
export type CreateOrderAdminEventInput = Omit<OrderAdminEventRecord, 'id' | 'created_at'>;
```

### src\types\order.ts
```typescript
export interface OrderItem {
export interface OrderRecord {
export interface CreateOrderData {
export interface TrackingEvent {
export interface TrackingInfo {
export interface RealtimeOrderEvent {
```

### src\types\product.ts
```typescript
export type { Section, ProductStatus };
export interface Product {
export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;
```

### src\types\testimonial.ts
```typescript
export interface Testimonial {
export type TestimonialInsert = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'> & {
export type TestimonialUpdate = Partial<TestimonialInsert>;
```

### src\types\variant.ts
```typescript
export interface ProductAttribute {
export interface ProductAttributeValue {
export interface ProductVariant {
export interface ProductVariantOption {
export interface VariantMatrixRow {
```

### src\utils\theme-mapper.ts
```typescript
export const getSolidBackgroundClass = (colorOrToken: string | undefined): string => {
export const getSubtleBadgeClasses = (colorOrToken: string | undefined): string => {
export const getBorderHighlightClass = (colorOrToken: string | undefined): string => {
export const getTextHighlightClass = (colorOrToken: string | undefined): string => {
export const getStatusDotClass = (colorOrToken: string | undefined): string => {
```

