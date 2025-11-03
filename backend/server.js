 const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
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

// AI Generate Questions endpoint using Perplexity API
app.post("/api/generate-ai-questions", async (req, res) => {
  const { topic, count } = req.body;

  if (!topic || !count) {
    return res.status(400).json({ error: "Missing topic or count" });
  }

  try {
    const perplexityResponse = await axios.post(
      "https://api.perplexity.ai/v1/chat/completions", // Replace with Perplexity actual API endpoint if different
      {
        model: "perplexity/official-model", // Replace with Perplexity supported model name
        messages: [
          {
            role: "system",
            content: "You are a quiz master who generates multiple-choice questions.",
          },
          {
            role: "user",
            content: `Generate ${count} multiple-choice questions on the topic '${topic}'. Include 4 options for each question. Mark the correct option with '(Correct)'. Format each question as:\nQuestion: ...\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: (Correct) option letter`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
      }
    );

    res.json(perplexityResponse.data);
  } catch (error) {
    console.error("Perplexity API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
