-- Add new columns to lesson_plans table for enhanced content
ALTER TABLE public.lesson_plans 
ADD COLUMN IF NOT EXISTS visual_aids jsonb,
ADD COLUMN IF NOT EXISTS presentation_slides jsonb,
ADD COLUMN IF NOT EXISTS interactive_activities jsonb;