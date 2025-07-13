-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '3DCraftFlow',
  description TEXT NOT NULL DEFAULT 'Servicios de Impresión 3D',
  email TEXT NOT NULL DEFAULT 'info@3dcraftflow.com',
  phone TEXT NOT NULL DEFAULT '+34 XXX XXX XXX',
  address TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  tax_id TEXT NOT NULL DEFAULT '',
  bank_info TEXT NOT NULL DEFAULT '',
  terms TEXT NOT NULL DEFAULT 'Este documento es un albarán de entrega de servicios de impresión 3D. Para cualquier consulta, contacte con nosotros.',
  footer TEXT NOT NULL DEFAULT 'Gracias por confiar en nuestros servicios de impresión 3D.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to ensure one settings per user
CREATE UNIQUE INDEX IF NOT EXISTS company_settings_user_id_idx ON company_settings(user_id);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own company settings" ON company_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company settings" ON company_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company settings" ON company_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_company_settings_updated_at(); 