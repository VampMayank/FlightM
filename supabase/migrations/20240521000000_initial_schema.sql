-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Flights Table
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_no TEXT NOT NULL UNIQUE,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departs_at TIMESTAMPTZ NOT NULL,
    arrives_at TIMESTAMPTZ NOT NULL,
    aircraft_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    base_price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seats Table
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    class TEXT NOT NULL CHECK (class IN ('economy', 'business', 'first')),
    is_available BOOLEAN DEFAULT TRUE,
    extra_fee NUMERIC DEFAULT 0,
    UNIQUE(flight_id, seat_number)
);

-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES flights(id),
    seat_id UUID REFERENCES seats(id),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'rescheduled')),
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    total_price NUMERIC NOT NULL,
    pnr_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passengers Table
CREATE TABLE passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    passport_no TEXT NOT NULL,
    nationality TEXT NOT NULL,
    dob DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reschedules Table
CREATE TABLE reschedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    old_flight_id UUID REFERENCES flights(id),
    new_flight_id UUID REFERENCES flights(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    fee_charged NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Flights & Seats: Everyone can read
CREATE POLICY "Flights are viewable by everyone" ON flights FOR SELECT USING (true);
CREATE POLICY "Seats are viewable by everyone" ON seats FOR SELECT USING (true);

-- Bookings: Users can only see/manage their own
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Passengers: Users can only see/manage passengers for their bookings
CREATE POLICY "Users can view passengers for their bookings" ON passengers FOR SELECT 
USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = passengers.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users can insert passengers for their bookings" ON passengers FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = passengers.booking_id AND bookings.user_id = auth.uid()));

-- Reschedules: Users can only see/manage their own reschedules
CREATE POLICY "Users can view their own reschedules" ON reschedules FOR SELECT 
USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = reschedules.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users can insert their own reschedules" ON reschedules FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = reschedules.booking_id AND bookings.user_id = auth.uid()));

-- RPC: Reserve Seat (Atomic)
CREATE OR REPLACE FUNCTION reserve_seat(
  p_flight_id UUID,
  p_seat_id UUID,
  p_total_price NUMERIC,
  p_pnr_code TEXT
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_seat_available BOOLEAN;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Select for update to lock the seat row
  SELECT is_available INTO v_seat_available
  FROM seats
  WHERE id = p_seat_id AND flight_id = p_flight_id
  FOR UPDATE;

  IF v_seat_available IS NOT TRUE THEN
    RAISE EXCEPTION 'Seat is not available';
  END IF;

  -- Update seat availability
  UPDATE seats
  SET is_available = FALSE
  WHERE id = p_seat_id;

  -- Create booking
  INSERT INTO bookings (user_id, flight_id, seat_id, status, total_price, pnr_code)
  VALUES (v_user_id, p_flight_id, p_seat_id, 'confirmed', p_total_price, p_pnr_code)
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Cancel Booking (Atomic)
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID
) RETURNS VOID AS $$
DECLARE
  v_seat_id UUID;
  v_flight_id UUID;
  v_departs_at TIMESTAMPTZ;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  -- Get booking details and check ownership
  SELECT b.seat_id, b.flight_id, f.departs_at
  INTO v_seat_id, v_flight_id, v_departs_at
  FROM bookings b
  JOIN flights f ON b.flight_id = f.id
  WHERE b.id = p_booking_id AND b.user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or access denied';
  END IF;

  -- Check 2-hour rule
  IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
    RAISE EXCEPTION 'Cancellations are not allowed within 2 hours of departure';
  END IF;

  -- Update booking status
  UPDATE bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id;

  -- Free the seat
  UPDATE seats
  SET is_available = TRUE
  WHERE id = v_seat_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for 2-hour cancellation rule (backup for direct updates)
CREATE OR REPLACE FUNCTION check_cancellation_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    IF EXISTS (
      SELECT 1 FROM flights
      WHERE id = OLD.flight_id
      AND departs_at - NOW() < INTERVAL '2 hours'
    ) THEN
      RAISE EXCEPTION 'Cancellations are not allowed within 2 hours of departure';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_cancellation_2hour_rule
BEFORE UPDATE ON bookings
FOR EACH ROW
WHEN (NEW.status = 'cancelled' AND OLD.status != 'cancelled')
EXECUTE FUNCTION check_cancellation_time();
