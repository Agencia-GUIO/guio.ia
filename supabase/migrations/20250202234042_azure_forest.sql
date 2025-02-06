/*
  # Add sample data for testing

  This migration adds sample data for testing the chat interface:
  1. Sample Data
    - Two test customers with different phone numbers
    - Sample chat messages for each customer
  2. Security
    - All records are associated with a test client ID
*/

-- Use a constant UUID for testing
DO $$
DECLARE
  test_client_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  -- Insert test customers
  INSERT INTO customers (nome, celular_cliente, client_id)
  VALUES 
    ('John Doe', '+5511999999999', test_client_id),
    ('Jane Smith', '+5511988888888', test_client_id);

  -- Insert sample messages
  INSERT INTO messages (message_content, status, role, phone, client_id)
  VALUES 
    ('Hello! How can I help you today?', 'sent', 'assistant', '+5511999999999', test_client_id),
    ('I need help with my order', 'sent', 'customer', '+5511999999999', test_client_id),
    ('Of course! Could you please provide your order number?', 'sent', 'assistant', '+5511999999999', test_client_id),
    ('Hi there!', 'sent', 'assistant', '+5511988888888', test_client_id),
    ('I have a question about your services', 'sent', 'customer', '+5511988888888', test_client_id),
    ('I''d be happy to help. What would you like to know?', 'sent', 'assistant', '+5511988888888', test_client_id);
END $$;