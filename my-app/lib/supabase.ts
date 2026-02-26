import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for file metadata
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}
