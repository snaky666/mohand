
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
-- Create day_settings table for managing work days and capacity
-- ========================================
CREATE TABLE IF NOT EXISTS day_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  day_name_ar TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day_of_week)
);

-- Enable Row Level Security
ALTER TABLE day_settings ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة للجميع
CREATE POLICY "Enable read access for all users on day_settings" ON day_settings
  FOR SELECT USING (true);

-- السماح بالإضافة للجميع
CREATE POLICY "Enable insert for all users on day_settings" ON day_settings
  FOR INSERT WITH CHECK (true);

-- السماح بالتحديث للجميع
CREATE POLICY "Enable update for all users on day_settings" ON day_settings
  FOR UPDATE USING (true);

-- السماح بالحذف للجميع
CREATE POLICY "Enable delete for all users on day_settings" ON day_settings
  FOR DELETE USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_day_settings_updated_at ON day_settings;
CREATE TRIGGER update_day_settings_updated_at BEFORE UPDATE ON day_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default day settings
INSERT INTO day_settings (day_of_week, day_name_ar, capacity, is_active)
VALUES 
  (0, 'الأحد', 3, true),
  (1, 'الإثنين', 3, true),
  (2, 'الثلاثاء', 3, true),
  (3, 'الأربعاء', 0, false),
  (4, 'الخميس', 3, true),
  (5, 'الجمعة', 5, true),
  (6, 'السبت', 5, true)
ON CONFLICT (day_of_week) DO NOTHING;

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
