// SUPABASE CONFIGURATION
// 
// SETUP INSTRUCTIONS:
// 1. Create a .env file in the root directory
// 2. Add your Supabase credentials:
//    VITE_SUPABASE_URL=your_supabase_url
//    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
// 
// Or for quick testing, replace the values below directly:

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

// DATABASE SCHEMA - Run this SQL in your Supabase SQL Editor:
/*

-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create participants table
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  choice VARCHAR(20),
  choice_timestamp TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_participants_room_id ON participants(room_id);
CREATE INDEX idx_rooms_code ON rooms(room_code);

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since this is an experiment)
CREATE POLICY "Allow public read access on rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rooms" ON rooms FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Allow public insert on participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on participants" ON participants FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on participants" ON participants FOR DELETE USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

*/
