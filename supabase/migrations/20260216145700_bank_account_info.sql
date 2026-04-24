-- Add bank_account_info column to store_settings table
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS bank_account_info text;

-- Add comment
COMMENT ON COLUMN public.store_settings.bank_account_info IS 'Information for bank transfers (account number, bank name, etc.)';
