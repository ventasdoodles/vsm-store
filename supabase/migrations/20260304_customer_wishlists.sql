-- Customer Wishlists — Sincroniza favoritos del storefront con la BD
-- Permite al admin ver la wishlist de cada cliente.

CREATE TABLE IF NOT EXISTS customer_wishlists (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(customer_id, product_id)
);

-- RLS
ALTER TABLE customer_wishlists ENABLE ROW LEVEL SECURITY;

-- Users can read/insert/delete their own wishlist items
CREATE POLICY "Users can view own wishlist"
    ON customer_wishlists FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Users can add to own wishlist"
    ON customer_wishlists FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can remove from own wishlist"
    ON customer_wishlists FOR DELETE
    USING (auth.uid() = customer_id);

-- Admin can read all wishlists (same pattern as other admin policies)
CREATE POLICY "Admin can view all wishlists"
    ON customer_wishlists FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE id = auth.uid()
        )
    );

-- Index for fast lookup by customer
CREATE INDEX idx_customer_wishlists_customer ON customer_wishlists(customer_id);
CREATE INDEX idx_customer_wishlists_product ON customer_wishlists(product_id);
