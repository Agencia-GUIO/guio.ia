/*
  # Add unique constraint and foreign key relationship

  1. Changes
    - Add unique constraint to customers.celular_cliente
    - Add index on customers.celular_cliente
    - Add foreign key from messages.phone to customers.celular_cliente

  2. Security
    - Maintain existing RLS policies
*/

-- First make celular_cliente unique
ALTER TABLE customers
ADD CONSTRAINT customers_celular_cliente_unique UNIQUE (celular_cliente);

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_customers_celular_cliente ON customers(celular_cliente);

-- Add foreign key constraint
ALTER TABLE messages
ADD CONSTRAINT fk_messages_customers
FOREIGN KEY (phone) REFERENCES customers(celular_cliente);