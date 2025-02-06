/*
  # Add stored procedure for retrieving customer leads

  1. New Functions
    - get_customer_leads: Returns customer information with their latest message and message count
*/

CREATE OR REPLACE FUNCTION get_customer_leads()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  nome text,
  celular_cliente text,
  timer_is_active boolean,
  message_content text,
  total_messages bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT 
      m.phone,
      m.message_content,
      m.created_at,
      COUNT(*) OVER (PARTITION BY m.phone) as msg_count,
      ROW_NUMBER() OVER (PARTITION BY m.phone ORDER BY m.created_at DESC) as rn
    FROM messages m
  )
  SELECT 
    c.id,
    lm.created_at,
    c.nome,
    c.celular_cliente,
    c.timer_is_active,
    lm.message_content,
    lm.msg_count as total_messages
  FROM customers c
  JOIN latest_messages lm ON c.celular_cliente = lm.phone
  WHERE lm.rn = 1
  ORDER BY lm.created_at DESC;
END;
$$ LANGUAGE plpgsql;