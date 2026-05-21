-- Seed Flights
INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price)
VALUES 
    (uuid_generate_v4(), 'EK001', 'DXB', 'LHR', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 7 hours', 'Airbus A380', 800),
    (uuid_generate_v4(), 'EK002', 'DXB', 'LHR', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 7 hours', 'Airbus A380', 850),
    (uuid_generate_v4(), 'AA100', 'JFK', 'LAX', NOW() + INTERVAL '1 day 4 hours', NOW() + INTERVAL '1 day 10 hours', 'Boeing 777', 400),
    (uuid_generate_v4(), 'AA101', 'JFK', 'LAX', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 6 hours', 'Boeing 777', 420),
    (uuid_generate_v4(), 'SQ200', 'SIN', 'SYD', NOW() + INTERVAL '1 day 12 hours', NOW() + INTERVAL '1 day 20 hours', 'Airbus A350', 600),
    (uuid_generate_v4(), 'SQ201', 'SIN', 'SYD', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 8 hours', 'Airbus A350', 650),
    (uuid_generate_v4(), 'AF275', 'HND', 'CDG', NOW() + INTERVAL '1 day 2 hours', NOW() + INTERVAL '1 day 15 hours', 'Boeing 787', 900),
    (uuid_generate_v4(), 'AF276', 'HND', 'CDG', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 13 hours', 'Boeing 787', 950);

-- Function to seed seats for all flights
DO $$
DECLARE
    f RECORD;
    r INT;
    c CHAR;
    seat_class TEXT;
    fee NUMERIC;
BEGIN
    FOR f IN SELECT id FROM flights LOOP
        -- First Class: Row 1, Seats A-D
        FOR c IN SELECT unnest(ARRAY['A', 'B', 'C', 'D']) LOOP
            INSERT INTO seats (flight_id, seat_number, class, extra_fee)
            VALUES (f.id, '1' || c, 'first', 200);
        END LOOP;

        -- Business Class: Rows 2-4, Seats A-F
        FOR r IN 2..4 LOOP
            FOR c IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                VALUES (f.id, r || c, 'business', 100);
            END LOOP;
        END LOOP;

        -- Economy Class: Rows 5-20, Seats A-F
        FOR r IN 5..20 LOOP
            FOR c IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                VALUES (f.id, r || c, 'economy', 0);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
