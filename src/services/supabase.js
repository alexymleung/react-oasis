import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://ylguzcuguffejmdssohy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZ3V6Y3VndWZmZWptZHNzb2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3OTEyMjUsImV4cCI6MjA1ODM2NzIyNX0.S0Y4VSKE9-qoRpOuAlDOLUkgFV-t1-LiRq6hChv9PwM";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
