const express = require("express");
const router  = express.Router();
const Groq    = require("groq-sdk");
const { protect } = require("../middleware/auth");

router.post("/", protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const client = new Groq({
     apiKey: process.env.GROQ_API_KEY,
    });

    const messages = [
      {
        role: "system",
        content: `You are FasalAI, an expert farming assistant for Pakistani farmers.

STRICT LANGUAGE RULES:
- If user writes in ENGLISH → respond in ENGLISH only
- If user writes in URDU script (اردو) → respond in URDU only  
- If user writes in ROMAN URDU → respond in ROMAN URDU
- Always match the exact language of the user
- Never switch languages on your own

Your expertise:
- Crop diseases and treatments
- Fertilizers and pesticides
- Irrigation and water management
- Weather-based farming advice
- Pakistani crops: wheat, rice, cotton, sugarcane, maize, vegetables

Be helpful, practical and friendly. Keep answers concise.`,
      },
      ...history.map((h) => ({ role: h.role, content: h.text })),
      { role: "user", content: message },
    ];

    const response = await client.chat.completions.create({
      model:      "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1000,
    });

    const reply = response.choices[0].message.content;
    res.json({ success: true, reply });

  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ success: false, message: "AI service unavailable. Please try again." });
  }
});

module.exports = router;