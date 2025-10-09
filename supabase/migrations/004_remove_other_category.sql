-- Remove 'other' category from material_presets
-- Update existing 'other' records to 'filament' as default
-- Update the check constraint to only allow 'filament' and 'resin'

-- First, update any existing 'other' records to 'filament'
UPDATE material_presets 
SET category = 'filament' 
WHERE category = 'other';

-- Update the check constraint
ALTER TABLE material_presets 
DROP CONSTRAINT IF EXISTS material_presets_category_check;

ALTER TABLE material_presets 
ADD CONSTRAINT material_presets_category_check 
CHECK (category IN ('filament', 'resin'));
