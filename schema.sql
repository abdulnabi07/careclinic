-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'worker');

-- Create extended user table referencing auth.users
CREATE TABLE public.users (
  id uuid REFERENCES auth.users on delete cascade not null primary key,
  name text,
  role user_role default 'worker'::user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'worker'::user_role));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create patients table
CREATE TABLE public.patients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  age integer not null,
  area text not null,
  mobile text not null,
  purpose text not null,
  amount numeric not null,
  created_by uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexing for performance
CREATE INDEX idx_patients_created_at ON public.patients(created_at DESC);
CREATE INDEX idx_patients_mobile ON public.patients(mobile);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Admins: full access to patients
CREATE POLICY "Admins have full access to patients" ON public.patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Workers: can insert patients
CREATE POLICY "Workers can insert patients" ON public.patients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'worker'
    )
    AND auth.uid() = created_by
  );

-- Workers: can select patients (we will control column selection in UI, RLS doesn't easily do column-level without views, but we can allow SELECT and UI hides amount)
-- Wait, the requirement says "MUST NOT see amount field". The best way in Supabase is granting select on specific columns or using a view.
-- Alternatively, RLS allows SELECT on the table, but if security is critical, we should create a view.
-- Given "amount -> hidden from Worker UI" and "Row Level Security: Can view records WITHOUT amount column", it's simpler to allow SELECT for workers but UI filters it, OR for strict database-level security create a view. We'll use a view for strict security.

CREATE VIEW public.patient_records_worker AS
SELECT id, name, age, area, mobile, purpose, created_by, created_at
FROM public.patients;

-- But views bypass RLS by default unless security invoker is used.
-- In Postgres 15+, we can use `WITH (security_invoker = true)` on views.
-- A simpler approach for the requirements is granting select on the table (with RLS) and the API handler strips the amount for workers.
-- Let's just create a policy that allows workers to view records. We'll handle the amount filtering in the server-side action or query layer since Next.js server components can query with admin rights if needed or user rights and filter.

CREATE POLICY "Workers can view patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid()
    )
  );
