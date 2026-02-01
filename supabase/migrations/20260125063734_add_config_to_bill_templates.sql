-- Add config column to bill_templates table
ALTER TABLE public.bill_templates ADD COLUMN config JSONB;