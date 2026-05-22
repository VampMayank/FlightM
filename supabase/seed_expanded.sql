-- Clear existing dynamic data (optional, but good for a clean seed)
-- DELETE FROM reschedules;
-- DELETE FROM passengers;
-- DELETE FROM bookings;
-- DELETE FROM seats;
-- DELETE FROM flights;

-- Expanded Seed Data
DO $$
DECLARE
    origins TEXT[] := ARRAY['Dubai', 'London', 'New York', 'Los Angeles', 'Singapore', 'Sydney', 'Tokyo', 'Paris', 'Frankfurt'];
    destinations TEXT[] := ARRAY['Dubai', 'London', 'New York', 'Los Angeles', 'Singapore', 'Sydney', 'Tokyo', 'Paris', 'Frankfurt'];
    origin_codes TEXT[] := ARRAY['DXB', 'LHR', 'JFK', 'LAX', 'SIN', 'SYD', 'HND', 'CDG', 'FRA'];
    aircrafts TEXT[] := ARRAY['Airbus A380', 'Boeing 777', 'Airbus A350', 'Boeing 787', 'Boeing 747'];
    
    o_idx INT;
    d_idx INT;
    day_offset INT;
    hour_offset INT;
    flight_id UUID;
    f_no TEXT;
    
    r INT;
    c CHAR;
BEGIN
    -- Loop through origins
    FOR o_idx IN 1..array_length(origins, 1) LOOP
        -- Loop through destinations
        FOR d_idx IN 1..array_length(destinations, 1) LOOP
            
            -- Don't fly to the same city
            IF o_idx != d_idx THEN
                
                -- Create flights for the next 7 days
                FOR day_offset IN 0..7 LOOP
                    
                    -- Two flights per day per route
                    FOR hour_offset IN 1..2 LOOP
                        
                        flight_id := uuid_generate_v4();
                        f_no := origin_codes[o_idx] || origin_codes[d_idx] || (day_offset + 1) || hour_offset;
                        
                        INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price)
                        VALUES (
                            flight_id, 
                            f_no, 
                            origins[o_idx], 
                            destinations[d_idx], 
                            NOW() + (day_offset || ' days')::interval + (hour_offset * 6 || ' hours')::interval,
                            NOW() + (day_offset || ' days')::interval + (hour_offset * 6 + 8 || ' hours')::interval, -- 8 hour flat duration for seed
                            aircrafts[1 + (random() * 4)::int],
                            400 + (random() * 600)::int
                        );

                        -- Generate Seats for this flight
                        -- First Class: Row 1
                        FOR c IN SELECT unnest(ARRAY['A', 'B', 'C', 'D']) LOOP
                            INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                            VALUES (flight_id, '1' || c, 'first', 200);
                        END LOOP;

                        -- Business Class: Rows 2-3
                        FOR r IN 2..3 LOOP
                            FOR c IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
                                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                                VALUES (flight_id, r || c, 'business', 100);
                            END LOOP;
                        END LOOP;

                        -- Economy Class: Rows 4-10
                        FOR r IN 4..10 LOOP
                            FOR c IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
                                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                                VALUES (flight_id, r || c, 'economy', 0);
                            END LOOP;
                        END LOOP;

                    END LOOP;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END $$;
