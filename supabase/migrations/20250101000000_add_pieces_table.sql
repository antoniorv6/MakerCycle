-- Create pieces table
CREATE TABLE IF NOT EXISTS pieces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filament_weight DECIMAL(10,2) NOT NULL DEFAULT 0,
    filament_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    print_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pieces_project_id ON pieces(project_id);
CREATE INDEX IF NOT EXISTS idx_pieces_created_at ON pieces(created_at);

-- Add RLS policies
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own pieces
CREATE POLICY "Users can view their own pieces" ON pieces
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to insert their own pieces
CREATE POLICY "Users can insert their own pieces" ON pieces
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to update their own pieces
CREATE POLICY "Users can update their own pieces" ON pieces
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to delete their own pieces
CREATE POLICY "Users can delete their own pieces" ON pieces
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pieces_updated_at 
    BEFORE UPDATE ON pieces 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 