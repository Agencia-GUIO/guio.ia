-- First make celular_cliente unique
ALTER TABLE customers
ADD CONSTRAINT customers_celular_cliente_unique UNIQUE (celular_cliente);

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_customers_celular_cliente ON customers(celular_cliente);

-- Add foreign key constraint
ALTER TABLE messages
ADD CONSTRAINT fk_messages_customers
FOREIGN KEY (phone) REFERENCES customers(celular_cliente);