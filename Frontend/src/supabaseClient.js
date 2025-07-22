
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://udwgnepkhnpalrqdmulk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkd2duZXBraG5wYWxycWRtdWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MTU4NzgsImV4cCI6MjA2MzI5MTg3OH0.2p977nZOV0ZxfbACD5pmO5W-o4ezSabjWSXQivPkrak';

export const supabase = createClient(supabaseUrl, supabaseKey);
