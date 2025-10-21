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
-- إنشاء جدول إعدادات الأيام
CREATE TABLE IF NOT EXISTS public.day_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_name TEXT NOT NULL UNIQUE,
    day_number INTEGER NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 3,
    is_open BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل Row Level Security
ALTER TABLE public.day_settings ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "Allow public read access on day_settings"
    ON public.day_settings
    FOR SELECT
    USING (true);

-- إدراج البيانات الأولية للأيام
INSERT INTO public.day_settings (day_name, day_number, capacity, is_open)
VALUES 
    ('الأحد', 0, 3, true),
    ('الإثنين', 1, 3, true),
    ('الثلاثاء', 2, 3, true),
    ('الأربعاء', 3, 3, false),
    ('الخميس', 4, 3, false),
    ('الجمعة', 5, 5, true),
    ('السبت', 6, 5, true)
ON CONFLICT (day_name) DO NOTHING;

-- تفعيل Realtime للجداول
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.day_settings;