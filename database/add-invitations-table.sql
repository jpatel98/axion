-- Add invitations table for user management
-- Run this script in your Supabase SQL Editor after the main schema

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant_id ON invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Add unique constraint to prevent duplicate pending invitations
ALTER TABLE invitations ADD CONSTRAINT unique_pending_invitation 
  UNIQUE (tenant_id, email, status) DEFERRABLE INITIALLY DEFERRED;

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for invitations
CREATE POLICY "Managers can manage invitations in their tenant" ON invitations
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role = 'manager'
    )
  );

-- Grant permissions
GRANT ALL ON invitations TO authenticated;

-- Show completion
SELECT 'Invitations table created successfully!' as status;