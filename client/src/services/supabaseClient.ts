import { createClient } from '@supabase/supabase-js';

// Valores por defecto para Supabase
const supabaseUrl = 'https://rydxryyigwntlkfeptdd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5ZHhyeXlpZ3dudGxrZmVwdGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzA2MjEsImV4cCI6MjA3MTgwNjYyMX0.Xy5L7NRf0pwzM3wqZOrekLpYY8EJzBAKWytPIDxQKyA';

// Solo usar variables de entorno si están disponibles (en el navegador)
let finalSupabaseUrl = supabaseUrl;
let finalSupabaseAnonKey = supabaseAnonKey;

if (typeof window !== 'undefined' && import.meta.env) {
  finalSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || supabaseUrl;
  finalSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey;
}

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey); 