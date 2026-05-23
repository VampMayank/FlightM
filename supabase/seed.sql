-- Seed Flights (Outbound)
INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price)
VALUES 
    (uuid_generate_v4(), 'EK001', 'Dubai', 'London', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 7 hours', 'Airbus A380', 800),
    (uuid_generate_v4(), 'EK002', 'Dubai', 'London', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 7 hours', 'Airbus A380', 850),
    (uuid_generate_v4(), 'AA100', 'New York', 'Los Angeles', NOW() + INTERVAL '1 day 4 hours', NOW() + INTERVAL '1 day 10 hours', 'Boeing 777', 400),
    (uuid_generate_v4(), 'AA101', 'New York', 'Los Angeles', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 6 hours', 'Boeing 777', 420),
    (uuid_generate_v4(), 'SQ200', 'Singapore', 'Sydney', NOW() + INTERVAL '1 day 12 hours', NOW() + INTERVAL '1 day 20 hours', 'Airbus A350', 600),
    (uuid_generate_v4(), 'AF275', 'Tokyo', 'Paris', NOW() + INTERVAL '1 day 2 hours', NOW() + INTERVAL '1 day 15 hours', 'Boeing 787', 900),
    (uuid_generate_v4(), 'LH400', 'Frankfurt', 'New York', NOW() + INTERVAL '1 day 6 hours', NOW() + INTERVAL '1 day 14 hours', 'Boeing 747', 750);

-- Seed Return Flights
INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price)
VALUES 
    (uuid_generate_v4(), 'EK001-R', 'London', 'Dubai', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 7 hours', 'Airbus A380', 780),
    (uuid_generate_v4(), 'EK002-R', 'London', 'Dubai', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 7 hours', 'Airbus A380', 750),
    (uuid_generate_v4(), 'AA100-R', 'Los Angeles', 'New York', NOW() + INTERVAL '4 days 2 hours', NOW() + INTERVAL '4 days 8 hours', 'Boeing 777', 410),
    (uuid_generate_v4(), 'SQ200-R', 'Sydney', 'Singapore', NOW() + INTERVAL '4 days 12 hours', NOW() + INTERVAL '4 days 20 hours', 'Airbus A350', 620),
    (uuid_generate_v4(), 'AF275-R', 'Paris', 'Tokyo', NOW() + INTERVAL '4 days 2 hours', NOW() + INTERVAL '4 days 15 hours', 'Boeing 787', 880),
    (uuid_generate_v4(), 'LH400-R', 'New York', 'Frankfurt', NOW() + INTERVAL '5 days 6 hours', NOW() + INTERVAL '5 days 14 hours', 'Boeing 747', 720);

-- Function to seed seats for all flights
DO $$
DECLARE
    f RECORD;
    r INT;
    c CHAR;
BEGIN
    FOR f IN SELECT id FROM flights LOOP
        -- First Class: Row 1, Seats A-D (for outbound)
        IF f.flight_no NOT LIKE '%-R' THEN
            FOR c IN SELECT unnest(ARRAY['A', 'B', 'C', 'D']) LOOP
                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                VALUES (f.id, '1' || c, 'first', 200);
            END LOOP;
        END IF;

        -- Economy Class: Rows 5-20, Seats A-F
        FOR r IN 5..20 LOOP
            FOR c IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                VALUES (f.id, r || c, 'economy', 0);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Create a test user (password: password123)
-- Note: This is a reference for manual insertion or via Supabase CLI
-- For local development with Supabase CLI:
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
-- VALUES ('d1b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3', 'test@flightm.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test User"}', 'authenticated', 'authenticated');
