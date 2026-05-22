-- RPC: Reschedule Booking (Atomic)
CREATE OR REPLACE FUNCTION reschedule_booking(
  p_booking_id UUID,
  p_new_flight_id UUID,
  p_new_seat_id UUID,
  p_fee_charged NUMERIC
) RETURNS VOID AS $$
DECLARE
  v_old_seat_id UUID;
  v_old_flight_id UUID;
  v_user_id UUID;
  v_seat_available BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get old booking details and lock the row
  SELECT seat_id, flight_id INTO v_old_seat_id, v_old_flight_id
  FROM bookings
  WHERE id = p_booking_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or access denied';
  END IF;

  -- Check if new seat is available and lock it
  SELECT is_available INTO v_seat_available
  FROM seats
  WHERE id = p_new_seat_id AND flight_id = p_new_flight_id
  FOR UPDATE;

  IF v_seat_available IS NOT TRUE THEN
    RAISE EXCEPTION 'New seat is not available';
  END IF;

  -- 1. Free the old seat
  UPDATE seats
  SET is_available = TRUE
  WHERE id = v_old_seat_id;

  -- 2. Occupy the new seat
  UPDATE seats
  SET is_available = FALSE
  WHERE id = p_new_seat_id;

  -- 3. Update the booking
  UPDATE bookings
  SET 
    flight_id = p_new_flight_id,
    seat_id = p_new_seat_id,
    status = 'rescheduled',
    total_price = total_price + p_fee_charged
  WHERE id = p_booking_id;

  -- 4. Log the reschedule
  INSERT INTO reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (p_booking_id, v_old_flight_id, p_new_flight_id, p_fee_charged);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
