// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://abrsewdzocdqvrdhfsvy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicnNld2R6b2NkcXZyZGhmc3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NzgwOTIsImV4cCI6MjA3NzU1NDA5Mn0._3xe-OvB_SuUetJLdZmaQaU35ACfJVIB-jvfz394pq0";

export const supabase = createClient(supabaseUrl, supabaseKey);
