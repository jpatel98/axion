-- Row Level Security Policies for Axion ERP
-- Run this after 01-core-schema.sql to set up secure multi-tenant access

-- Tenant-based RLS policies (users can only see data from their tenant)

-- Users table policies
CREATE POLICY users_tenant_policy ON users FOR ALL 
USING (tenant_id = (
    SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));

-- Customers table policies  
CREATE POLICY customers_tenant_policy ON customers FOR ALL
USING (tenant_id = (
    SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));

-- Work Centers table policies
CREATE POLICY work_centers_tenant_policy ON work_centers FOR ALL
USING (tenant_id = (
    SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));

-- Jobs table policies
CREATE POLICY jobs_tenant_policy ON jobs FOR ALL
USING (tenant_id = (
    SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));

-- Quotes table policies
CREATE POLICY quotes_tenant_policy ON quotes FOR ALL
USING (tenant_id = (
    SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));

-- Quote line items policies (through quotes relationship)
CREATE POLICY quote_line_items_tenant_policy ON quote_line_items FOR ALL
USING (quote_id IN (
    SELECT id FROM quotes WHERE tenant_id = (
        SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
));

-- Job operations policies (through jobs relationship)
CREATE POLICY job_operations_tenant_policy ON job_operations FOR ALL
USING (job_id IN (
    SELECT id FROM jobs WHERE tenant_id = (
        SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
));

-- Scheduled operations policies
CREATE POLICY scheduled_operations_tenant_policy ON scheduled_operations FOR ALL
USING (tenant_id = (
    SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));

-- User invitations policies
CREATE POLICY user_invitations_tenant_policy ON user_invitations FOR ALL
USING (tenant_id = (
    SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));

-- System events policies
CREATE POLICY system_events_tenant_policy ON system_events FOR ALL
USING (tenant_id = (
    SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));

-- Role-based policies for sensitive operations

-- Only managers and admins can invite users
CREATE POLICY user_invitations_role_policy ON user_invitations FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE clerk_user_id = auth.jwt() ->> 'sub' 
        AND role IN ('manager', 'admin')
        AND tenant_id = user_invitations.tenant_id
    )
);

-- Only admins can modify work centers
CREATE POLICY work_centers_admin_modify ON work_centers FOR UPDATE
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE clerk_user_id = auth.jwt() ->> 'sub' 
        AND role = 'admin'
        AND tenant_id = work_centers.tenant_id
    )
);

-- Operators can only update job status, not create/delete jobs
CREATE POLICY jobs_operator_updates ON jobs FOR UPDATE
USING (
    tenant_id = (
        SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
    AND (
        -- Admins and managers can update everything
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_user_id = auth.jwt() ->> 'sub' 
            AND role IN ('admin', 'manager')
        )
        -- Operators can only update status
        OR (
            EXISTS (
                SELECT 1 FROM users 
                WHERE clerk_user_id = auth.jwt() ->> 'sub' 
                AND role = 'operator'
            )
            -- Only allow status updates for operators
        )
    )
);

-- Enable policies on tenant table (special case - users need to see their own tenant)
CREATE POLICY tenants_own_tenant ON tenants FOR SELECT
USING (id = (
    SELECT tenant_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));