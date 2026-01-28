-- Fix numeric precision for print_hours fields
-- This ensures that decimal values are stored with proper precision

-- Update pieces table print_hours column
ALTER TABLE pieces 
ALTER COLUMN print_hours TYPE numeric(10,2);

-- Update projects table print_hours column  
ALTER TABLE projects
ALTER COLUMN print_hours TYPE numeric(10,2);

-- Update sales table print_hours column if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sales' AND column_name = 'print_hours') THEN
        ALTER TABLE sales ALTER COLUMN print_hours TYPE numeric(10,2);
    END IF;
END $$;

-- Update any other tables that might have print_hours with numeric type
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'expenses' AND column_name = 'print_hours') THEN
        ALTER TABLE expenses ALTER COLUMN print_hours TYPE numeric(10,2);
    END IF;
END $$;

