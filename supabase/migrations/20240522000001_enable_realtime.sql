-- Enable Realtime for the seats table to support Task 02 requirements
-- This uses an idempotent block to avoid errors if already enabled
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'seats'
  ) then
    alter publication supabase_realtime add table seats;
  end if;
end $$;
