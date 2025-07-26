-- Phase 2: Customers, Quotes, and Quote Line Items
-- Run this after the main schema.sql

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    contact_person VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    quote_number VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, approved, rejected, expired
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, quote_number)
);

-- Quote Line Items table
CREATE TABLE quote_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_quotes_tenant_id ON quotes(tenant_id);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quote_line_items_quote_id ON quote_line_items(quote_id);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_line_items_updated_at BEFORE UPDATE ON quote_line_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update quote totals when line items change
CREATE OR REPLACE FUNCTION update_quote_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE quotes 
    SET 
        subtotal = (
            SELECT COALESCE(SUM(line_total), 0) 
            FROM quote_line_items 
            WHERE quote_id = CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.quote_id 
                ELSE NEW.quote_id 
            END
        ),
        tax_amount = CASE 
            WHEN tax_rate > 0 THEN 
                (SELECT COALESCE(SUM(line_total), 0) FROM quote_line_items 
                 WHERE quote_id = CASE 
                    WHEN TG_OP = 'DELETE' THEN OLD.quote_id 
                    ELSE NEW.quote_id 
                 END) * tax_rate
            ELSE 0
        END
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.quote_id 
        ELSE NEW.quote_id 
    END;
    
    -- Update total = subtotal + tax_amount
    UPDATE quotes 
    SET total = subtotal + tax_amount
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.quote_id 
        ELSE NEW.quote_id 
    END;
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update quote totals
CREATE TRIGGER update_quote_totals_on_line_item_change
    AFTER INSERT OR UPDATE OR DELETE ON quote_line_items
    FOR EACH ROW EXECUTE FUNCTION update_quote_totals();

-- Function to update quote totals when tax rate changes
CREATE OR REPLACE FUNCTION update_quote_totals_on_quote_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.tax_rate IS DISTINCT FROM NEW.tax_rate THEN
        NEW.tax_amount = NEW.subtotal * NEW.tax_rate;
        NEW.total = NEW.subtotal + NEW.tax_amount;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_totals_on_tax_change
    BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_quote_totals_on_quote_change();