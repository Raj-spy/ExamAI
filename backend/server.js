 const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase setup
const supabaseUrl = "https://abrsewdzocdqvrdhfsvy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicnNld2R6b2NkcXZyZGhmc3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NzgwOTIsImV4cCI6MjA3NzU1NDA5Mn0._3xe-OvB_SuUetJLdZmaQaU35ACfJVIB-jvfz394pq0";
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a new test endpoint
app.post("/api/tests", async (req, res) => {
  try {
    const { id, title, questions } = req.body;
    const { data, error } = await supabase.from("tests").insert([{ id, title, questions }]);
    if (error) throw error;
    console.log("✅ Test Created:", data);
    res.status(201).json({ message: "Test created successfully", data });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Join test endpoint
app.post("/api/tests/:id/join", async (req, res) => {
  try {
    const testId = req.params.id;
    const { name } = req.body;
    const { data, error } = await supabase.from("students").insert([{ name, test_id: testId }]);
    if (error) throw error;
    console.log(`👨‍🎓 ${name} joined test ${testId}`);
    res.json({ message: "Joined test successfully", data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
