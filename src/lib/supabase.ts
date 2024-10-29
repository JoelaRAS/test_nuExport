import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ablkgjbdtdxuqajglwpi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFibGtnamJkdGR4dXFhamdsd3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTYwNTk5NSwiZXhwIjoyMDQ1MTgxOTk1fQ.gSxDkO3d1DljyUTADog1ZJqddbcwmNpbALWNGO35EJs';
export const supabase = createClient(supabaseUrl, supabaseKey);
