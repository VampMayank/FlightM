-- Add return flight support to bookings
ALTER TABLE bookings 
ADD COLUMN return_flight_id UUID REFERENCES flights(id),
ADD COLUMN return_seat_id UUID REFERENCES seats(id);

-- Update reserve_seat RPC to handle optional return flight
CREATE OR REPLACE FUNCTION reserve_seat(
  p_flight_id UUID,
  p_seat_id UUID,
  p_total_price NUMERIC,
  p_pnr_code TEXT,
  p_return_flight_id UUID DEFAULT NULL,
  p_return_seat_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_seat_available BOOLEAN;
  v_return_seat_available BOOLEAN;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock outbound seat
  SELECT is_available INTO v_seat_available
  FROM seats
  WHERE id = p_seat_id AND flight_id = p_flight_id
  FOR UPDATE;

  IF v_seat_available IS NOT TRUE THEN
    RAISE EXCEPTION 'Outbound seat is not available';
  END IF;

  -- Lock return seat if applicable
  IF p_return_flight_id IS NOT NULL AND p_return_seat_id IS NOT NULL THEN
    SELECT is_available INTO v_return_seat_available
    FROM seats
    WHERE id = p_return_seat_id AND flight_id = p_return_flight_id
    FOR UPDATE;

    IF v_return_seat_available IS NOT TRUE THEN
      RAISE EXCEPTION 'Return seat is not available';
    END IF;
  END IF;

  -- Update seat availability
  UPDATE seats SET is_available = FALSE WHERE id = p_seat_id;
  IF p_return_seat_id IS NOT NULL THEN
    UPDATE seats SET is_available = FALSE WHERE id = p_return_seat_id;
  END IF;

  -- Create booking
  INSERT INTO bookings (
    user_id, 
    flight_id, 
    seat_id, 
    return_flight_id, 
    return_seat_id, 
    status, 
    total_price, 
    pnr_code
  )
  VALUES (
    v_user_id, 
    p_flight_id, 
    p_seat_id, 
    p_return_flight_id, 
    p_return_seat_id, 
    'confirmed', 
    p_total_price, 
    p_pnr_code
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
