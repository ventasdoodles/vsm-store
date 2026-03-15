-- Fix Wishlist RLS for UPSERT support
-- Supabase .upsert() requires UPDATE permission even if no fields change.

CREATE POLICY "Users can update own wishlist"
    ON customer_wishlists FOR UPDATE
    USING (auth.uid() = customer_id)
    WITH CHECK (auth.uid() = customer_id);

-- Ensure admins can also view it (re-affirming existing if needed, but distinct for safety)
CREATE POLICY "Admins can update all wishlists"
    ON customer_wishlists FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE id = auth.uid()
        )
    );
