-- Supabase Database Setup for ⵎⵓⵃⵎⵎⴷ Barber Booking System
-- Run this SQL in your Supabase SQL Editor

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  day DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on day for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_day ON bookings(day);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON bookings;
DROP POLICY IF EXISTS "Allow public insert" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable insert access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable delete access for all users" ON bookings;
DROP POLICY IF EXISTS "Allow public read access" ON announcements;
DROP POLICY IF EXISTS "Enable read access for all users" ON announcements;
DROP POLICY IF EXISTS "Enable insert/update access for all users" ON announcements;
DROP POLICY IF EXISTS "Enable update access for all users" ON announcements;

-- Create SECURE policies for bookings
-- Users can read all bookings
CREATE POLICY "Allow public read access" ON bookings
  FOR SELECT USING (true);

-- Users can create new bookings
CREATE POLICY "Allow public insert" ON bookings
  FOR INSERT WITH CHECK (true);

-- Only service role can delete bookings (admin panel will use server endpoint)
-- No anonymous delete policy - deletion must go through authenticated server

-- Create SECURE policies for announcements
-- Users can read announcements
CREATE POLICY "Allow public read access" ON announcements
  FOR SELECT USING (true);

-- Only service role can insert/update announcements (admin panel will use server endpoint)
-- No anonymous insert/update policy - changes must go through authenticated server

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default announcement if none exists
INSERT INTO announcements (message)
SELECT 'مرحباً بكم في صالون ⵎⵓⵃⵎⵎⴷ barber! احجز موعدك الآن.'
WHERE NOT EXISTS (SELECT 1 FROM announcements);
