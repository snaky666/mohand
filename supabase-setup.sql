
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

-- حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "Allow public read access" ON bookings;
DROP POLICY IF EXISTS "Allow public insert" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable insert access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable delete access for all users" ON bookings;
DROP POLICY IF EXISTS "Allow public read access" ON announcements;
DROP POLICY IF EXISTS "Enable read access for all users" ON announcements;
DROP POLICY IF EXISTS "Enable insert/update access for all users" ON announcements;
DROP POLICY IF EXISTS "Enable update access for all users" ON announcements;
DROP POLICY IF EXISTS "Enable insert for all users on announcements" ON announcements;
DROP POLICY IF EXISTS "Enable update for all users on announcements" ON announcements;
DROP POLICY IF EXISTS "Enable read access for all users on announcements" ON announcements;

-- ========================================
-- سياسات جدول bookings
-- ========================================

-- السماح بالقراءة للجميع
CREATE POLICY "Enable read access for all users" ON bookings
  FOR SELECT USING (true);

-- السماح بالإضافة للجميع
CREATE POLICY "Enable insert for all users" ON bookings
  FOR INSERT WITH CHECK (true);

-- السماح بالحذف للجميع
CREATE POLICY "Enable delete for all users" ON bookings
  FOR DELETE USING (true);

-- ========================================
-- سياسات جدول announcements
-- ========================================

-- السماح بالقراءة للجميع
CREATE POLICY "Enable read access for all users on announcements" ON announcements
  FOR SELECT USING (true);

-- السماح بالإضافة للجميع
CREATE POLICY "Enable insert for all users on announcements" ON announcements
  FOR INSERT WITH CHECK (true);

-- السماح بالتحديث للجميع
CREATE POLICY "Enable update for all users on announcements" ON announcements
  FOR UPDATE USING (true);

-- السماح بالحذف للجميع
CREATE POLICY "Enable delete for all users on announcements" ON announcements
  FOR DELETE USING (true);

-- ========================================
-- Create function to update updated_at timestamp
-- ========================================
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

-- ========================================
-- Enable Realtime for instant updates
-- ========================================
-- Note: You also need to enable Realtime in your Supabase Dashboard:
-- 1. Go to Database > Replication
-- 2. Enable replication for 'bookings' table
-- 3. Enable replication for 'announcements' table
-- This allows the app to receive instant updates when data changes

-- Alternative: Run this in SQL Editor if you have proper permissions
-- ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
